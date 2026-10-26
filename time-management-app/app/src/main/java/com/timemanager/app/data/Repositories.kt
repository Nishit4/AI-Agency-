package com.timemanager.app.data

import com.timemanager.app.data.local.ExerciseDao
import com.timemanager.app.data.local.HabitCheckEntity
import com.timemanager.app.data.local.HabitDao
import com.timemanager.app.data.local.HabitEntity
import com.timemanager.app.data.local.RoutineEntity
import com.timemanager.app.data.local.RoutineExerciseEntity
import com.timemanager.app.data.local.TaskDao
import com.timemanager.app.data.local.TaskEntity
import com.timemanager.app.data.local.TimeEntryDao
import com.timemanager.app.data.local.TimeEntryEntity
import com.timemanager.app.data.local.WorkoutSessionEntity
import com.timemanager.core.exercise.ParsedExercise
import com.timemanager.core.gamification.Gamification
import com.timemanager.core.gamification.LevelInfo
import com.timemanager.core.model.Habit
import com.timemanager.core.model.HabitCheck
import com.timemanager.core.model.HabitStep
import com.timemanager.core.model.Priority
import com.timemanager.core.model.Routine
import com.timemanager.core.model.RoutineExercise
import com.timemanager.core.model.TaskItem
import com.timemanager.core.model.TimeEntry
import com.timemanager.core.model.WorkoutSession
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.map
import java.time.Clock
import java.time.LocalDate

class TimeRepository(private val dao: TimeEntryDao, private val clock: Clock) {
    val running: Flow<TimeEntry?> = dao.observeRunning().map { it?.toModel() }

    fun entriesBetween(fromMillis: Long, toMillis: Long): Flow<List<TimeEntry>> =
        dao.observeOverlapping(fromMillis, toMillis).map { list -> list.map { it.toModel() } }

    suspend fun start(category: String, note: String) {
        dao.start(TimeEntryEntity(category = category, note = note, startMillis = clock.millis(), endMillis = null))
    }

    suspend fun stop() = dao.stopRunning(clock.millis())

    suspend fun delete(id: Long) = dao.delete(id)
}

class TaskRepository(private val dao: TaskDao, private val clock: Clock) {
    val tasks: Flow<List<TaskItem>> = dao.observeAll().map { list -> list.map { it.toModel() } }

    suspend fun add(title: String, notes: String, priority: Priority, due: LocalDate?) {
        dao.insert(
            TaskEntity(
                title = title,
                notes = notes,
                priority = priority,
                dueEpochDay = due?.toEpochDay(),
                isDone = false,
                createdAtMillis = clock.millis(),
                completedAtMillis = null,
            ),
        )
    }

    suspend fun setDone(task: TaskItem, done: Boolean) {
        val updated = task.copy(isDone = done, completedAtMillis = if (done) clock.millis() else null)
        dao.update(TaskEntity.from(updated))
    }

    suspend fun delete(id: Long) = dao.delete(id)
}

class HabitRepository(private val dao: HabitDao, private val clock: Clock) {
    val habits: Flow<List<Habit>> = dao.observeHabits().map { list -> list.map { it.toModel() } }
    val steps: Flow<List<HabitStep>> = dao.observeSteps().map { list -> list.map { it.toModel() } }
    val checks: Flow<List<HabitCheck>> = dao.observeChecks().map { list -> list.map { it.toModel() } }

    suspend fun add(name: String, stepTitles: List<String>) {
        dao.insertHabitWithSteps(HabitEntity(name = name, createdAtMillis = clock.millis()), stepTitles)
    }

    suspend fun setStepChecked(habitId: Long, stepId: Long, epochDay: Long, checked: Boolean) {
        if (checked) {
            dao.insertCheck(HabitCheckEntity(habitId = habitId, stepId = stepId, epochDay = epochDay))
        } else {
            dao.deleteCheck(stepId, epochDay)
        }
    }

    suspend fun delete(id: Long) = dao.deleteHabit(id)
}

class ExerciseRepository(private val dao: ExerciseDao, private val clock: Clock) {
    val routines: Flow<List<Routine>> = dao.observeRoutines().map { list -> list.map { it.toModel() } }
    val exercises: Flow<List<RoutineExercise>> = dao.observeExercises().map { list -> list.map { it.toModel() } }
    val sessions: Flow<List<WorkoutSession>> = dao.observeSessions().map { list -> list.map { it.toModel() } }

    suspend fun addRoutine(name: String, exercises: List<ParsedExercise>) {
        dao.insertRoutineWithExercises(
            RoutineEntity(name = name),
            exercises.mapIndexed { index, exercise ->
                RoutineExerciseEntity(routineId = 0, name = exercise.name, sets = exercise.sets, reps = exercise.reps, position = index)
            },
        )
    }

    suspend fun logWorkout(routineId: Long, durationMinutes: Int) {
        dao.insertSession(
            WorkoutSessionEntity(
                routineId = routineId,
                epochDay = LocalDate.now(clock).toEpochDay(),
                durationMinutes = durationMinutes,
                loggedAtMillis = clock.millis(),
            ),
        )
    }

    suspend fun deleteRoutine(id: Long) = dao.deleteRoutine(id)

    suspend fun deleteSession(id: Long) = dao.deleteSession(id)
}

/** Total XP and level, earned from habits, finished tasks and logged workouts. */
class ProgressRepository(habits: HabitRepository, tasks: TaskRepository, exercise: ExerciseRepository) {
    val level: Flow<LevelInfo> = combine(habits.steps, habits.checks, tasks.tasks, exercise.sessions) { steps, checks, taskList, sessions ->
        val xp = Gamification.habitXp(steps.groupBy { it.habitId }, checks) +
            Gamification.taskXp(taskList.count { it.isDone }) +
            Gamification.workoutXp(sessions.size)
        Gamification.levelFor(xp)
    }
}
