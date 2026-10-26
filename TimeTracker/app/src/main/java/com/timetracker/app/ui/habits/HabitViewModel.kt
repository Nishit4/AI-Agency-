package com.timetracker.app.ui.habits

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.timetracker.app.core.Gamification
import com.timetracker.app.core.LevelInfo
import com.timetracker.app.data.entity.Habit
import com.timetracker.app.data.repository.HabitRepository
import com.timetracker.app.data.repository.StatsRepository
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.time.LocalDate

data class HabitItem(val habit: Habit, val progress: Int, val streak: Int) {
    val isComplete: Boolean get() = progress >= habit.target
}

sealed interface HabitEvent {
    data class PartDone(val xp: Int) : HabitEvent
    data class HabitCompleted(val name: String, val xp: Int) : HabitEvent
}

@OptIn(ExperimentalCoroutinesApi::class)
class HabitViewModel(
    private val userId: Long,
    private val habitRepository: HabitRepository,
    statsRepository: StatsRepository,
) : ViewModel() {

    private val today = MutableStateFlow(LocalDate.now().toEpochDay())

    val habits: StateFlow<List<HabitItem>> = today
        .flatMapLatest { day ->
            combine(
                habitRepository.observeWithProgress(userId, day),
                habitRepository.observeCompletedDays(userId),
            ) { habits, completedDays ->
                val daysByHabit = completedDays.groupBy({ it.habitId }, { it.day }).mapValues { it.value.toSet() }
                habits.map {
                    HabitItem(
                        habit = it.habit,
                        progress = it.progress,
                        streak = Gamification.currentStreak(daysByHabit[it.habit.id].orEmpty(), day),
                    )
                }
            }
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    val level: StateFlow<LevelInfo?> = statsRepository.observeLevel(userId)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)

    private val _events = Channel<HabitEvent>(Channel.BUFFERED)
    val events: Flow<HabitEvent> = _events.receiveAsFlow()

    fun refreshDay() {
        today.value = LocalDate.now().toEpochDay()
    }

    fun addPart(item: HabitItem) {
        viewModelScope.launch {
            val change = habitRepository.changeProgress(item.habit, today.value, +1)
            val xp = change.partsAdded * Gamification.XP_PER_HABIT_PART
            when {
                change.justCompleted ->
                    _events.send(HabitEvent.HabitCompleted(item.habit.name, xp + Gamification.XP_PER_HABIT_COMPLETED))
                change.partsAdded > 0 -> _events.send(HabitEvent.PartDone(xp))
            }
        }
    }

    fun removePart(item: HabitItem) {
        viewModelScope.launch { habitRepository.changeProgress(item.habit, today.value, -1) }
    }

    fun resetToday(item: HabitItem) {
        viewModelScope.launch { habitRepository.resetDay(item.habit, today.value) }
    }

    fun addHabit(name: String, target: Int) {
        viewModelScope.launch { habitRepository.add(userId, name, target) }
    }

    fun updateHabit(habit: Habit, name: String, target: Int) {
        viewModelScope.launch { habitRepository.update(habit.copy(name = name.trim(), target = target)) }
    }

    fun deleteHabit(habit: Habit) {
        viewModelScope.launch { habitRepository.delete(habit) }
    }
}
