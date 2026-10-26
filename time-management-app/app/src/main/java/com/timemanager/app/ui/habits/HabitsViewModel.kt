package com.timemanager.app.ui.habits

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.timemanager.app.data.HabitRepository
import com.timemanager.app.data.ProgressRepository
import com.timemanager.app.data.currentDate
import com.timemanager.core.gamification.Gamification
import com.timemanager.core.gamification.LevelInfo
import com.timemanager.core.habit.HabitProgress
import com.timemanager.core.model.Habit
import com.timemanager.core.model.HabitStep
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.time.Clock
import java.time.LocalDate

data class StepUi(val step: HabitStep, val checkedToday: Boolean)

data class HabitUi(
    val habit: Habit,
    val steps: List<StepUi>,
    val progressToday: Float,
    val doneToday: Boolean,
    val currentStreak: Int,
    val bestStreak: Int,
)

data class HabitsUiState(
    val habits: List<HabitUi> = emptyList(),
    val level: LevelInfo = Gamification.levelFor(0),
)

class HabitsViewModel(
    private val repository: HabitRepository,
    progress: ProgressRepository,
    private val clock: Clock,
) : ViewModel() {

    val uiState: StateFlow<HabitsUiState> = combine(
        repository.habits,
        repository.steps,
        repository.checks,
        progress.level,
        clock.currentDate(),
    ) { habits, steps, checks, level, today ->
        val day = today.toEpochDay()
        val stepsByHabit = steps.groupBy { it.habitId }
        val checksByHabit = checks.groupBy { it.habitId }
        HabitsUiState(
            habits = habits.map { habit ->
                val habitSteps = stepsByHabit[habit.id].orEmpty()
                val habitChecks = checksByHabit[habit.id].orEmpty()
                val checkedToday = habitChecks.filter { it.epochDay == day }.mapTo(HashSet()) { it.stepId }
                val completedDays = HabitProgress.completedDays(habitSteps, habitChecks)
                HabitUi(
                    habit = habit,
                    steps = habitSteps.map { StepUi(it, it.id in checkedToday) },
                    progressToday = HabitProgress.dayProgress(habitSteps, habitChecks, day),
                    doneToday = day in completedDays,
                    currentStreak = HabitProgress.currentStreak(completedDays, day),
                    bestStreak = HabitProgress.bestStreak(completedDays),
                )
            },
            level = level,
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), HabitsUiState())

    fun setStepChecked(step: HabitStep, checked: Boolean) {
        val today = LocalDate.now(clock).toEpochDay()
        viewModelScope.launch { repository.setStepChecked(step.habitId, step.id, today, checked) }
    }

    /** [stepsText] holds one step per line; with no steps the habit becomes a single step. */
    fun add(name: String, stepsText: String) {
        val habitName = name.trim()
        val steps = stepsText.lines().map { it.trim() }.filter { it.isNotEmpty() }.ifEmpty { listOf(habitName) }
        viewModelScope.launch { repository.add(habitName, steps) }
    }

    fun delete(habit: Habit) {
        viewModelScope.launch { repository.delete(habit.id) }
    }
}
