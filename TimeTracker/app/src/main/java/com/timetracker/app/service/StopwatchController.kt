package com.timetracker.app.service

import android.content.Context
import com.timetracker.app.data.AppPreferences
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * State of the stopwatch. Only the start time is stored, so the elapsed time is always
 * `now - startedAt` and survives the app being closed or the phone being restarted.
 */
data class StopwatchState(
    val isRunning: Boolean,
    val startedAt: Long,
    val activity: String,
) {
    fun elapsed(now: Long = System.currentTimeMillis()): Long =
        if (isRunning) (now - startedAt).coerceAtLeast(0) else 0L

    companion object {
        val STOPPED = StopwatchState(isRunning = false, startedAt = 0L, activity = "")
    }
}

/** Starts and stops the stopwatch and keeps [StopwatchService] in step with it. */
class StopwatchController(
    private val context: Context,
    private val preferences: AppPreferences,
) {
    private val _state = MutableStateFlow(preferences.loadStopwatch())
    val state: StateFlow<StopwatchState> = _state.asStateFlow()

    /** Starts timing a new segment at [now]. Also used to begin the next segment after a lap. */
    fun start(activity: String, now: Long = System.currentTimeMillis()) {
        update(StopwatchState(isRunning = true, startedAt = now, activity = activity.trim()))
        StopwatchService.start(context)
    }

    fun stop() {
        update(StopwatchState.STOPPED)
        StopwatchService.stop(context)
    }

    /** Shows the notification again if the app was closed while the stopwatch was running. */
    fun ensureServiceRunning() {
        if (_state.value.isRunning) StopwatchService.start(context)
    }

    private fun update(newState: StopwatchState) {
        _state.value = newState
        preferences.saveStopwatch(newState)
    }
}
