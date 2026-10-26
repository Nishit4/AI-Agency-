package com.timetracker.app.ui.exercise

import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AlertDialog
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.snackbar.Snackbar
import com.timetracker.app.R
import com.timetracker.app.databinding.DialogExerciseBinding
import com.timetracker.app.databinding.FragmentExerciseBinding
import com.timetracker.app.ui.common.appViewModelFactory
import com.timetracker.app.ui.common.collectWhenStarted
import com.timetracker.app.ui.common.textValue

/** Exercise routine log with a weekly summary. */
class ExerciseFragment : Fragment(R.layout.fragment_exercise) {

    private var _binding: FragmentExerciseBinding? = null
    private val binding get() = _binding!!

    private val viewModel: ExerciseViewModel by viewModels {
        appViewModelFactory { ExerciseViewModel(it.preferences.requireUserId(), it.exerciseRepository) }
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        _binding = FragmentExerciseBinding.bind(view)

        val adapter = ExerciseAdapter(onDelete = viewModel::delete)
        binding.exerciseList.adapter = adapter
        binding.addExerciseFab.setOnClickListener { showAddDialog() }

        val owner = viewLifecycleOwner
        owner.collectWhenStarted(viewModel.exercises) { exercises ->
            adapter.submitList(exercises)
            binding.emptyView.isVisible = exercises.isEmpty()
        }
        owner.collectWhenStarted(viewModel.summary) { summary ->
            binding.weekWorkouts.text = summary.workoutsThisWeek.toString()
            binding.weekMinutes.text = summary.minutesThisWeek.toString()
            binding.todayMinutes.text = summary.minutesToday.toString()
        }
        owner.collectWhenStarted(viewModel.events) { event ->
            when (event) {
                is ExerciseEvent.Added ->
                    Snackbar.make(binding.root, getString(R.string.exercise_added_xp, event.xp), Snackbar.LENGTH_SHORT)
                        .setAnchorView(binding.addExerciseFab)
                        .show()
                is ExerciseEvent.Deleted ->
                    Snackbar.make(binding.root, R.string.exercise_deleted, Snackbar.LENGTH_LONG)
                        .setAnchorView(binding.addExerciseFab)
                        .setAction(R.string.action_undo) { viewModel.restore(event.exercise) }
                        .show()
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private fun showAddDialog() {
        val dialogBinding = DialogExerciseBinding.inflate(layoutInflater)
        dialogBinding.nameInput.setSimpleItems(resources.getStringArray(R.array.exercise_suggestions))

        val dialog = MaterialAlertDialogBuilder(requireContext())
            .setTitle(R.string.exercise_new)
            .setView(dialogBinding.root)
            .setPositiveButton(R.string.action_save, null)
            .setNegativeButton(R.string.action_cancel, null)
            .show()
        dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener {
            val name = dialogBinding.nameLayout.textValue
            val minutes = dialogBinding.durationLayout.textValue.toIntOrNull()
            val sets = dialogBinding.setsLayout.textValue.toIntOrNull() ?: 0
            val reps = dialogBinding.repsLayout.textValue.toIntOrNull() ?: 0
            dialogBinding.nameLayout.error = null
            dialogBinding.durationLayout.error = null
            when {
                name.isEmpty() -> dialogBinding.nameLayout.error = getString(R.string.error_required)
                minutes == null || minutes !in 1..MAX_MINUTES ->
                    dialogBinding.durationLayout.error = getString(R.string.error_exercise_minutes, MAX_MINUTES)
                else -> {
                    viewModel.add(name, minutes, sets, reps)
                    dialog.dismiss()
                }
            }
        }
    }

    private companion object {
        const val MAX_MINUTES = 600
    }
}
