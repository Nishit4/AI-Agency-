package com.timetracker.app.ui.exercise

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.timetracker.app.core.DateRange
import com.timetracker.app.core.Gamification
import com.timetracker.app.data.entity.Exercise
import com.timetracker.app.data.repository.ExerciseRepository
import com.timetracker.app.ui.common.UiFormat
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.ZoneId

data class ExerciseSummary(
    val workoutsThisWeek: Int = 0,
    val minutesThisWeek: Int = 0,
    val minutesToday: Int = 0,
)

sealed interface ExerciseEvent {
    data class Added(val xp: Int) : ExerciseEvent
    data class Deleted(val exercise: Exercise) : ExerciseEvent
}

class ExerciseViewModel(
    private val userId: Long,
    private val exerciseRepository: ExerciseRepository,
) : ViewModel() {

    val exercises: StateFlow<List<Exercise>> = exerciseRepository.observeAll(userId)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    val summary: StateFlow<ExerciseSummary> = exercises
        .map { list ->
            val zone = ZoneId.systemDefault()
            val today = LocalDate.now(zone)
            val week = DateRange.week(today, UiFormat.firstDayOfWeek())
            val day = DateRange.day(today)
            val thisWeek = list.filter { it.performedAt in week.startMillis(zone) until week.endMillis(zone) }
            val todayList = list.filter { it.performedAt in day.startMillis(zone) until day.endMillis(zone) }
            ExerciseSummary(
                workoutsThisWeek = thisWeek.size,
                minutesThisWeek = thisWeek.sumOf { it.durationMinutes },
                minutesToday = todayList.sumOf { it.durationMinutes },
            )
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), ExerciseSummary())

    private val _events = Channel<ExerciseEvent>(Channel.BUFFERED)
    val events: Flow<ExerciseEvent> = _events.receiveAsFlow()

    fun add(name: String, durationMinutes: Int, sets: Int, reps: Int) {
        viewModelScope.launch {
            exerciseRepository.add(
                Exercise(
                    userId = userId,
                    name = name.trim(),
                    durationMinutes = durationMinutes,
                    sets = sets,
                    reps = reps,
                )
            )
            _events.send(ExerciseEvent.Added(Gamification.XP_PER_EXERCISE))
        }
    }

    fun delete(exercise: Exercise) {
        viewModelScope.launch {
            exerciseRepository.delete(exercise)
            _events.send(ExerciseEvent.Deleted(exercise))
        }
    }

    fun restore(exercise: Exercise) {
        viewModelScope.launch { exerciseRepository.add(exercise) }
    }
}
