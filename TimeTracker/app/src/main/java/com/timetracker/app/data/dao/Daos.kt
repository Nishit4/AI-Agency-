package com.timetracker.app.data.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.timetracker.app.data.entity.Exercise
import com.timetracker.app.data.entity.Habit
import com.timetracker.app.data.entity.HabitDay
import com.timetracker.app.data.entity.HabitLog
import com.timetracker.app.data.entity.HabitWithProgress
import com.timetracker.app.data.entity.SleepLog
import com.timetracker.app.data.entity.Task
import com.timetracker.app.data.entity.TimeLog
import com.timetracker.app.data.entity.User
import kotlinx.coroutines.flow.Flow

@Dao
interface UserDao {
    @Insert(onConflict = OnConflictStrategy.ABORT)
    suspend fun insert(user: User): Long

    @Update
    suspend fun update(user: User)

    @Query("SELECT * FROM users WHERE username = :username LIMIT 1")
    suspend fun findByUsername(username: String): User?

    @Query("SELECT * FROM users WHERE id = :id")
    suspend fun findById(id: Long): User?

    @Query("SELECT * FROM users WHERE id = :id")
    fun observe(id: Long): Flow<User?>
}

@Dao
interface TaskDao {
    @Insert
    suspend fun insert(task: Task): Long

    @Update
    suspend fun update(task: Task)

    @Delete
    suspend fun delete(task: Task)

    @Query("SELECT * FROM tasks WHERE id = :id")
    suspend fun findById(id: Long): Task?

    /** Pending tasks first, then by priority, then by the nearest reminder. */
    @Query(
        """
        SELECT * FROM tasks WHERE userId = :userId
        ORDER BY isDone ASC, priority DESC,
            CASE WHEN reminderAt IS NULL THEN 1 ELSE 0 END ASC, reminderAt ASC, createdAt DESC
        """
    )
    fun observeAll(userId: Long): Flow<List<Task>>

    @Query("SELECT * FROM tasks WHERE userId = :userId AND isDone = 0 ORDER BY priority DESC, createdAt DESC")
    fun observePending(userId: Long): Flow<List<Task>>

    @Query("SELECT * FROM tasks WHERE userId = :userId AND isDone = 0 AND reminderAt IS NOT NULL AND reminderAt > :now")
    suspend fun findUpcomingReminders(userId: Long, now: Long): List<Task>

    @Query("SELECT * FROM tasks WHERE userId = :userId AND reminderAt IS NOT NULL")
    suspend fun findWithReminders(userId: Long): List<Task>

    @Query("SELECT COUNT(*) FROM tasks WHERE userId = :userId AND isDone = 1")
    fun observeCompletedCount(userId: Long): Flow<Int>

    @Query("SELECT COUNT(*) FROM tasks WHERE userId = :userId AND isDone = 1 AND completedAt >= :fromTime AND completedAt < :toTime")
    fun observeCompletedCountBetween(userId: Long, fromTime: Long, toTime: Long): Flow<Int>
}

@Dao
interface TimeLogDao {
    @Insert
    suspend fun insert(log: TimeLog): Long

    @Insert
    suspend fun insertAll(logs: List<TimeLog>)

    @Delete
    suspend fun delete(log: TimeLog)

    /** Logs that overlap `[from, to)`, newest first. */
    @Query("SELECT * FROM time_logs WHERE userId = :userId AND startTime < :toTime AND endTime > :fromTime ORDER BY startTime DESC")
    fun observeBetween(userId: Long, fromTime: Long, toTime: Long): Flow<List<TimeLog>>
}

@Dao
interface HabitDao {
    @Insert
    suspend fun insert(habit: Habit): Long

    @Update
    suspend fun update(habit: Habit)

    @Delete
    suspend fun delete(habit: Habit)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertLog(log: HabitLog)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertLogs(logs: List<HabitLog>)

    @Query("SELECT progress FROM habit_logs WHERE habitId = :habitId AND day = :day")
    suspend fun findProgress(habitId: Long, day: Long): Int?

    @Query(
        """
        SELECT habits.*, COALESCE(habit_logs.progress, 0) AS progress FROM habits
        LEFT JOIN habit_logs ON habit_logs.habitId = habits.id AND habit_logs.day = :day
        WHERE habits.userId = :userId
        ORDER BY habits.createdAt ASC
        """
    )
    fun observeWithProgress(userId: Long, day: Long): Flow<List<HabitWithProgress>>

    @Query(
        """
        SELECT habit_logs.habitId AS habitId, habit_logs.day AS day FROM habit_logs
        INNER JOIN habits ON habits.id = habit_logs.habitId
        WHERE habits.userId = :userId AND habit_logs.progress >= habits.target
        """
    )
    fun observeCompletedDays(userId: Long): Flow<List<HabitDay>>

    /** Total habit parts done, counting at most the target per day. */
    @Query(
        """
        SELECT COALESCE(SUM(MIN(habit_logs.progress, habits.target)), 0) FROM habit_logs
        INNER JOIN habits ON habits.id = habit_logs.habitId
        WHERE habits.userId = :userId
        """
    )
    fun observeTotalParts(userId: Long): Flow<Int>

    @Query(
        """
        SELECT COUNT(*) FROM habit_logs
        INNER JOIN habits ON habits.id = habit_logs.habitId
        WHERE habits.userId = :userId AND habit_logs.progress >= habits.target
        """
    )
    fun observeCompletedCount(userId: Long): Flow<Int>

    @Query(
        """
        SELECT COUNT(*) FROM habit_logs
        INNER JOIN habits ON habits.id = habit_logs.habitId
        WHERE habits.userId = :userId AND habit_logs.progress >= habits.target
            AND habit_logs.day >= :fromDay AND habit_logs.day <= :toDay
        """
    )
    fun observeCompletedCountBetween(userId: Long, fromDay: Long, toDay: Long): Flow<Int>
}

@Dao
interface ExerciseDao {
    @Insert
    suspend fun insert(exercise: Exercise): Long

    @Insert
    suspend fun insertAll(exercises: List<Exercise>)

    @Delete
    suspend fun delete(exercise: Exercise)

    @Query("SELECT * FROM exercises WHERE userId = :userId ORDER BY performedAt DESC")
    fun observeAll(userId: Long): Flow<List<Exercise>>

    @Query("SELECT * FROM exercises WHERE userId = :userId AND performedAt >= :fromTime AND performedAt < :toTime ORDER BY performedAt DESC")
    fun observeBetween(userId: Long, fromTime: Long, toTime: Long): Flow<List<Exercise>>

    @Query("SELECT COUNT(*) FROM exercises WHERE userId = :userId")
    fun observeCount(userId: Long): Flow<Int>
}

@Dao
interface SleepDao {
    @Insert
    suspend fun insert(log: SleepLog): Long

    @Insert
    suspend fun insertAll(logs: List<SleepLog>)

    @Delete
    suspend fun delete(log: SleepLog)

    @Query("SELECT * FROM sleep_logs WHERE userId = :userId ORDER BY sleepEnd DESC")
    fun observeAll(userId: Long): Flow<List<SleepLog>>

    /** Nights that ended (the user woke up) inside `[from, to)`. */
    @Query("SELECT * FROM sleep_logs WHERE userId = :userId AND sleepEnd >= :fromTime AND sleepEnd < :toTime ORDER BY sleepEnd DESC")
    fun observeEndingBetween(userId: Long, fromTime: Long, toTime: Long): Flow<List<SleepLog>>
}
