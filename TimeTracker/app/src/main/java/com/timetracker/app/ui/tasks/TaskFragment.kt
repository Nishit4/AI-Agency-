package com.timetracker.app.ui.tasks

import android.os.Bundle
import android.view.View
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import com.google.android.material.snackbar.Snackbar
import com.timetracker.app.R
import com.timetracker.app.core.Gamification
import com.timetracker.app.databinding.FragmentTaskBinding
import com.timetracker.app.ui.common.Pickers
import com.timetracker.app.ui.common.appViewModelFactory
import com.timetracker.app.ui.common.collectWhenStarted

/** To-do list with priorities and reminder alarms. */
class TaskFragment : Fragment(R.layout.fragment_task) {

    private var _binding: FragmentTaskBinding? = null
    private val binding get() = _binding!!

    private val viewModel: TaskViewModel by viewModels {
        appViewModelFactory { TaskViewModel(it.preferences.requireUserId(), it.taskRepository) }
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        _binding = FragmentTaskBinding.bind(view)

        val adapter = TaskAdapter(
            onToggleDone = viewModel::setDone,
            onEdit = { openEditor(it.id) },
            onReminder = { task ->
                Pickers.pickReminder(requireContext(), childFragmentManager, task.reminderAt) { time ->
                    viewModel.setReminder(task, time)
                }
            },
            onDelete = viewModel::delete,
        )
        binding.taskList.adapter = adapter

        binding.filterGroup.setOnCheckedStateChangeListener { _, checkedIds ->
            val filter = when (checkedIds.firstOrNull()) {
                R.id.filterPending -> TaskFilter.PENDING
                R.id.filterDone -> TaskFilter.DONE
                else -> TaskFilter.ALL
            }
            viewModel.setFilter(filter)
        }
        binding.addTaskFab.setOnClickListener { openEditor(0L) }

        val owner = viewLifecycleOwner
        owner.collectWhenStarted(viewModel.state) { state ->
            adapter.submitList(state.tasks)
            binding.summary.text = getString(R.string.task_summary, state.pendingCount, state.doneCount)
            binding.emptyView.isVisible = state.tasks.isEmpty()
            binding.emptyText.setText(
                when (state.filter) {
                    TaskFilter.ALL -> R.string.task_empty_all
                    TaskFilter.PENDING -> R.string.task_empty_pending
                    TaskFilter.DONE -> R.string.task_empty_done
                }
            )
        }
        owner.collectWhenStarted(viewModel.events) { event ->
            when (event) {
                is TaskEvent.Deleted ->
                    Snackbar.make(binding.root, R.string.task_deleted, Snackbar.LENGTH_LONG)
                        .setAnchorView(binding.addTaskFab)
                        .setAction(R.string.action_undo) { viewModel.restore(event.task) }
                        .show()
                TaskEvent.Completed ->
                    Snackbar.make(
                        binding.root,
                        getString(R.string.task_completed_xp, Gamification.XP_PER_TASK_DONE),
                        Snackbar.LENGTH_SHORT,
                    ).setAnchorView(binding.addTaskFab).show()
                TaskEvent.ReminderInPast ->
                    Snackbar.make(binding.root, R.string.error_reminder_in_past, Snackbar.LENGTH_SHORT)
                        .setAnchorView(binding.addTaskFab)
                        .show()
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private fun openEditor(taskId: Long) {
        BottomSheetToDo.newInstance(taskId).show(childFragmentManager, BottomSheetToDo.TAG)
    }
}
