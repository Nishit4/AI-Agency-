package com.timetracker.app.alarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import com.timetracker.app.data.entity.Task

/** Schedules and cancels the alarm that reminds the user about a task. */
class TaskAlarmScheduler(private val context: Context) {

    private val alarmManager: AlarmManager = checkNotNull(context.getSystemService(AlarmManager::class.java))

    /**
     * Exact alarms need the "Alarms & reminders" permission on Android 12+. Without it the
     * reminder is still delivered, but Android may delay it by a few minutes.
     */
    fun canScheduleExactAlarms(): Boolean =
        Build.VERSION.SDK_INT < Build.VERSION_CODES.S || alarmManager.canScheduleExactAlarms()

    fun schedule(task: Task) {
        val reminderAt = task.reminderAt
        if (task.isDone || reminderAt == null || reminderAt <= System.currentTimeMillis()) {
            cancel(task.id)
            return
        }
        val intent = reminderIntent(task.id).apply {
            putExtra(TaskAlarmBroadcastReceiver.EXTRA_TASK_ID, task.id)
            putExtra(TaskAlarmBroadcastReceiver.EXTRA_TITLE, task.title)
            putExtra(TaskAlarmBroadcastReceiver.EXTRA_DESCRIPTION, task.description)
        }
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            requestCode(task.id),
            intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )
        try {
            if (canScheduleExactAlarms()) {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, reminderAt, pendingIntent)
            } else {
                alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, reminderAt, pendingIntent)
            }
        } catch (e: SecurityException) {
            // The exact alarm permission was revoked between the check and the call.
            alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, reminderAt, pendingIntent)
        }
    }

    fun cancel(taskId: Long) {
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            requestCode(taskId),
            reminderIntent(taskId),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_NO_CREATE,
        ) ?: return
        alarmManager.cancel(pendingIntent)
        pendingIntent.cancel()
    }

    /** The data URI makes each task's PendingIntent unique. */
    private fun reminderIntent(taskId: Long): Intent =
        Intent(context, TaskAlarmBroadcastReceiver::class.java).apply {
            action = TaskAlarmBroadcastReceiver.ACTION_TASK_REMINDER
            data = Uri.parse("timetracker://task/$taskId")
        }

    private fun requestCode(taskId: Long): Int = taskId.toInt()
}
