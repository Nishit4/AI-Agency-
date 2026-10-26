package com.timetracker.app.core

import java.util.Locale

/** Formatting helpers for durations. Pure Kotlin so they can be unit tested on the JVM. */
object TimeFormat {

    /** Formats a duration as a stopwatch reading, e.g. `01:02:03`. */
    fun stopwatch(durationMs: Long): String {
        val totalSeconds = durationMs.coerceAtLeast(0) / 1000
        val hours = totalSeconds / 3600
        val minutes = (totalSeconds % 3600) / 60
        val seconds = totalSeconds % 60
        return String.format(Locale.US, "%02d:%02d:%02d", hours, minutes, seconds)
    }

    /** Formats a duration in a compact human form, e.g. `2h 5m`, `45m` or `30s`. */
    fun duration(durationMs: Long): String {
        val totalSeconds = durationMs.coerceAtLeast(0) / 1000
        val hours = totalSeconds / 3600
        val minutes = (totalSeconds % 3600) / 60
        val seconds = totalSeconds % 60
        return when {
            hours > 0 && minutes > 0 -> "${hours}h ${minutes}m"
            hours > 0 -> "${hours}h"
            minutes > 0 -> "${minutes}m"
            else -> "${seconds}s"
        }
    }

    /** Formats a duration as decimal hours with one digit, e.g. `2.5h`. Used for chart labels. */
    fun hoursDecimal(durationMs: Long): String {
        val hours = durationMs.coerceAtLeast(0) / 3_600_000.0
        return String.format(Locale.US, "%.1fh", hours)
    }
}
