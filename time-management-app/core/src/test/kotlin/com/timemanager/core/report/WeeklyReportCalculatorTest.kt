package com.timemanager.core.report

import com.timemanager.core.model.ActivityData
import com.timemanager.core.model.Habit
import com.timemanager.core.model.HabitCheck
import com.timemanager.core.model.HabitStep
import com.timemanager.core.model.TaskItem
import com.timemanager.core.model.TimeEntry
import com.timemanager.core.model.WorkoutSession
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

class WeeklyReportCalculatorTest {
    private val utc = ZoneId.of("UTC")
    private val hour = 3_600_000L
    private val monday = LocalDate.parse("2026-10-26")
    private val calculator = WeeklyReportCalculator(utc)

    private fun millis(dateTime: String): Long = LocalDateTime.parse(dateTime).atZone(utc).toInstant().toEpochMilli()

    private fun day(date: String): Long = LocalDate.parse(date).toEpochDay()

    @Test
    fun summarizesTheWeek() {
        val data = ActivityData(
            timeEntries = listOf(
                TimeEntry(id = 1, category = "Work", startMillis = millis("2026-10-26T09:00"), endMillis = millis("2026-10-26T12:00")),
                TimeEntry(id = 2, category = "Study", startMillis = millis("2026-10-27T18:00"), endMillis = millis("2026-10-27T19:00")),
                TimeEntry(id = 3, category = "Work", startMillis = millis("2026-10-28T09:00")),
                // Last week: ignored
                TimeEntry(id = 4, category = "Work", startMillis = millis("2026-10-20T09:00"), endMillis = millis("2026-10-20T17:00")),
            ),
            tasks = listOf(
                TaskItem(id = 1, title = "Done this week", isDone = true, createdAtMillis = 0, completedAtMillis = millis("2026-10-27T10:00")),
                TaskItem(id = 2, title = "Done last week", isDone = true, createdAtMillis = 0, completedAtMillis = millis("2026-10-21T10:00")),
                TaskItem(id = 3, title = "Open", createdAtMillis = 0),
            ),
            habits = listOf(
                Habit(id = 1, name = "Walk", createdAtMillis = millis("2026-10-01T08:00")),
                Habit(id = 2, name = "Read", createdAtMillis = millis("2026-10-28T08:00")),
            ),
            habitSteps = listOf(
                HabitStep(id = 10, habitId = 1, title = "Walk", position = 0),
                HabitStep(id = 20, habitId = 2, title = "Open the book", position = 0),
                HabitStep(id = 21, habitId = 2, title = "Read 10 pages", position = 1),
            ),
            habitChecks = listOf(
                HabitCheck(habitId = 1, stepId = 10, epochDay = day("2026-10-26")),
                HabitCheck(habitId = 1, stepId = 10, epochDay = day("2026-10-27")),
                HabitCheck(habitId = 2, stepId = 20, epochDay = day("2026-10-28")),
            ),
            workouts = listOf(
                WorkoutSession(id = 1, routineId = 1, epochDay = day("2026-10-27"), durationMinutes = 40, loggedAtMillis = 0),
                WorkoutSession(id = 2, routineId = 1, epochDay = day("2026-10-19"), durationMinutes = 30, loggedAtMillis = 0),
            ),
        )

        val report = calculator.calculate(
            weekStart = monday,
            today = LocalDate.parse("2026-10-28"),
            nowMillis = millis("2026-10-28T09:30"),
            data = data,
        )

        assertEquals(LocalDate.parse("2026-11-01"), report.weekEnd)
        assertEquals(4 * hour + hour / 2, report.totalTrackedMillis)
        assertEquals(listOf(CategoryTotal("Work", 3 * hour + hour / 2), CategoryTotal("Study", hour)), report.byCategory)
        assertEquals(7, report.byDay.size)
        assertEquals(3 * hour, report.byDay[0].millis)
        assertEquals(hour / 2, report.byDay[2].millis)
        assertEquals(1, report.tasksCompleted)
        // Walk: Mon-Wed eligible, 2 done. Read: created Wednesday, 1 eligible day, not finished.
        assertEquals(
            listOf(HabitWeekSummary(1, "Walk", 2, 3), HabitWeekSummary(2, "Read", 0, 1)),
            report.habits,
        )
        assertEquals(0.5f, report.habitCompletionRate)
        assertEquals(1, report.workouts)
        assertEquals(40, report.workoutMinutes)
        // Habits: 3 steps x 10 + 2 full days x 20 = 70; task 15; workout 30
        assertEquals(115, report.xpEarned)
    }

    @Test
    fun futureWeekHasNoHabitRate() {
        val data = ActivityData(habits = listOf(Habit(id = 1, name = "Walk", createdAtMillis = 0)))

        val report = calculator.calculate(
            weekStart = monday.plusWeeks(1),
            today = monday,
            nowMillis = millis("2026-10-26T09:00"),
            data = data,
        )

        assertEquals(listOf(HabitWeekSummary(1, "Walk", 0, 0)), report.habits)
        assertNull(report.habitCompletionRate)
        assertEquals(0L, report.totalTrackedMillis)
    }
}
