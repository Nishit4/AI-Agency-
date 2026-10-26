package com.timemanager.app.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
abstract class TimeEntryDao {
    /** Entries that overlap [fromMillis, toMillis), including a running one. */
    @Query(
        """
        SELECT * FROM time_entries
        WHERE startMillis < :toMillis AND (endMillis IS NULL OR endMillis > :fromMillis)
        ORDER BY startMillis DESC
        """,
    )
    abstract fun observeOverlapping(fromMillis: Long, toMillis: Long): Flow<List<TimeEntryEntity>>

    @Query("SELECT * FROM time_entries WHERE endMillis IS NULL ORDER BY startMillis DESC LIMIT 1")
    abstract fun observeRunning(): Flow<TimeEntryEntity?>

    @Query("UPDATE time_entries SET endMillis = :endMillis WHERE endMillis IS NULL")
    abstract suspend fun stopRunning(endMillis: Long)

    @Insert
    abstract suspend fun insert(entry: TimeEntryEntity): Long

    @Query("DELETE FROM time_entries WHERE id = :id")
    abstract suspend fun delete(id: Long)

    /** Only one timer runs at a time: starting a new one stops the previous one. */
    @Transaction
    open suspend fun start(entry: TimeEntryEntity) {
        stopRunning(entry.startMillis)
        insert(entry)
    }
}

@Dao
abstract class TaskDao {
    @Query("SELECT * FROM tasks")
    abstract fun observeAll(): Flow<List<TaskEntity>>

    @Insert
    abstract suspend fun insert(task: TaskEntity): Long

    @Update
    abstract suspend fun update(task: TaskEntity)

    @Query("DELETE FROM tasks WHERE id = :id")
    abstract suspend fun delete(id: Long)
}

@Dao
abstract class HabitDao {
    @Query("SELECT * FROM habits ORDER BY createdAtMillis")
    abstract fun observeHabits(): Flow<List<HabitEntity>>

    @Query("SELECT * FROM habit_steps ORDER BY habitId, position")
    abstract fun observeSteps(): Flow<List<HabitStepEntity>>

    @Query("SELECT * FROM habit_checks")
    abstract fun observeChecks(): Flow<List<HabitCheckEntity>>

    @Insert
    abstract suspend fun insertHabit(habit: HabitEntity): Long

    @Insert
    abstract suspend fun insertSteps(steps: List<HabitStepEntity>)

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    abstract suspend fun insertCheck(check: HabitCheckEntity)

    @Query("DELETE FROM habit_checks WHERE stepId = :stepId AND epochDay = :epochDay")
    abstract suspend fun deleteCheck(stepId: Long, epochDay: Long)

    @Query("DELETE FROM habits WHERE id = :id")
    abstract suspend fun deleteHabit(id: Long)

    @Transaction
    open suspend fun insertHabitWithSteps(habit: HabitEntity, stepTitles: List<String>) {
        val habitId = insertHabit(habit)
        insertSteps(
            stepTitles.mapIndexed { index, title ->
                HabitStepEntity(habitId = habitId, title = title, position = index)
            },
        )
    }
}

@Dao
abstract class ExerciseDao {
    @Query("SELECT * FROM routines ORDER BY name COLLATE NOCASE")
    abstract fun observeRoutines(): Flow<List<RoutineEntity>>

    @Query("SELECT * FROM routine_exercises ORDER BY routineId, position")
    abstract fun observeExercises(): Flow<List<RoutineExerciseEntity>>

    @Query("SELECT * FROM workout_sessions ORDER BY epochDay DESC, loggedAtMillis DESC")
    abstract fun observeSessions(): Flow<List<WorkoutSessionEntity>>

    @Insert
    abstract suspend fun insertRoutine(routine: RoutineEntity): Long

    @Insert
    abstract suspend fun insertExercises(exercises: List<RoutineExerciseEntity>)

    @Insert
    abstract suspend fun insertSession(session: WorkoutSessionEntity): Long

    @Query("DELETE FROM routines WHERE id = :id")
    abstract suspend fun deleteRoutine(id: Long)

    @Query("DELETE FROM workout_sessions WHERE id = :id")
    abstract suspend fun deleteSession(id: Long)

    @Transaction
    open suspend fun insertRoutineWithExercises(routine: RoutineEntity, exercises: List<RoutineExerciseEntity>) {
        val routineId = insertRoutine(routine)
        insertExercises(exercises.map { it.copy(routineId = routineId) })
    }
}
