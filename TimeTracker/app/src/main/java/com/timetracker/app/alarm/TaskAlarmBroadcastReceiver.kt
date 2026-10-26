package com.timetracker.app.alarm

import android.app.AlarmManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.timetracker.app.appContainer
import com.timetracker.app.notification.Notifications
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/** Shows the reminder notification when a task alarm fires. */
class TaskAlarmBroadcastReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != ACTION_TASK_REMINDER) return
        val taskId = intent.getLongExtra(EXTRA_TASK_ID, -1L)
        val title = intent.getStringExtra(EXTRA_TITLE) ?: return
        val description = intent.getStringExtra(EXTRA_DESCRIPTION).orEmpty()
        Notifications.showTaskReminder(context, taskId, title, description)
    }

    companion object {
        const val ACTION_TASK_REMINDER = "com.timetracker.app.action.TASK_REMINDER"
        const val EXTRA_TASK_ID = "extra_task_id"
        const val EXTRA_TITLE = "extra_title"
        const val EXTRA_DESCRIPTION = "extra_description"
    }
}

/**
 * Android clears all alarms when the phone restarts, so the signed-in user's upcoming reminders
 * are scheduled again here. The same happens when the exact-alarm permission is granted.
 */
class BootReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        if (action != Intent.ACTION_BOOT_COMPLETED &&
            action != AlarmManager.ACTION_SCHEDULE_EXACT_ALARM_PERMISSION_STATE_CHANGED
        ) {
            return
        }
        val container = context.appContainer
        val userId = container.preferences.currentUserId ?: return
        val pendingResult = goAsync()
        CoroutineScope(Dispatchers.IO).launch {
            try {
                container.taskRepository.rescheduleReminders(userId)
            } finally {
                pendingResult.finish()
            }
        }
    }
}
