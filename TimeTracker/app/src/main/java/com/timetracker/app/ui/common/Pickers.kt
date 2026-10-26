package com.timetracker.app.ui.common

import android.content.Context
import android.text.format.DateFormat
import androidx.annotation.StringRes
import androidx.fragment.app.FragmentManager
import com.google.android.material.datepicker.CalendarConstraints
import com.google.android.material.datepicker.DateValidatorPointForward
import com.google.android.material.datepicker.MaterialDatePicker
import com.google.android.material.timepicker.MaterialTimePicker
import com.timetracker.app.R
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import java.time.ZoneOffset
import com.google.android.material.timepicker.TimeFormat as ClockFormat

/** Wrappers around the Material date and time pickers that work with java.time values. */
object Pickers {

    fun pickDate(
        fragmentManager: FragmentManager,
        initial: LocalDate,
        @StringRes title: Int,
        futureOnly: Boolean = false,
        onPicked: (LocalDate) -> Unit,
    ) {
        // MaterialDatePicker works with UTC midnight timestamps.
        val builder = MaterialDatePicker.Builder.datePicker()
            .setTitleText(title)
            .setSelection(initial.atStartOfDay(ZoneOffset.UTC).toInstant().toEpochMilli())
        if (futureOnly) {
            builder.setCalendarConstraints(
                CalendarConstraints.Builder()
                    .setValidator(DateValidatorPointForward.from(MaterialDatePicker.todayInUtcMilliseconds()))
                    .build()
            )
        }
        val picker = builder.build()
        picker.addOnPositiveButtonClickListener { selection ->
            onPicked(Instant.ofEpochMilli(selection).atZone(ZoneOffset.UTC).toLocalDate())
        }
        picker.show(fragmentManager, "date_picker")
    }

    fun pickTime(
        context: Context,
        fragmentManager: FragmentManager,
        initial: LocalTime,
        @StringRes title: Int,
        onPicked: (LocalTime) -> Unit,
    ) {
        val format = if (DateFormat.is24HourFormat(context)) ClockFormat.CLOCK_24H else ClockFormat.CLOCK_12H
        val picker = MaterialTimePicker.Builder()
            .setTimeFormat(format)
            .setHour(initial.hour)
            .setMinute(initial.minute)
            .setTitleText(title)
            .build()
        picker.addOnPositiveButtonClickListener { onPicked(LocalTime.of(picker.hour, picker.minute)) }
        picker.show(fragmentManager, "time_picker")
    }

    /** Asks for a future date and then a time, and returns the combined moment in epoch millis. */
    fun pickReminder(
        context: Context,
        fragmentManager: FragmentManager,
        initial: Long?,
        onPicked: (Long) -> Unit,
    ) {
        val zone = ZoneId.systemDefault()
        val start = initial?.let { Instant.ofEpochMilli(it).atZone(zone) }
            ?: Instant.now().atZone(zone).plusHours(1).withMinute(0)
        pickDate(fragmentManager, start.toLocalDate(), R.string.reminder_pick_date, futureOnly = true) { date ->
            pickTime(context, fragmentManager, start.toLocalTime(), R.string.reminder_pick_time) { time ->
                onPicked(date.atTime(time).atZone(zone).toInstant().toEpochMilli())
            }
        }
    }
}
