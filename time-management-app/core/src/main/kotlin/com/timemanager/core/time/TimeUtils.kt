package com.timemanager.core.time

import com.timemanager.core.model.TimeEntry
import java.time.DayOfWeek
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.temporal.TemporalAdjusters
import java.util.Locale

object DurationFormat {
    /** Compact duration such as "2h 05m" or "45m". */
    fun short(millis: Long): String {
        val totalMinutes = millis.coerceAtLeast(0) / 60_000
        val hours = totalMinutes / 60
        val minutes = totalMinutes % 60
        return if (hours > 0) {
            String.format(Locale.ROOT, "%dh %02dm", hours, minutes)
        } else {
            String.format(Locale.ROOT, "%dm", minutes)
        }
    }

    /** Stopwatch-style duration such as "01:05:09". */
    fun clock(millis: Long): String {
        val totalSeconds = millis.coerceAtLeast(0) / 1000
        return String.format(
            Locale.ROOT,
            "%02d:%02d:%02d",
            totalSeconds / 3600,
            (totalSeconds % 3600) / 60,
            totalSeconds % 60,
        )
    }
}

object Weeks {
    /** Weeks start on Monday. */
    fun startOf(date: LocalDate): LocalDate = date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
}

fun LocalDate.startOfDayMillis(zone: ZoneId): Long = atStartOfDay(zone).toInstant().toEpochMilli()

fun Long.toLocalDate(zone: ZoneId): LocalDate = Instant.ofEpochMilli(this).atZone(zone).toLocalDate()

object TimeSplitter {
    /**
     * Splits [entry] into the milliseconds that fall on each local date between [from] (inclusive)
     * and [toExclusive]. A running entry is counted up to [nowMillis]. Days are measured from local
     * midnight to local midnight, so daylight-saving days are 23 or 25 hours long.
     */
    fun millisPerDay(
        entry: TimeEntry,
        nowMillis: Long,
        zone: ZoneId,
        from: LocalDate,
        toExclusive: LocalDate,
    ): Map<LocalDate, Long> {
        val start = maxOf(entry.startMillis, from.startOfDayMillis(zone))
        val end = minOf(entry.endMillis ?: nowMillis, toExclusive.startOfDayMillis(zone))
        if (end <= start) return emptyMap()

        val result = LinkedHashMap<LocalDate, Long>()
        var cursor = start
        while (cursor < end) {
            val date = cursor.toLocalDate(zone)
            val segmentEnd = minOf(end, date.plusDays(1).startOfDayMillis(zone))
            result[date] = (result[date] ?: 0L) + (segmentEnd - cursor)
            cursor = segmentEnd
        }
        return result
    }
}
