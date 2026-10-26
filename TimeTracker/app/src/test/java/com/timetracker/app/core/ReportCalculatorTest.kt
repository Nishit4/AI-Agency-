package com.timetracker.app.core

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneOffset

class ReportCalculatorTest {

    private val zone = ZoneOffset.UTC
    private val hour = 3_600_000L

    private fun at(date: LocalDate, hour: Int, minute: Int = 0): Long =
        DateUtils.toEpochMillis(date, LocalTime.of(hour, minute), zone)

    @Test
    fun overlap_clipsToTheRange() {
        assertEquals(5L, ReportCalculator.overlap(0, 10, 5, 20))
        assertEquals(10L, ReportCalculator.overlap(0, 10, -5, 20))
        assertEquals(0L, ReportCalculator.overlap(0, 10, 10, 20))
        assertEquals(0L, ReportCalculator.overlap(30, 40, 0, 20))
    }

    @Test
    fun totalsByActivity_groupsNamesIgnoringCaseAndSpaces() {
        val spans = listOf(
            TimeSpan("Study", 0, 2 * hour),
            TimeSpan("study ", 3 * hour, 4 * hour),
            TimeSpan("Lunch", 5 * hour, 5 * hour + hour / 2),
        )
        val totals = ReportCalculator.totalsByActivity(spans, 0, 24 * hour)
        assertEquals(listOf(ActivityTotal("Study", 3 * hour), ActivityTotal("Lunch", hour / 2)), totals)
    }

    @Test
    fun totalsByDay_splitsSpansThatCrossMidnight() {
        val monday = LocalDate.of(2026, 10, 19)
        val tuesday = monday.plusDays(1)
        val spans = listOf(TimeSpan("Movie", at(monday, 23), at(tuesday, 1, 30)))
        val range = DateRange(monday, monday.plusDays(2))

        val days = ReportCalculator.totalsByDay(spans, range, zone)

        assertEquals(listOf(DayTotal(monday, hour), DayTotal(tuesday, hour + hour / 2)), days)
    }

    @Test
    fun totalTime_ignoresTimeOutsideTheRange() {
        val day = LocalDate.of(2026, 10, 20)
        val range = DateRange.day(day)
        val spans = listOf(
            TimeSpan("Late night", at(day.minusDays(1), 23), at(day, 1)),
            TimeSpan("College", at(day, 9), at(day, 14)),
        )
        assertEquals(6 * hour, ReportCalculator.totalTime(spans, range.startMillis(zone), range.endMillis(zone)))
    }

    @Test
    fun topWithOther_mergesTheSmallestItems() {
        val totals = listOf(
            ActivityTotal("A", 50),
            ActivityTotal("B", 40),
            ActivityTotal("C", 30),
            ActivityTotal("D", 20),
            ActivityTotal("E", 10),
        )
        val result = ReportCalculator.topWithOther(totals, maxItems = 3, otherLabel = "Other")
        assertEquals(listOf(ActivityTotal("A", 50), ActivityTotal("B", 40), ActivityTotal("Other", 60)), result)
    }

    @Test
    fun topWithOther_keepsShortListsUnchanged() {
        val totals = listOf(ActivityTotal("A", 50), ActivityTotal("B", 40))
        assertEquals(totals, ReportCalculator.topWithOther(totals, maxItems = 3, otherLabel = "Other"))
    }

    @Test
    fun average_handlesEmptyLists() {
        assertNull(ReportCalculator.average(emptyList()))
        assertEquals(15L, ReportCalculator.average(listOf(10L, 20L)))
    }

    @Test
    fun weekRange_startsOnTheGivenFirstDay() {
        val wednesday = LocalDate.of(2026, 10, 21)
        val mondayWeek = DateRange.week(wednesday, DayOfWeek.MONDAY)
        assertEquals(LocalDate.of(2026, 10, 19), mondayWeek.start)
        assertEquals(LocalDate.of(2026, 10, 26), mondayWeek.endExclusive)
        assertEquals(7, mondayWeek.dayCount)

        val sundayWeek = DateRange.week(wednesday, DayOfWeek.SUNDAY)
        assertEquals(LocalDate.of(2026, 10, 18), sundayWeek.start)
    }

    @Test
    fun weekRange_onTheFirstDayStartsThatDay() {
        val monday = LocalDate.of(2026, 10, 19)
        assertEquals(monday, DateRange.week(monday, DayOfWeek.MONDAY).start)
    }
}
