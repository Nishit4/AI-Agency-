package com.timemanager.app.ui.exercise

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.timemanager.app.data.ExerciseRepository
import com.timemanager.app.data.currentDate
import com.timemanager.core.exercise.ExerciseParser
import com.timemanager.core.model.Routine
import com.timemanager.core.model.RoutineExercise
import com.timemanager.core.model.WorkoutSession
import com.timemanager.core.time.Weeks
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.time.Clock
import java.time.LocalDate

data class RoutineUi(
    val routine: Routine,
    val exercises: List<RoutineExercise>,
    val timesThisWeek: Int,
    val lastDone: LocalDate?,
    val doneToday: Boolean,
)

data class SessionUi(val session: WorkoutSession, val routineName: String)

data class ExerciseUiState(
    val routines: List<RoutineUi> = emptyList(),
    val workoutsThisWeek: Int = 0,
    val minutesThisWeek: Int = 0,
    val recent: List<SessionUi> = emptyList(),
)

class ExerciseViewModel(private val repository: ExerciseRepository, clock: Clock) : ViewModel() {

    val uiState: StateFlow<ExerciseUiState> = combine(
        repository.routines,
        repository.exercises,
        repository.sessions,
        clock.currentDate(),
    ) { routines, exercises, sessions, today ->
        val weekStart = Weeks.startOf(today).toEpochDay()
        val thisWeek = sessions.filter { it.epochDay in weekStart..weekStart + 6 }
        val exercisesByRoutine = exercises.groupBy { it.routineId }
        val sessionsByRoutine = sessions.groupBy { it.routineId }
        val routineNames = routines.associate { it.id to it.name }
        ExerciseUiState(
            routines = routines.map { routine ->
                val routineSessions = sessionsByRoutine[routine.id].orEmpty()
                val lastDay = routineSessions.maxOfOrNull { it.epochDay }
                RoutineUi(
                    routine = routine,
                    exercises = exercisesByRoutine[routine.id].orEmpty(),
                    timesThisWeek = thisWeek.count { it.routineId == routine.id },
                    lastDone = lastDay?.let(LocalDate::ofEpochDay),
                    doneToday = lastDay == today.toEpochDay(),
                )
            },
            workoutsThisWeek = thisWeek.size,
            minutesThisWeek = thisWeek.sumOf { it.durationMinutes },
            recent = sessions.take(10).map { SessionUi(it, routineNames[it.routineId] ?: "Workout") },
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), ExerciseUiState())

    /** [exercisesText] holds one exercise per line, such as "Push-ups 3x12". */
    fun addRoutine(name: String, exercisesText: String) {
        viewModelScope.launch { repository.addRoutine(name.trim(), ExerciseParser.parseAll(exercisesText)) }
    }

    fun logWorkout(routine: Routine, minutes: Int) {
        viewModelScope.launch { repository.logWorkout(routine.id, minutes) }
    }

    fun deleteRoutine(routine: Routine) {
        viewModelScope.launch { repository.deleteRoutine(routine.id) }
    }

    fun deleteSession(session: WorkoutSession) {
        viewModelScope.launch { repository.deleteSession(session.id) }
    }
}
