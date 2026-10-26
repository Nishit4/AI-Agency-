package com.timetracker.app.core

import java.time.LocalDate
import java.time.ZoneId

/** A tracked block of time, decoupled from the database entity so it can be tested on the JVM. */
data class TimeSpan(val activity: String, val start: Long, val end: Long)

data class ActivityTotal(val activity: String, val durationMs: Long)

data class DayTotal(val date: LocalDate, val durationMs: Long)

/** Aggregations used by the report screen. */
object ReportCalculator {

    /** Milliseconds of `[start, end)` that fall inside `[rangeStart, rangeEnd)`. */
    fun overlap(start: Long, end: Long, rangeStart: Long, rangeEnd: Long): Long =
        (minOf(end, rangeEnd) - maxOf(start, rangeStart)).coerceAtLeast(0)

    /** Total time inside the range. Spans that cross the range boundary are clipped. */
    fun totalTime(spans: List<TimeSpan>, rangeStart: Long, rangeEnd: Long): Long =
        spans.sumOf { overlap(it.start, it.end, rangeStart, rangeEnd) }

    /**
     * Time per activity inside the range, longest first. Activity names are grouped ignoring case
     * and surrounding spaces; the first spelling seen is used as the label.
     */
    fun totalsByActivity(spans: List<TimeSpan>, rangeStart: Long, rangeEnd: Long): List<ActivityTotal> {
        val labels = LinkedHashMap<String, String>()
        val totals = LinkedHashMap<String, Long>()
        for (span in spans) {
            val time = overlap(span.start, span.end, rangeStart, rangeEnd)
            if (time <= 0) continue
            val label = span.activity.trim().ifEmpty { "Untitled" }
            val key = label.lowercase()
            labels.getOrPut(key) { label }
            totals[key] = (totals[key] ?: 0L) + time
        }
        return totals.map { (key, time) -> ActivityTotal(labels.getValue(key), time) }
            .sortedByDescending { it.durationMs }
    }

    /** Time per calendar day. Spans that cross midnight are split between the two days. */
    fun totalsByDay(spans: List<TimeSpan>, range: DateRange, zone: ZoneId): List<DayTotal> =
        range.days().map { date ->
            val dayStart = date.atStartOfDay(zone).toInstant().toEpochMilli()
            val dayEnd = date.plusDays(1).atStartOfDay(zone).toInstant().toEpochMilli()
            DayTotal(date, totalTime(spans, dayStart, dayEnd))
        }

    /**
     * Keeps the [maxItems] - 1 largest totals and merges the rest into one item labelled
     * [otherLabel], so charts stay readable.
     */
    fun topWithOther(totals: List<ActivityTotal>, maxItems: Int, otherLabel: String): List<ActivityTotal> {
        require(maxItems >= 2) { "maxItems must be at least 2" }
        if (totals.size <= maxItems) return totals
        val sorted = totals.sortedByDescending { it.durationMs }
        val top = sorted.take(maxItems - 1)
        val rest = sorted.drop(maxItems - 1).sumOf { it.durationMs }
        return top + ActivityTotal(otherLabel, rest)
    }

    /** Average of the given durations, or null when there are none. */
    fun average(durations: List<Long>): Long? =
        if (durations.isEmpty()) null else durations.sum() / durations.size
}
