package com.timetracker.app.notification

import android.Manifest
import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import com.timetracker.app.R
import com.timetracker.app.service.StopwatchState
import com.timetracker.app.ui.main.MainActivity

/** Notification channels and builders used by the stopwatch and task reminders. */
object Notifications {
    const val CHANNEL_STOPWATCH = "stopwatch"
    const val CHANNEL_REMINDERS = "task_reminders"
    const val STOPWATCH_NOTIFICATION_ID = 1
    private const val REMINDER_NOTIFICATION_ID_OFFSET = 1000

    fun createChannels(context: Context) {
        val manager = context.getSystemService(NotificationManager::class.java) ?: return
        val stopwatch = NotificationChannel(
            CHANNEL_STOPWATCH,
            context.getString(R.string.channel_stopwatch_name),
            NotificationManager.IMPORTANCE_LOW,
        ).apply { description = context.getString(R.string.channel_stopwatch_description) }
        val reminders = NotificationChannel(
            CHANNEL_REMINDERS,
            context.getString(R.string.channel_reminders_name),
            NotificationManager.IMPORTANCE_HIGH,
        ).apply { description = context.getString(R.string.channel_reminders_description) }
        manager.createNotificationChannels(listOf(stopwatch, reminders))
    }

    fun buildStopwatchNotification(context: Context, state: StopwatchState): Notification {
        val activity = state.activity.ifBlank { context.getString(R.string.notification_stopwatch_untitled) }
        return NotificationCompat.Builder(context, CHANNEL_STOPWATCH)
            .setSmallIcon(R.drawable.ic_timer)
            .setContentTitle(context.getString(R.string.notification_stopwatch_title))
            .setContentText(activity)
            .setUsesChronometer(true)
            .setWhen(if (state.isRunning) state.startedAt else System.currentTimeMillis())
            .setShowWhen(true)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
            .setContentIntent(openAppIntent(context, R.id.timeTrackerFragment))
            .build()
    }

    @SuppressLint("MissingPermission") // Checked by canPostNotifications().
    fun showTaskReminder(context: Context, taskId: Long, title: String, description: String) {
        if (!canPostNotifications(context)) return
        val text = description.ifBlank { context.getString(R.string.notification_reminder_text) }
        val notification = NotificationCompat.Builder(context, CHANNEL_REMINDERS)
            .setSmallIcon(R.drawable.ic_alarm)
            .setContentTitle(title)
            .setContentText(text)
            .setStyle(NotificationCompat.BigTextStyle().bigText(text))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setAutoCancel(true)
            .setContentIntent(openAppIntent(context, R.id.taskFragment))
            .build()
        NotificationManagerCompat.from(context)
            .notify(REMINDER_NOTIFICATION_ID_OFFSET + taskId.toInt(), notification)
    }

    fun canPostNotifications(context: Context): Boolean {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) !=
            PackageManager.PERMISSION_GRANTED
        ) {
            return false
        }
        return NotificationManagerCompat.from(context).areNotificationsEnabled()
    }

    private fun openAppIntent(context: Context, destinationId: Int): PendingIntent {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra(MainActivity.EXTRA_DESTINATION, destinationId)
        }
        return PendingIntent.getActivity(
            context,
            destinationId,
            intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )
    }
}
