package com.timetracker.app.ui.tasks

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.os.bundleOf
import androidx.core.view.isVisible
import androidx.core.widget.doAfterTextChanged
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.google.android.material.snackbar.Snackbar
import com.timetracker.app.R
import com.timetracker.app.data.entity.TaskPriority
import com.timetracker.app.databinding.BottomSheetTodoBinding
import com.timetracker.app.ui.common.Pickers
import com.timetracker.app.ui.common.UiFormat
import com.timetracker.app.ui.common.appViewModelFactory
import com.timetracker.app.ui.common.textValue
import kotlinx.coroutines.launch

/** Bottom sheet for adding a new task or editing an existing one. */
class BottomSheetToDo : BottomSheetDialogFragment() {

    private var _binding: BottomSheetTodoBinding? = null
    private val binding get() = _binding!!

    // Shares the task list's ViewModel; this sheet is always shown from TaskFragment.
    private val viewModel: TaskViewModel by viewModels(
        ownerProducer = { requireParentFragment() },
        factoryProducer = {
            appViewModelFactory { TaskViewModel(it.preferences.requireUserId(), it.taskRepository) }
        },
    )

    private val taskId: Long get() = requireArguments().getLong(ARG_TASK_ID)

    private var reminderAt: Long? = null

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = BottomSheetTodoBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val isNew = taskId == 0L
        binding.sheetTitle.setText(if (isNew) R.string.task_new else R.string.task_edit)

        if (savedInstanceState != null) {
            reminderAt = savedInstanceState.getLong(STATE_REMINDER, NO_REMINDER).takeIf { it != NO_REMINDER }
            renderReminder()
        } else if (isNew) {
            binding.priorityGroup.check(R.id.priorityMedium)
            renderReminder()
        } else {
            viewLifecycleOwner.lifecycleScope.launch {
                val task = viewModel.getTask(taskId) ?: return@launch dismiss()
                binding.titleInput.setText(task.title)
                binding.descriptionInput.setText(task.description)
                binding.priorityGroup.check(
                    when (task.priority) {
                        TaskPriority.LOW -> R.id.priorityLow
                        TaskPriority.MEDIUM -> R.id.priorityMedium
                        TaskPriority.HIGH -> R.id.priorityHigh
                    }
                )
                reminderAt = task.reminderAt
                renderReminder()
            }
        }

        binding.titleInput.doAfterTextChanged { binding.titleLayout.error = null }
        binding.reminderButton.setOnClickListener {
            Pickers.pickReminder(requireContext(), childFragmentManager, reminderAt) { time ->
                if (time > System.currentTimeMillis()) {
                    reminderAt = time
                    renderReminder()
                } else {
                    showReminderInPastError()
                }
            }
        }
        binding.clearReminderButton.setOnClickListener {
            reminderAt = null
            renderReminder()
        }
        binding.saveButton.setOnClickListener { save() }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        outState.putLong(STATE_REMINDER, reminderAt ?: NO_REMINDER)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private fun renderReminder() {
        val time = reminderAt
        binding.reminderButton.text = if (time == null) {
            getString(R.string.task_set_reminder)
        } else {
            UiFormat.dateTime(requireContext(), time)
        }
        binding.clearReminderButton.isVisible = time != null
    }

    private fun showReminderInPastError() {
        val root = _binding?.root ?: return
        Snackbar.make(root, R.string.error_reminder_in_past, Snackbar.LENGTH_SHORT).show()
    }

    private fun save() {
        val title = binding.titleLayout.textValue
        if (title.isEmpty()) {
            binding.titleLayout.error = getString(R.string.error_task_title_required)
            return
        }
        val priority = when (binding.priorityGroup.checkedButtonId) {
            R.id.priorityLow -> TaskPriority.LOW
            R.id.priorityHigh -> TaskPriority.HIGH
            else -> TaskPriority.MEDIUM
        }
        viewModel.saveTask(
            taskId = taskId,
            title = title,
            description = binding.descriptionLayout.textValue,
            priority = priority,
            reminderAt = reminderAt,
        )
        dismiss()
    }

    companion object {
        const val TAG = "BottomSheetToDo"
        private const val ARG_TASK_ID = "task_id"
        private const val STATE_REMINDER = "reminder_at"
        private const val NO_REMINDER = -1L

        fun newInstance(taskId: Long) = BottomSheetToDo().apply {
            arguments = bundleOf(ARG_TASK_ID to taskId)
        }
    }
}
