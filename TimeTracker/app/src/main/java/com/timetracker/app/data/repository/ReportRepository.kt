package com.timetracker.app.data.repository

import com.timetracker.app.core.ActivityTotal
import com.timetracker.app.core.DateRange
import com.timetracker.app.core.DayTotal
import com.timetracker.app.core.ReportCalculator
import com.timetracker.app.data.dao.ExerciseDao
import com.timetracker.app.data.dao.HabitDao
import com.timetracker.app.data.dao.SleepDao
import com.timetracker.app.data.dao.TaskDao
import com.timetracker.app.data.dao.TimeLogDao
import com.timetracker.app.data.entity.durationMs
import com.timetracker.app.data.entity.toTimeSpan
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import java.time.ZoneId

/** Summary of one day or one week of activity, derived from the stored records. */
data class WeeklyReport(
    val range: DateRange,
    val totalTrackedMs: Long,
    val activityTotals: List<ActivityTotal>,
    val dailyTotals: List<DayTotal>,
    val tasksCompleted: Int,
    val habitGoalsMet: Int,
    val workouts: Int,
    val workoutMinutes: Int,
    val averageSleepMs: Long?,
) {
    val topActivity: ActivityTotal? get() = activityTotals.firstOrNull()
}

class ReportRepository(
    private val timeLogDao: TimeLogDao,
    private val taskDao: TaskDao,
    private val habitDao: HabitDao,
    private val exerciseDao: ExerciseDao,
    private val sleepDao: SleepDao,
) {
    fun observeReport(userId: Long, range: DateRange, zone: ZoneId = ZoneId.systemDefault()): Flow<WeeklyReport> {
        val fromTime = range.startMillis(zone)
        val toTime = range.endMillis(zone)
        return combine(
            timeLogDao.observeBetween(userId, fromTime, toTime),
            taskDao.observeCompletedCountBetween(userId, fromTime, toTime),
            habitDao.observeCompletedCountBetween(userId, range.start.toEpochDay(), range.lastDay.toEpochDay()),
            exerciseDao.observeBetween(userId, fromTime, toTime),
            sleepDao.observeEndingBetween(userId, fromTime, toTime),
        ) { logs, tasksCompleted, habitGoalsMet, exercises, sleepLogs ->
            val spans = logs.map { it.toTimeSpan() }
            WeeklyReport(
                range = range,
                totalTrackedMs = ReportCalculator.totalTime(spans, fromTime, toTime),
                activityTotals = ReportCalculator.totalsByActivity(spans, fromTime, toTime),
                dailyTotals = ReportCalculator.totalsByDay(spans, range, zone),
                tasksCompleted = tasksCompleted,
                habitGoalsMet = habitGoalsMet,
                workouts = exercises.size,
                workoutMinutes = exercises.sumOf { it.durationMinutes },
                averageSleepMs = ReportCalculator.average(sleepLogs.map { it.durationMs }),
            )
        }
    }
}
