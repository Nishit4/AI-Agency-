package com.timetracker.app.ui.habits

import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.widget.PopupMenu
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.snackbar.Snackbar
import com.timetracker.app.R
import com.timetracker.app.core.Gamification
import com.timetracker.app.core.LevelInfo
import com.timetracker.app.data.entity.Habit
import com.timetracker.app.databinding.DialogHabitBinding
import com.timetracker.app.databinding.FragmentHabitBinding
import com.timetracker.app.ui.common.appViewModelFactory
import com.timetracker.app.ui.common.collectWhenStarted
import com.timetracker.app.ui.common.confirm
import com.timetracker.app.ui.common.levelTitleRes
import com.timetracker.app.ui.common.textValue

/**
 * Habit tracker. Each habit is split into small parts (e.g. 8 glasses of water); every part done
 * earns XP and finishing a habit for the day earns a bonus, which raises the user's level.
 */
class HabitFragment : Fragment(R.layout.fragment_habit) {

    private var _binding: FragmentHabitBinding? = null
    private val binding get() = _binding!!

    private val viewModel: HabitViewModel by viewModels {
        appViewModelFactory {
            HabitViewModel(it.preferences.requireUserId(), it.habitRepository, it.statsRepository)
        }
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        _binding = FragmentHabitBinding.bind(view)

        val adapter = HabitAdapter(
            onAddPart = viewModel::addPart,
            onRemovePart = viewModel::removePart,
            onMore = ::showHabitMenu,
        )
        binding.habitList.adapter = adapter
        binding.xpRules.text = getString(
            R.string.habit_xp_rules,
            Gamification.XP_PER_HABIT_PART,
            Gamification.XP_PER_HABIT_COMPLETED,
        )
        binding.addHabitFab.setOnClickListener { showHabitDialog(null) }

        val owner = viewLifecycleOwner
        owner.collectWhenStarted(viewModel.habits) { habits ->
            adapter.submitList(habits)
            binding.emptyView.isVisible = habits.isEmpty()
            binding.todaySummary.text = getString(
                R.string.habit_today_summary,
                habits.count { it.isComplete },
                habits.size,
            )
        }
        owner.collectWhenStarted(viewModel.level) { level -> if (level != null) renderLevel(level) }
        owner.collectWhenStarted(viewModel.events) { event ->
            val message = when (event) {
                is HabitEvent.PartDone -> getString(R.string.habit_part_done_xp, event.xp)
                is HabitEvent.HabitCompleted -> getString(R.string.habit_completed_xp, event.name, event.xp)
            }
            Snackbar.make(binding.root, message, Snackbar.LENGTH_SHORT).setAnchorView(binding.addHabitFab).show()
        }
    }

    override fun onStart() {
        super.onStart()
        viewModel.refreshDay()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private fun renderLevel(level: LevelInfo) {
        binding.levelBadge.text = level.level.toString()
        binding.levelTitle.text = getString(R.string.habit_level_title, level.level, getString(level.title.levelTitleRes()))
        binding.xpText.text = getString(R.string.habit_xp_progress, level.xpIntoLevel, level.xpForNextLevel, level.level + 1)
        binding.totalXp.text = getString(R.string.habit_total_xp, level.totalXp)
        binding.xpProgress.setProgressCompat(level.progressPercent, true)
    }

    private fun showHabitMenu(item: HabitItem, anchor: View) {
        PopupMenu(requireContext(), anchor).apply {
            inflate(R.menu.menu_habit_item)
            setOnMenuItemClickListener { menuItem ->
                when (menuItem.itemId) {
                    R.id.action_edit_habit -> showHabitDialog(item.habit)
                    R.id.action_reset_today -> viewModel.resetToday(item)
                    R.id.action_delete_habit -> confirm(
                        R.string.habit_delete_title,
                        getString(R.string.habit_delete_message, item.habit.name),
                        R.string.action_delete,
                    ) { viewModel.deleteHabit(item.habit) }
                }
                true
            }
            show()
        }
    }

    /** Add (habit == null) or edit a habit. */
    private fun showHabitDialog(habit: Habit?) {
        val dialogBinding = DialogHabitBinding.inflate(layoutInflater)
        dialogBinding.nameInput.setText(habit?.name.orEmpty())
        dialogBinding.targetInput.setText((habit?.target ?: DEFAULT_PARTS).toString())

        val dialog = MaterialAlertDialogBuilder(requireContext())
            .setTitle(if (habit == null) R.string.habit_new else R.string.habit_edit)
            .setView(dialogBinding.root)
            .setPositiveButton(R.string.action_save, null)
            .setNegativeButton(R.string.action_cancel, null)
            .show()
        dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener {
            val name = dialogBinding.nameLayout.textValue
            val target = dialogBinding.targetLayout.textValue.toIntOrNull()
            dialogBinding.nameLayout.error = null
            dialogBinding.targetLayout.error = null
            when {
                name.isEmpty() -> dialogBinding.nameLayout.error = getString(R.string.error_required)
                target == null || target !in 1..MAX_PARTS ->
                    dialogBinding.targetLayout.error = getString(R.string.error_habit_parts, MAX_PARTS)
                else -> {
                    if (habit == null) viewModel.addHabit(name, target) else viewModel.updateHabit(habit, name, target)
                    dialog.dismiss()
                }
            }
        }
    }

    private companion object {
        const val DEFAULT_PARTS = 4
        const val MAX_PARTS = 50
    }
}
