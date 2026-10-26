package com.timemanager.core.report

import com.timemanager.core.gamification.Gamification
import com.timemanager.core.habit.HabitProgress
import com.timemanager.core.model.ActivityData
import com.timemanager.core.time.TimeSplitter
import com.timemanager.core.time.startOfDayMillis
import com.timemanager.core.time.toLocalDate
import java.time.LocalDate
import java.time.ZoneId

data class CategoryTotal(val category: String, val millis: Long)

data class DayTotal(val date: LocalDate, val millis: Long)

/** [eligibleDays] are the days of the week the habit existed, up to today. */
data class HabitWeekSummary(
    val habitId: Long,
    val name: String,
    val daysCompleted: Int,
    val eligibleDays: Int,
)

data class WeeklyReport(
    val weekStart: LocalDate,
    val weekEnd: LocalDate,
    val totalTrackedMillis: Long,
    val byCategory: List<CategoryTotal>,
    val byDay: List<DayTotal>,
    val tasksCompleted: Int,
    val habits: List<HabitWeekSummary>,
    /** Completed habit-days over eligible habit-days; null when no habit had an eligible day. */
    val habitCompletionRate: Float?,
    val workouts: Int,
    val workoutMinutes: Int,
    val xpEarned: Int,
)

class WeeklyReportCalculator(private val zone: ZoneId) {

    fun calculate(
        weekStart: LocalDate,
        today: LocalDate,
        nowMillis: Long,
        data: ActivityData,
    ): WeeklyReport {
        val weekEnd = weekStart.plusDays(6)
        val nextWeekStart = weekStart.plusDays(7)
        val fromMillis = weekStart.startOfDayMillis(zone)
        val toMillis = nextWeekStart.startOfDayMillis(zone)
        val weekDays = weekStart.toEpochDay()..weekEnd.toEpochDay()

        val perDay = LinkedHashMap<LocalDate, Long>()
        for (offset in 0L until 7L) perDay[weekStart.plusDays(offset)] = 0L
        val perCategory = HashMap<String, Long>()
        for (entry in data.timeEntries) {
            val split = TimeSplitter.millisPerDay(entry, nowMillis, zone, weekStart, nextWeekStart)
            for ((date, millis) in split) {
                perDay[date] = perDay.getValue(date) + millis
                perCategory[entry.category] = (perCategory[entry.category] ?: 0L) + millis
            }
        }

        val tasksCompleted = data.tasks.count { task ->
            val completedAt = task.completedAtMillis
            task.isDone && completedAt != null && completedAt in fromMillis until toMillis
        }

        val stepsByHabit = data.habitSteps.groupBy { it.habitId }
        val checksByHabit = data.habitChecks.groupBy { it.habitId }
        val lastCountedDay = minOf(weekEnd, today)
        val habitSummaries = data.habits.map { habit ->
            val firstCountedDay = maxOf(weekStart, habit.createdAtMillis.toLocalDate(zone))
            val countedDays = firstCountedDay.toEpochDay()..lastCountedDay.toEpochDay()
            val completed = HabitProgress
                .completedDays(stepsByHabit[habit.id].orEmpty(), checksByHabit[habit.id].orEmpty())
                .count { it in countedDays }
            val eligible = (lastCountedDay.toEpochDay() - firstCountedDay.toEpochDay() + 1)
                .coerceAtLeast(0)
                .toInt()
            HabitWeekSummary(habit.id, habit.name, completed, eligible)
        }
        val eligibleTotal = habitSummaries.sumOf { it.eligibleDays }
        val completionRate = if (eligibleTotal == 0) {
            null
        } else {
            habitSummaries.sumOf { it.daysCompleted }.toFloat() / eligibleTotal
        }

        val workoutsThisWeek = data.workouts.filter { it.epochDay in weekDays }

        val xpEarned = Gamification.habitXp(stepsByHabit, data.habitChecks, weekDays) +
            Gamification.taskXp(tasksCompleted) +
            Gamification.workoutXp(workoutsThisWeek.size)

        return WeeklyReport(
            weekStart = weekStart,
            weekEnd = weekEnd,
            totalTrackedMillis = perDay.values.sum(),
            byCategory = perCategory
                .map { (category, millis) -> CategoryTotal(category, millis) }
                .sortedWith(compareByDescending<CategoryTotal> { it.millis }.thenBy { it.category }),
            byDay = perDay.map { (date, millis) -> DayTotal(date, millis) },
            tasksCompleted = tasksCompleted,
            habits = habitSummaries,
            habitCompletionRate = completionRate,
            workouts = workoutsThisWeek.size,
            workoutMinutes = workoutsThisWeek.sumOf { it.durationMinutes },
            xpEarned = xpEarned,
        )
    }
}
