package com.timetracker.app.ui.tracker

import android.content.res.ColorStateList
import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AlertDialog
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.snackbar.Snackbar
import com.timetracker.app.R
import com.timetracker.app.appContainer
import com.timetracker.app.core.DateUtils
import com.timetracker.app.core.TimeFormat
import com.timetracker.app.databinding.DialogManualEntryBinding
import com.timetracker.app.databinding.FragmentTimeTrackerBinding
import com.timetracker.app.service.StopwatchState
import com.timetracker.app.ui.common.Pickers
import com.timetracker.app.ui.common.UiFormat
import com.timetracker.app.ui.common.appViewModelFactory
import com.timetracker.app.ui.common.collectWhenStarted
import com.timetracker.app.ui.common.confirm
import com.timetracker.app.ui.common.showTextInputDialog
import com.timetracker.app.ui.common.textValue
import com.timetracker.app.ui.common.themeColor
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import com.google.android.material.R as MaterialR

/** Stopwatch page: time an activity, split it into laps and see today's records. */
class TimeTrackerFragment : Fragment(R.layout.fragment_time_tracker) {

    private var _binding: FragmentTimeTrackerBinding? = null
    private val binding get() = _binding!!

    private val viewModel: TimeTrackerViewModel by viewModels {
        appViewModelFactory {
            TimeTrackerViewModel(it.preferences.requireUserId(), it.stopwatch, it.timeLogRepository, it.taskRepository)
        }
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        _binding = FragmentTimeTrackerBinding.bind(view)

        val adapter = TimeLogAdapter(onDelete = viewModel::delete)
        binding.logList.adapter = adapter
        binding.dateText.text = UiFormat.longDate(LocalDate.now())

        // Restore the activity name if the app was closed while the stopwatch was running.
        val state = viewModel.stopwatchState.value
        if (state.isRunning && binding.activityInput.text.isNullOrEmpty()) {
            binding.activityInput.setText(state.activity, false)
        }

        binding.startStopButton.setOnClickListener {
            if (viewModel.stopwatchState.value.isRunning) {
                withActivityName(viewModel::stop)
            } else {
                viewModel.start(currentActivity())
            }
        }
        binding.lapButton.setOnClickListener { withActivityName(viewModel::lap) }
        binding.resetButton.setOnClickListener {
            confirm(R.string.reset_title, getString(R.string.reset_message), R.string.action_reset) {
                viewModel.reset()
            }
        }
        binding.addManualButton.setOnClickListener { showManualEntryDialog() }

        val owner = viewLifecycleOwner
        owner.collectWhenStarted(viewModel.stopwatchState) { renderStopwatch(it) }
        owner.collectWhenStarted(viewModel.elapsed) { binding.timerText.text = TimeFormat.stopwatch(it) }
        owner.collectWhenStarted(viewModel.todayLogs) { logs ->
            adapter.submitList(logs)
            binding.emptyText.isVisible = logs.isEmpty()
        }
        owner.collectWhenStarted(viewModel.todayTotal) {
            binding.todayTotal.text = getString(R.string.tracker_today_total, TimeFormat.duration(it))
        }
        owner.collectWhenStarted(viewModel.taskSuggestions) { tasks ->
            binding.activityInput.setSimpleItems(tasks.map { it.title }.distinct().toTypedArray())
        }
        owner.collectWhenStarted(viewModel.events) { handleEvent(it) }
    }

