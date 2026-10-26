package com.timetracker.app.data

import android.content.Context
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.content.edit
import com.timetracker.app.service.StopwatchState

/** Small key-value settings: the signed-in user, theme and the running stopwatch. */
class AppPreferences(context: Context) {

    private val prefs = context.getSharedPreferences(FILE_NAME, Context.MODE_PRIVATE)

    /** Id of the signed-in user, or null when nobody is signed in. */
    var currentUserId: Long?
        get() = prefs.getLong(KEY_USER_ID, NO_USER).takeIf { it != NO_USER }
        set(value) = prefs.edit {
            if (value == null) remove(KEY_USER_ID) else putLong(KEY_USER_ID, value)
        }

    val isLoggedIn: Boolean get() = currentUserId != null

    /** Used by screens that are only reachable after signing in. */
    fun requireUserId(): Long = checkNotNull(currentUserId) { "No user is signed in" }

    /** One of the `AppCompatDelegate.MODE_NIGHT_*` constants. */
    var themeMode: Int
        get() = prefs.getInt(KEY_THEME_MODE, AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM)
        set(value) = prefs.edit { putInt(KEY_THEME_MODE, value) }

    var notificationPermissionAsked: Boolean
        get() = prefs.getBoolean(KEY_NOTIFICATION_ASKED, false)
        set(value) = prefs.edit { putBoolean(KEY_NOTIFICATION_ASKED, value) }

    fun loadStopwatch(): StopwatchState = StopwatchState(
        isRunning = prefs.getBoolean(KEY_STOPWATCH_RUNNING, false),
        startedAt = prefs.getLong(KEY_STOPWATCH_STARTED_AT, 0L),
        activity = prefs.getString(KEY_STOPWATCH_ACTIVITY, null).orEmpty(),
    )

    fun saveStopwatch(state: StopwatchState) = prefs.edit {
        putBoolean(KEY_STOPWATCH_RUNNING, state.isRunning)
        putLong(KEY_STOPWATCH_STARTED_AT, state.startedAt)
        putString(KEY_STOPWATCH_ACTIVITY, state.activity)
    }

    private companion object {
        const val FILE_NAME = "time_tracker_prefs"
        const val NO_USER = -1L
        const val KEY_USER_ID = "current_user_id"
        const val KEY_THEME_MODE = "theme_mode"
        const val KEY_NOTIFICATION_ASKED = "notification_permission_asked"
        const val KEY_STOPWATCH_RUNNING = "stopwatch_running"
        const val KEY_STOPWATCH_STARTED_AT = "stopwatch_started_at"
        const val KEY_STOPWATCH_ACTIVITY = "stopwatch_activity"
    }
}
