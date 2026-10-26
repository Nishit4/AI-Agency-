package com.timetracker.app.data.repository

import com.timetracker.app.alarm.TaskAlarmScheduler
import com.timetracker.app.data.dao.TaskDao
import com.timetracker.app.data.entity.Task
import kotlinx.coroutines.flow.Flow

/** To-do list storage. Keeps task alarms in sync whenever a task changes. */
class TaskRepository(
    private val taskDao: TaskDao,
    private val alarmScheduler: TaskAlarmScheduler,
) {
    fun observeAll(userId: Long): Flow<List<Task>> = taskDao.observeAll(userId)

    fun observePending(userId: Long): Flow<List<Task>> = taskDao.observePending(userId)

    suspend fun get(taskId: Long): Task? = taskDao.findById(taskId)

    /** Inserts a new task (id 0) or updates an existing one, then (re)schedules its alarm. */
    suspend fun save(task: Task): Long {
        val id = if (task.id == 0L) taskDao.insert(task) else task.id.also { taskDao.update(task) }
        alarmScheduler.schedule(task.copy(id = id))
        return id
    }

    suspend fun setDone(task: Task, done: Boolean) {
        val updated = task.copy(isDone = done, completedAt = if (done) System.currentTimeMillis() else null)
        taskDao.update(updated)
        alarmScheduler.schedule(updated)
    }

    suspend fun setReminder(task: Task, reminderAt: Long?) {
        save(task.copy(reminderAt = reminderAt))
    }

    suspend fun delete(task: Task) {
        alarmScheduler.cancel(task.id)
        taskDao.delete(task)
    }

    /** Puts back a task removed with [delete] (used by the "Undo" action). */
    suspend fun restore(task: Task) {
        taskDao.insert(task)
        alarmScheduler.schedule(task)
    }

    /** Alarms are cleared when the device restarts, so they are scheduled again after boot. */
    suspend fun rescheduleReminders(userId: Long) {
        taskDao.findUpcomingReminders(userId, System.currentTimeMillis()).forEach(alarmScheduler::schedule)
    }

    /** Stops a signed-out user's reminders from firing. */
    suspend fun cancelReminders(userId: Long) {
        taskDao.findWithReminders(userId).forEach { alarmScheduler.cancel(it.id) }
    }
}
