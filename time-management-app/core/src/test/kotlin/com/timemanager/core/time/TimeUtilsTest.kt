package com.timemanager.core.time

import com.timemanager.core.model.TimeEntry
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class TimeUtilsTest {
    private val utc = ZoneId.of("UTC")
    private val hour = 3_600_000L

    private fun millis(dateTime: String, zone: ZoneId = utc): Long =
        LocalDateTime.parse(dateTime).atZone(zone).toInstant().toEpochMilli()

    @Test
    fun shortFormatPadsMinutesOnlyWhenHoursShow() {
        assertEquals("0m", DurationFormat.short(0))
        assertEquals("45m", DurationFormat.short(45 * 60_000L))
        assertEquals("1h 05m", DurationFormat.short(65 * 60_000L))
        assertEquals("0m", DurationFormat.short(-5_000))
    }

    @Test
    fun clockFormatShowsHoursMinutesSeconds() {
        assertEquals("00:00:00", DurationFormat.clock(0))
        assertEquals("01:05:09", DurationFormat.clock(3_909_000))
    }

    @Test
    fun weekStartsOnMonday() {
        assertEquals(LocalDate.parse("2026-10-26"), Weeks.startOf(LocalDate.parse("2026-10-26")))
        assertEquals(LocalDate.parse("2026-10-26"), Weeks.startOf(LocalDate.parse("2026-11-01")))
    }

    @Test
    fun entryAcrossMidnightIsSplitBetweenDays() {
        val entry = TimeEntry(category = "Work", startMillis = millis("2026-10-26T23:00"), endMillis = millis("2026-10-27T01:30"))

        val split = TimeSplitter.millisPerDay(entry, 0, utc, LocalDate.parse("2026-10-26"), LocalDate.parse("2026-11-02"))

        assertEquals(mapOf(LocalDate.parse("2026-10-26") to hour, LocalDate.parse("2026-10-27") to hour * 3 / 2), split)
    }

    @Test
    fun entryIsClippedToTheRange() {
        val entry = TimeEntry(category = "Work", startMillis = millis("2026-10-25T22:00"), endMillis = millis("2026-10-26T02:00"))

        val split = TimeSplitter.millisPerDay(entry, 0, utc, LocalDate.parse("2026-10-26"), LocalDate.parse("2026-11-02"))

        assertEquals(mapOf(LocalDate.parse("2026-10-26") to 2 * hour), split)
    }

    @Test
    fun runningEntryCountsUntilNow() {
        val entry = TimeEntry(category = "Study", startMillis = millis("2026-10-26T09:00"))

        val split = TimeSplitter.millisPerDay(entry, millis("2026-10-26T09:45"), utc, LocalDate.parse("2026-10-26"), LocalDate.parse("2026-10-27"))

        assertEquals(mapOf(LocalDate.parse("2026-10-26") to 45 * 60_000L), split)
    }

    @Test
    fun entryOutsideTheRangeIsIgnored() {
        val entry = TimeEntry(category = "Work", startMillis = millis("2026-10-20T09:00"), endMillis = millis("2026-10-20T10:00"))

        assertTrue(TimeSplitter.millisPerDay(entry, 0, utc, LocalDate.parse("2026-10-26"), LocalDate.parse("2026-11-02")).isEmpty())
    }

    @Test
    fun daylightSavingDayIsTwentyThreeHoursLong() {
        val berlin = ZoneId.of("Europe/Berlin")
        val entry = TimeEntry(
            category = "Sleep",
            startMillis = millis("2026-03-29T00:00", berlin),
            endMillis = millis("2026-03-30T00:00", berlin),
        )

        val split = TimeSplitter.millisPerDay(entry, 0, berlin, LocalDate.parse("2026-03-23"), LocalDate.parse("2026-03-30"))

        assertEquals(mapOf(LocalDate.parse("2026-03-29") to 23 * hour), split)
    }
}