    override fun onStart() {
        super.onStart()
        viewModel.refreshDay()
        requireContext().appContainer.stopwatch.ensureServiceRunning()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private fun currentActivity(): String = binding.activityInput.text?.toString()?.trim().orEmpty()

    /** Runs [action] with the activity name, asking for one first if the field is empty. */
    private fun withActivityName(action: (String) -> Unit) {
        val name = currentActivity()
        if (name.isNotEmpty()) {
            action(name)
            return
        }
        showTextInputDialog(title = R.string.tracker_name_dialog_title, hint = R.string.tracker_activity_hint) { entered ->
            _binding?.activityInput?.setText(entered, false)
            action(entered)
        }
    }

    private fun renderStopwatch(state: StopwatchState) {
        val context = requireContext()
        val button = binding.startStopButton
        if (state.isRunning) {
            button.setText(R.string.action_stop)
            button.setIconResource(R.drawable.ic_stop)
            button.backgroundTintList = ColorStateList.valueOf(context.themeColor(MaterialR.attr.colorError))
            button.setTextColor(context.themeColor(MaterialR.attr.colorOnError))
            button.iconTint = ColorStateList.valueOf(context.themeColor(MaterialR.attr.colorOnError))
            binding.startedAtText.text = getString(R.string.tracker_started_at, UiFormat.time(context, state.startedAt))
        } else {
            button.setText(R.string.action_start)
            button.setIconResource(R.drawable.ic_play)
            button.backgroundTintList = ColorStateList.valueOf(context.themeColor(MaterialR.attr.colorPrimary))
            button.setTextColor(context.themeColor(MaterialR.attr.colorOnPrimary))
            button.iconTint = ColorStateList.valueOf(context.themeColor(MaterialR.attr.colorOnPrimary))
            binding.timerText.text = TimeFormat.stopwatch(0)
        }
        binding.startedAtText.isVisible = state.isRunning
        binding.lapButton.isEnabled = state.isRunning
        binding.resetButton.isEnabled = state.isRunning
    }

    private fun handleEvent(event: TrackerEvent) {
        when (event) {
            is TrackerEvent.Saved -> Snackbar.make(
                binding.root,
                getString(R.string.tracker_saved, event.activity, TimeFormat.duration(event.durationMs)),
                Snackbar.LENGTH_SHORT,
            ).show()
            TrackerEvent.TooShort ->
                Snackbar.make(binding.root, R.string.tracker_too_short, Snackbar.LENGTH_SHORT).show()
            is TrackerEvent.Deleted ->
                Snackbar.make(binding.root, R.string.record_deleted, Snackbar.LENGTH_LONG)
                    .setAction(R.string.action_undo) { viewModel.restore(event.log) }
                    .show()
        }
    }

    private fun showManualEntryDialog() {
        val context = requireContext()
        val dialogBinding = DialogManualEntryBinding.inflate(layoutInflater)
        val now = LocalTime.now().withSecond(0).withNano(0)
        var date = LocalDate.now()
        var start = now.minusHours(1)
        var end = now

        fun refresh() {
            dialogBinding.dateButton.text = UiFormat.shortDate(date)
            dialogBinding.startButton.text = UiFormat.time(context, start)
            dialogBinding.endButton.text = UiFormat.time(context, end)
            dialogBinding.timeError.isVisible = false
        }
        refresh()
        dialogBinding.activityInput.setText(currentActivity())

        dialogBinding.dateButton.setOnClickListener {
            Pickers.pickDate(childFragmentManager, date, R.string.manual_entry_date) {
                date = it
                refresh()
            }
        }
        dialogBinding.startButton.setOnClickListener {
            Pickers.pickTime(context, childFragmentManager, start, R.string.manual_entry_start) {
                start = it
                refresh()
            }
        }
        dialogBinding.endButton.setOnClickListener {
            Pickers.pickTime(context, childFragmentManager, end, R.string.manual_entry_end) {
                end = it
                refresh()
            }
        }

        val dialog = MaterialAlertDialogBuilder(context)
            .setTitle(R.string.manual_entry_title)
            .setView(dialogBinding.root)
            .setPositiveButton(R.string.action_save, null)
            .setNegativeButton(R.string.action_cancel, null)
            .show()
        dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener {
            val name = dialogBinding.activityLayout.textValue
            when {
                name.isEmpty() -> dialogBinding.activityLayout.error = getString(R.string.error_required)
                !end.isAfter(start) -> dialogBinding.timeError.isVisible = true
                else -> {
                    val zone = ZoneId.systemDefault()
                    viewModel.addManualEntry(
                        name,
                        DateUtils.toEpochMillis(date, start, zone),
                        DateUtils.toEpochMillis(date, end, zone),
                    )
                    dialog.dismiss()
                }
            }
        }
    }
}
