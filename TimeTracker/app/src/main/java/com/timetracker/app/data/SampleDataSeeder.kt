package com.timetracker.app.data

import androidx.room.withTransaction
import com.timetracker.app.core.DateUtils
import com.timetracker.app.data.entity.Exercise
import com.timetracker.app.data.entity.Habit
import com.timetracker.app.data.entity.HabitLog
import com.timetracker.app.data.entity.SleepLog
import com.timetracker.app.data.entity.Task
import com.timetracker.app.data.entity.TaskPriority
import com.timetracker.app.data.entity.TimeLog
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import kotlin.random.Random

/**
 * Fills the signed-in user's account with a week of realistic records, so the charts and
 * gamification can be demonstrated without waiting for real data.
 */
class SampleDataSeeder(private val database: AppDatabase) {

    private data class Block(val activity: String, val start: LocalTime, val minutes: Int)

    suspend fun seed(userId: Long, zone: ZoneId = ZoneId.systemDefault()) {
        val random = Random(SEED)
        val today = LocalDate.now(zone)
        val now = System.currentTimeMillis()
        val days = (DAYS - 1 downTo 0).map { today.minusDays(it.toLong()) }

        database.withTransaction {
            seedTasks(userId, now)
            seedTimeLogs(userId, days, zone, now, random)
            seedHabits(userId, days, random)
            seedExercises(userId, days, zone, now, random)
            seedSleep(userId, days, zone, random)
        }
    }

    private suspend fun seedTasks(userId: Long, now: Long) {
        val dao = database.taskDao()
        val hour = 60 * 60 * 1000L
        listOf(
            Task(userId = userId, title = "Finish project report", description = "Add screenshots and diagrams", priority = TaskPriority.HIGH),
            Task(userId = userId, title = "Revise Kotlin notes", description = "Coroutines and Flow chapters", priority = TaskPriority.MEDIUM),
            Task(userId = userId, title = "Clean the bedroom", priority = TaskPriority.LOW),
            Task(userId = userId, title = "Submit assignment", priority = TaskPriority.HIGH, isDone = true, completedAt = now - 20 * hour),
            Task(userId = userId, title = "Buy groceries", description = "Milk, fruit, bread", priority = TaskPriority.MEDIUM, isDone = true, completedAt = now - 3 * hour),
        ).forEach { dao.insert(it) }
    }

    private suspend fun seedTimeLogs(userId: Long, days: List<LocalDate>, zone: ZoneId, now: Long, random: Random) {
        val logs = days.flatMap { date ->
            val weekend = date.dayOfWeek == DayOfWeek.SATURDAY || date.dayOfWeek == DayOfWeek.SUNDAY
            val blocks = if (weekend) WEEKEND_BLOCKS else WEEKDAY_BLOCKS
            blocks.mapNotNull { block ->
                val start = DateUtils.toEpochMillis(date, block.start, zone) + random.nextInt(-10, 11) * MINUTE
                val end = start + (block.minutes + random.nextInt(-15, 16)) * MINUTE
                if (end > now) null else TimeLog(userId = userId, activity = block.activity, startTime = start, endTime = end)
            }
        }
        database.timeLogDao().insertAll(logs)
    }

    private suspend fun seedHabits(userId: Long, days: List<LocalDate>, random: Random) {
        val dao = database.habitDao()
        val habits = listOf("Drink water" to 8, "Read 10 pages" to 3, "Meditate" to 2, "Walk 1,000 steps" to 5)
        habits.forEachIndexed { index, (name, target) ->
            val habitId = dao.insert(Habit(userId = userId, name = name, target = target, createdAt = System.currentTimeMillis() + index))
            val logs = days.dropLast(1).map { date ->
                // Most days are completed, some are partly done, to show streaks and progress.
                val progress = if (random.nextInt(100) < 70) target else random.nextInt(0, target)
                HabitLog(habitId = habitId, day = date.toEpochDay(), progress = progress)
            } + HabitLog(habitId = habitId, day = days.last().toEpochDay(), progress = target / 2)
            dao.upsertLogs(logs)
        }
    }

    private suspend fun seedExercises(userId: Long, days: List<LocalDate>, zone: ZoneId, now: Long, random: Random) {
        val workouts = listOf(
            Exercise(userId = userId, name = "Running", durationMinutes = 30),
            Exercise(userId = userId, name = "Push-ups", durationMinutes = 10, sets = 3, reps = 15),
            Exercise(userId = userId, name = "Yoga", durationMinutes = 25),
            Exercise(userId = userId, name = "Cycling", durationMinutes = 40),
            Exercise(userId = userId, name = "Squats", durationMinutes = 10, sets = 3, reps = 20),
        )
        val entries = workouts.mapIndexedNotNull { index, workout ->
            val date = days[(index * 2 + 1).coerceAtMost(days.size - 1)]
            val at = DateUtils.toEpochMillis(date, LocalTime.of(7, random.nextInt(0, 45)), zone)
            if (at > now) null else workout.copy(performedAt = at)
        }
        database.exerciseDao().insertAll(entries)
    }

    private suspend fun seedSleep(userId: Long, days: List<LocalDate>, zone: ZoneId, random: Random) {
        val logs = days.map { wakeDate ->
            val bedtime = LocalTime.of(22, 30).plusMinutes(random.nextLong(0, 90))
            val wakeTime = LocalTime.of(6, 0).plusMinutes(random.nextLong(0, 75))
            SleepLog(
                userId = userId,
                sleepStart = DateUtils.toEpochMillis(wakeDate.minusDays(1), bedtime, zone),
                sleepEnd = DateUtils.toEpochMillis(wakeDate, wakeTime, zone),
                quality = random.nextInt(3, 6),
            )
        }
        database.sleepDao().insertAll(logs)
    }

    private companion object {
        const val SEED = 42
        const val DAYS = 7
        const val MINUTE = 60_000L

        val WEEKDAY_BLOCKS = listOf(
            Block("College", LocalTime.of(9, 45), 300),
            Block("Lunch", LocalTime.of(14, 55), 45),
            Block("Nap", LocalTime.of(15, 45), 60),
            Block("YouTube, journal", LocalTime.of(16, 50), 70),
            Block("App dev", LocalTime.of(18, 0), 150),
            Block("Dinner, chores", LocalTime.of(21, 0), 60),
            Block("Study", LocalTime.of(22, 5), 50),
        )

        val WEEKEND_BLOCKS = listOf(
            Block("Breakfast, YouTube", LocalTime.of(9, 30), 60),
            Block("Ideas, refresh", LocalTime.of(10, 45), 120),
            Block("App dev", LocalTime.of(13, 30), 180),
            Block("Exercise", LocalTime.of(17, 30), 45),
            Block("Dinner, chores", LocalTime.of(20, 0), 60),
            Block("Movie", LocalTime.of(21, 15), 120),
        )
    }
}
