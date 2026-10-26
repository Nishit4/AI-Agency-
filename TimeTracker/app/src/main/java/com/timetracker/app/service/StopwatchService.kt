package com.timetracker.app.service

import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.ServiceCompat
import androidx.core.content.ContextCompat
import com.timetracker.app.appContainer
import com.timetracker.app.notification.Notifications

/**
 * Foreground service that shows the running stopwatch in the notification shade. The time itself
 * is drawn by the system chronometer, so the service does no work while it runs.
 */
class StopwatchService : Service() {

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val state = appContainer.stopwatch.state.value
        val notification = Notifications.buildStopwatchNotification(this, state)
        val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
        } else {
            0
        }
        try {
            // startForeground must always be called after startForegroundService, even if we stop.
            ServiceCompat.startForeground(this, Notifications.STOPWATCH_NOTIFICATION_ID, notification, type)
        } catch (e: Exception) {
            Log.w(TAG, "Could not show the stopwatch notification", e)
            stopSelf()
            return START_NOT_STICKY
        }
        if (!state.isRunning) {
            ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE)
            stopSelf()
        }
        return START_NOT_STICKY
    }

    companion object {
        private const val TAG = "StopwatchService"

        fun start(context: Context) {
            try {
                ContextCompat.startForegroundService(context, Intent(context, StopwatchService::class.java))
            } catch (e: Exception) {
                // Starting a foreground service from the background is not allowed on newer
                // Android versions. The stopwatch keeps working; only the notification is missing.
                Log.w(TAG, "Could not start the stopwatch service", e)
            }
        }

        fun stop(context: Context) {
            context.stopService(Intent(context, StopwatchService::class.java))
        }
    }
}
