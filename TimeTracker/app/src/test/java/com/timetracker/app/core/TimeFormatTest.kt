package com.timetracker.app.core

import org.junit.Assert.assertEquals
import org.junit.Test

class TimeFormatTest {

    @Test
    fun stopwatch_padsHoursMinutesAndSeconds() {
        assertEquals("00:00:00", TimeFormat.stopwatch(0))
        assertEquals("00:00:11", TimeFormat.stopwatch(11_999))
        assertEquals("01:02:03", TimeFormat.stopwatch((3600 + 120 + 3) * 1000L))
        assertEquals("25:00:00", TimeFormat.stopwatch(25 * 3_600_000L))
    }

    @Test
    fun stopwatch_neverShowsNegativeTime() {
        assertEquals("00:00:00", TimeFormat.stopwatch(-5_000))
    }

    @Test
    fun duration_usesTheLargestUsefulUnits() {
        assertEquals("30s", TimeFormat.duration(30_000))
        assertEquals("45m", TimeFormat.duration(45 * 60_000L))
        assertEquals("2h", TimeFormat.duration(2 * 3_600_000L))
        assertEquals("2h 5m", TimeFormat.duration(2 * 3_600_000L + 5 * 60_000L))
    }

    @Test
    fun hoursDecimal_roundsToOneDigit() {
        assertEquals("0.0h", TimeFormat.hoursDecimal(0))
        assertEquals("2.5h", TimeFormat.hoursDecimal(150 * 60_000L))
    }
}
