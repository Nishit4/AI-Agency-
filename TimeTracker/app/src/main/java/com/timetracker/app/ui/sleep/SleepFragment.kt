package com.timetracker.app.ui.sleep

import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AlertDialog
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.snackbar.Snackbar
import com.timetracker.app.R
import com.timetracker.app.core.SleepMath
import com.timetracker.app.core.TimeFormat
import com.timetracker.app.databinding.DialogSleepBinding
import com.timetracker.app.databinding.FragmentSleepBinding
import com.timetracker.app.ui.common.Pickers
import com.timetracker.app.ui.common.UiFormat
import com.timetracker.app.ui.common.appViewModelFactory
import com.timetracker.app.ui.common.collectWhenStarted
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import java.util.Locale

/** Sleep log: when the user went to bed, woke up and how well they slept. */
class SleepFragment : Fragment(R.layout.fragment_sleep) {

    private var _binding: FragmentSleepBinding? = null
    private val binding get() = _binding!!

    private val viewModel: SleepViewModel by viewModels {
        appViewModelFactory { SleepViewModel(it.preferences.requireUserId(), it.sleepRepository) }
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        _binding = FragmentSleepBinding.bind(view)

        val adapter = SleepAdapter(onDelete = viewModel::delete)
        binding.sleepList.adapter = adapter
        binding.addSleepFab.setOnClickListener { showAddDialog() }

        val owner = viewLifecycleOwner
        owner.collectWhenStarted(viewModel.logs) { logs ->
            adapter.submitList(logs)
            binding.emptyView.isVisible = logs.isEmpty()
        }
        owner.collectWhenStarted(viewModel.summary) { summary ->
            val none = getString(R.string.value_none)
            binding.lastNight.text = summary.lastNightMs?.let(TimeFormat::duration) ?: none
            binding.weekAverage.text = summary.weekAverageMs?.let(TimeFormat::duration) ?: none
            binding.weekQuality.text = summary.weekAverageQuality?.let { String.format(Locale.getDefault(), "%.1f ★", it) } ?: none
        }
        owner.collectWhenStarted(viewModel.events) { event ->
            when (event) {
                is SleepEvent.Deleted ->
                    Snackbar.make(binding.root, R.string.sleep_deleted, Snackbar.LENGTH_LONG)
                        .setAnchorView(binding.addSleepFab)
                        .setAction(R.string.action_undo) { viewModel.restore(event.log) }
                        .show()
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private fun showAddDialog() {
        val context = requireContext()
        val dialogBinding = DialogSleepBinding.inflate(layoutInflater)
        var wakeDate = LocalDate.now()
        var bedtime = DEFAULT_BEDTIME
        var wakeTime = DEFAULT_WAKE_TIME

        fun refresh() {
            dialogBinding.wakeDateButton.text = getString(R.string.sleep_woke_up_on, UiFormat.shortDate(wakeDate))
            dialogBinding.bedtimeButton.text = UiFormat.time(context, bedtime)
            dialogBinding.wakeTimeButton.text = UiFormat.time(context, wakeTime)
            val (start, end) = SleepMath.interval(wakeDate, bedtime, wakeTime, ZoneId.systemDefault())
            val valid = SleepMath.isValidDuration(end - start)
            dialogBinding.durationText.text = if (valid) {
                getString(R.string.sleep_duration, TimeFormat.duration(end - start))
            } else {
                getString(R.string.error_sleep_duration)
            }
        }
        refresh()

        dialogBinding.wakeDateButton.setOnClickListener {
            Pickers.pickDate(childFragmentManager, wakeDate, R.string.sleep_pick_wake_date) {
                wakeDate = it
                refresh()
            }
        }
        dialogBinding.bedtimeButton.setOnClickListener {
            Pickers.pickTime(context, childFragmentManager, bedtime, R.string.sleep_bedtime) {
                bedtime = it
                refresh()
            }
        }
        dialogBinding.wakeTimeButton.setOnClickListener {
            Pickers.pickTime(context, childFragmentManager, wakeTime, R.string.sleep_wake_time) {
                wakeTime = it
                refresh()
            }
        }

        val dialog = MaterialAlertDialogBuilder(context)
            .setTitle(R.string.sleep_new)
            .setView(dialogBinding.root)
            .setPositiveButton(R.string.action_save, null)
            .setNegativeButton(R.string.action_cancel, null)
            .show()
        dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener {
            val saved = viewModel.add(
                wakeDate = wakeDate,
                bedtime = bedtime,
                wakeTime = wakeTime,
                quality = dialogBinding.qualityBar.rating.toInt(),
                note = dialogBinding.noteInput.text?.toString().orEmpty(),
            )
            if (saved) dialog.dismiss()
        }
    }

    private companion object {
        val DEFAULT_BEDTIME: LocalTime = LocalTime.of(23, 0)
        val DEFAULT_WAKE_TIME: LocalTime = LocalTime.of(7, 0)
    }
}
