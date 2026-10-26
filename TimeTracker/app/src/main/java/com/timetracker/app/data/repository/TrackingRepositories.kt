package com.timetracker.app.data.repository

import com.timetracker.app.core.Gamification
import com.timetracker.app.core.LevelInfo
import com.timetracker.app.data.dao.ExerciseDao
import com.timetracker.app.data.dao.HabitDao
import com.timetracker.app.data.dao.SleepDao
import com.timetracker.app.data.dao.TaskDao
import com.timetracker.app.data.dao.TimeLogDao
import com.timetracker.app.data.entity.Exercise
import com.timetracker.app.data.entity.Habit
import com.timetracker.app.data.entity.HabitDay
import com.timetracker.app.data.entity.HabitLog
import com.timetracker.app.data.entity.HabitWithProgress
import com.timetracker.app.data.entity.SleepLog
import com.timetracker.app.data.entity.TimeLog
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

/** Time records created by the stopwatch or added by hand. */
class TimeLogRepository(private val timeLogDao: TimeLogDao) {

    fun observeBetween(userId: Long, fromTime: Long, toTime: Long): Flow<List<TimeLog>> =
        timeLogDao.observeBetween(userId, fromTime, toTime)

    suspend fun add(log: TimeLog): Long = timeLogDao.insert(log)

    suspend fun delete(log: TimeLog) = timeLogDao.delete(log)
}

data class ProgressChange(val before: Int, val after: Int, val target: Int) {
    val partsAdded: Int get() = (after - before).coerceAtLeast(0)
    val justCompleted: Boolean get() = before < target && after >= target
}

/** Habits and the parts done each day. */
class HabitRepository(private val habitDao: HabitDao) {

    private val progressLock = Mutex()

    fun observeWithProgress(userId: Long, day: Long): Flow<List<HabitWithProgress>> =
        habitDao.observeWithProgress(userId, day)

    fun observeCompletedDays(userId: Long): Flow<List<HabitDay>> = habitDao.observeCompletedDays(userId)

    suspend fun add(userId: Long, name: String, target: Int): Long =
        habitDao.insert(Habit(userId = userId, name = name.trim(), target = target))

    suspend fun update(habit: Habit) = habitDao.update(habit)

    suspend fun delete(habit: Habit) = habitDao.delete(habit)

    /**
     * Adds [delta] parts to the habit's progress for [day], keeping it between 0 and the target.
     * Returns the progress before and after the change. Calls are serialised so quick taps are
     * never lost.
     */
    suspend fun changeProgress(habit: Habit, day: Long, delta: Int): ProgressChange = progressLock.withLock {
        val current = habitDao.findProgress(habit.id, day) ?: 0
        val updated = (current + delta).coerceIn(0, habit.target)
        if (updated != current) habitDao.upsertLog(HabitLog(habit.id, day, updated))
        ProgressChange(before = current, after = updated, target = habit.target)
    }

    suspend fun resetDay(habit: Habit, day: Long) = progressLock.withLock {
        habitDao.upsertLog(HabitLog(habit.id, day, 0))
    }
}

/** Exercise routine entries. */
class ExerciseRepository(private val exerciseDao: ExerciseDao) {

    fun observeAll(userId: Long): Flow<List<Exercise>> = exerciseDao.observeAll(userId)

    suspend fun add(exercise: Exercise): Long = exerciseDao.insert(exercise)

    suspend fun delete(exercise: Exercise) = exerciseDao.delete(exercise)
}

/** Sleep log entries. */
class SleepRepository(private val sleepDao: SleepDao) {

    fun observeAll(userId: Long): Flow<List<SleepLog>> = sleepDao.observeAll(userId)

    suspend fun add(log: SleepLog): Long = sleepDao.insert(log)

    suspend fun delete(log: SleepLog) = sleepDao.delete(log)
}

/** Works out the user's XP and level from everything they have completed. */
class StatsRepository(
    private val habitDao: HabitDao,
    private val taskDao: TaskDao,
    private val exerciseDao: ExerciseDao,
) {
    fun observeLevel(userId: Long): Flow<LevelInfo> = combine(
        habitDao.observeTotalParts(userId),
        habitDao.observeCompletedCount(userId),
        taskDao.observeCompletedCount(userId),
        exerciseDao.observeCount(userId),
    ) { parts, habitsCompleted, tasksDone, exercises ->
        Gamification.levelFor(Gamification.totalXp(parts, habitsCompleted, tasksDone, exercises))
    }
}
