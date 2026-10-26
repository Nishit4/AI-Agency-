package com.timetracker.app.ui.common

import android.content.Context
import android.text.format.DateFormat
import com.timetracker.app.core.DateRange
import java.time.DayOfWeek
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.time.temporal.WeekFields
import java.util.Date
import java.util.Locale

/** Date and time formatting that follows the device's language and 12/24-hour setting. */
object UiFormat {

    private val shortDateFormatter get() = DateTimeFormatter.ofPattern("EEE, d MMM", Locale.getDefault())
    private val dayMonthFormatter get() = DateTimeFormatter.ofPattern("d MMM", Locale.getDefault())
    private val fullDateFormatter get() = DateTimeFormatter.ofPattern("EEE, d MMM yyyy", Locale.getDefault())
    private val longDateFormatter get() = DateTimeFormatter.ofPattern("EEEE, d MMMM", Locale.getDefault())
    private val weekdayFormatter get() = DateTimeFormatter.ofPattern("EEE", Locale.getDefault())

    fun time(context: Context, epochMillis: Long): String =
        DateFormat.getTimeFormat(context).format(Date(epochMillis))

    fun time(context: Context, time: LocalTime): String =
        time(context, LocalDate.now().atTime(time).atZone(ZoneId.systemDefault()).toInstant().toEpochMilli())

    fun shortDate(date: LocalDate): String = shortDateFormatter.format(date)

    fun shortDate(epochMillis: Long): String = shortDate(toLocalDate(epochMillis))

    fun longDate(date: LocalDate): String = longDateFormatter.format(date)

    fun weekday(date: LocalDate): String = weekdayFormatter.format(date)

    fun dateTime(context: Context, epochMillis: Long): String =
        "${shortDate(epochMillis)}, ${time(context, epochMillis)}"

    fun timeRange(context: Context, start: Long, end: Long): String =
        "${time(context, start)} – ${time(context, end)}"

    fun rangeLabel(range: DateRange): String =
        if (range.dayCount == 1) {
            fullDateFormatter.format(range.start)
        } else {
            "${dayMonthFormatter.format(range.start)} – ${fullDateFormatter.format(range.lastDay)}"
        }

    /** First day of the week for the device's region (Monday in most countries, Sunday in some). */
    fun firstDayOfWeek(): DayOfWeek = WeekFields.of(Locale.getDefault()).firstDayOfWeek

    fun toLocalDate(epochMillis: Long): LocalDate =
        Instant.ofEpochMilli(epochMillis).atZone(ZoneId.systemDefault()).toLocalDate()

    fun toLocalTime(epochMillis: Long): LocalTime =
        Instant.ofEpochMilli(epochMillis).atZone(ZoneId.systemDefault()).toLocalTime()
}
