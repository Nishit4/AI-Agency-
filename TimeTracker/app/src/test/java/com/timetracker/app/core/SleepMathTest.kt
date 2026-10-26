package com.timetracker.app.core

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneOffset

class SleepMathTest {

    private val zone = ZoneOffset.UTC
    private val wakeDate = LocalDate.of(2026, 10, 26)

    @Test
    fun bedtimeBeforeMidnight_startsThePreviousDay() {
        val (start, end) = SleepMath.interval(wakeDate, LocalTime.of(23, 0), LocalTime.of(7, 0), zone)
        assertEquals(DateUtils.toEpochMillis(wakeDate.minusDays(1), LocalTime.of(23, 0), zone), start)
        assertEquals(8 * 3_600_000L, end - start)
    }

    @Test
    fun bedtimeAfterMidnight_staysOnTheWakeDay() {
        val (start, end) = SleepMath.interval(wakeDate, LocalTime.of(1, 30), LocalTime.of(7, 0), zone)
        assertEquals(DateUtils.toEpochMillis(wakeDate, LocalTime.of(1, 30), zone), start)
        assertEquals(5 * 3_600_000L + 30 * 60_000L, end - start)
    }

    @Test
    fun validDuration_rejectsZeroAndVeryLongSleep() {
        assertFalse(SleepMath.isValidDuration(0))
        assertTrue(SleepMath.isValidDuration(8 * 3_600_000L))
        assertFalse(SleepMath.isValidDuration(21 * 3_600_000L))
    }
}
