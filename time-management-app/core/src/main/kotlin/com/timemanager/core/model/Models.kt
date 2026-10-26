package com.timemanager.core.model

/** A block of tracked time. [endMillis] is null while the timer is still running. */
data class TimeEntry(
    val id: Long = 0,
    val category: String,
    val note: String = "",
    val startMillis: Long,
    val endMillis: Long? = null,
) {
    val isRunning: Boolean get() = endMillis == null

    fun durationMillis(nowMillis: Long): Long = ((endMillis ?: nowMillis) - startMillis).coerceAtLeast(0)
}

enum class Priority { LOW, MEDIUM, HIGH }

data class TaskItem(
    val id: Long = 0,
    val title: String,
    val notes: String = "",
    val priority: Priority = Priority.MEDIUM,
    val dueEpochDay: Long? = null,
    val isDone: Boolean = false,
    val createdAtMillis: Long,
    val completedAtMillis: Long? = null,
)

/** A habit is split into small [HabitStep]s; it counts as done for a day once every step is checked. */
data class Habit(
    val id: Long = 0,
    val name: String,
    val createdAtMillis: Long,
)

data class HabitStep(
    val id: Long = 0,
    val habitId: Long,
    val title: String,
    val position: Int,
)

/** Records that [stepId] of [habitId] was done on [epochDay]. */
data class HabitCheck(
    val habitId: Long,
    val stepId: Long,
    val epochDay: Long,
)

data class Routine(
    val id: Long = 0,
    val name: String,
)

data class RoutineExercise(
    val id: Long = 0,
    val routineId: Long,
    val name: String,
    val sets: Int,
    val reps: Int,
    val position: Int,
)

data class WorkoutSession(
    val id: Long = 0,
    val routineId: Long,
    val epochDay: Long,
    val durationMinutes: Int,
    val loggedAtMillis: Long,
)

/** Everything the weekly report is calculated from. */
data class ActivityData(
    val timeEntries: List<TimeEntry> = emptyList(),
    val tasks: List<TaskItem> = emptyList(),
    val habits: List<Habit> = emptyList(),
    val habitSteps: List<HabitStep> = emptyList(),
    val habitChecks: List<HabitCheck> = emptyList(),
    val workouts: List<WorkoutSession> = emptyList(),
)
