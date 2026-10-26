package com.timetracker.app.core

import java.time.DayOfWeek
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import java.time.temporal.ChronoUnit
import java.time.temporal.TemporalAdjusters

/** A range of whole days: [start] inclusive to [endExclusive] exclusive. */
data class DateRange(val start: LocalDate, val endExclusive: LocalDate) {

    init {
        require(endExclusive.isAfter(start)) { "endExclusive must be after start" }
    }

    val dayCount: Int get() = ChronoUnit.DAYS.between(start, endExclusive).toInt()

    val lastDay: LocalDate get() = endExclusive.minusDays(1)

    fun days(): List<LocalDate> = (0 until dayCount).map { start.plusDays(it.toLong()) }

    fun startMillis(zone: ZoneId): Long = start.atStartOfDay(zone).toInstant().toEpochMilli()

    fun endMillis(zone: ZoneId): Long = endExclusive.atStartOfDay(zone).toInstant().toEpochMilli()

    operator fun contains(date: LocalDate): Boolean = !date.isBefore(start) && date.isBefore(endExclusive)

    companion object {
        fun day(date: LocalDate): DateRange = DateRange(date, date.plusDays(1))

        fun week(anchor: LocalDate, firstDayOfWeek: DayOfWeek): DateRange {
            val start = anchor.with(TemporalAdjusters.previousOrSame(firstDayOfWeek))
            return DateRange(start, start.plusDays(7))
        }
    }
}

/** Helpers for converting between epoch milliseconds and calendar dates. */
object DateUtils {
    fun toLocalDate(epochMillis: Long, zone: ZoneId): LocalDate =
        Instant.ofEpochMilli(epochMillis).atZone(zone).toLocalDate()

    fun toEpochMillis(date: LocalDate, time: LocalTime, zone: ZoneId): Long =
        date.atTime(time).atZone(zone).toInstant().toEpochMilli()
}

/** Calculations for the sleep tracker. */
object SleepMath {
    /** Longest sleep entry accepted, to catch AM/PM mistakes. */
    const val MAX_SLEEP_MS = 20L * 60 * 60 * 1000

    /**
     * Works out when a night's sleep started and ended. The user picks the day they woke up plus a
     * bedtime and a wake-up time. A bedtime later than the wake-up time (e.g. 23:00 -> 07:00) means
     * the user went to bed the previous evening.
     *
     * @return the start and end of the sleep in epoch milliseconds.
     */
    fun interval(wakeDate: LocalDate, bedtime: LocalTime, wakeTime: LocalTime, zone: ZoneId): Pair<Long, Long> {
        val bedDate = if (bedtime.isBefore(wakeTime)) wakeDate else wakeDate.minusDays(1)
        val start = DateUtils.toEpochMillis(bedDate, bedtime, zone)
        val end = DateUtils.toEpochMillis(wakeDate, wakeTime, zone)
        return start to end
    }

    fun isValidDuration(durationMs: Long): Boolean = durationMs in 1..MAX_SLEEP_MS
}
