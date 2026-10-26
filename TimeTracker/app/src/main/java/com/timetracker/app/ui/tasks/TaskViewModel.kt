package com.timetracker.app.ui.tasks

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.timetracker.app.data.entity.Task
import com.timetracker.app.data.entity.TaskPriority
import com.timetracker.app.data.repository.TaskRepository
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

enum class TaskFilter { ALL, PENDING, DONE }

data class TaskListState(
    val tasks: List<Task> = emptyList(),
    val filter: TaskFilter = TaskFilter.ALL,
    val pendingCount: Int = 0,
    val doneCount: Int = 0,
)

sealed interface TaskEvent {
    data class Deleted(val task: Task) : TaskEvent
    data object Completed : TaskEvent
    data object ReminderInPast : TaskEvent
}

class TaskViewModel(
    private val userId: Long,
    private val taskRepository: TaskRepository,
) : ViewModel() {

    private val filter = MutableStateFlow(TaskFilter.ALL)

    val state: StateFlow<TaskListState> = combine(taskRepository.observeAll(userId), filter) { tasks, filter ->
        TaskListState(
            tasks = when (filter) {
                TaskFilter.ALL -> tasks
                TaskFilter.PENDING -> tasks.filter { !it.isDone }
                TaskFilter.DONE -> tasks.filter { it.isDone }
            },
            filter = filter,
            pendingCount = tasks.count { !it.isDone },
            doneCount = tasks.count { it.isDone },
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), TaskListState())

    private val _events = Channel<TaskEvent>(Channel.BUFFERED)
    val events: Flow<TaskEvent> = _events.receiveAsFlow()

    fun setFilter(newFilter: TaskFilter) {
        filter.value = newFilter
    }

    suspend fun getTask(taskId: Long): Task? = taskRepository.get(taskId)

    /**
     * Creates a task when [taskId] is 0, otherwise updates it. The editor only lets the user pick
     * future reminder times; a reminder that has already fired is kept but not scheduled again.
     */
    fun saveTask(
        taskId: Long,
        title: String,
        description: String,
        priority: TaskPriority,
        reminderAt: Long?,
    ) {
        viewModelScope.launch {
            val existing = if (taskId != 0L) taskRepository.get(taskId) else null
            val task = existing?.copy(
                title = title,
                description = description,
                priority = priority,
                reminderAt = reminderAt,
            ) ?: Task(
                userId = userId,
                title = title,
                description = description,
                priority = priority,
                reminderAt = reminderAt,
            )
            taskRepository.save(task)
        }
    }

    fun setDone(task: Task, done: Boolean) {
        if (task.isDone == done) return
        viewModelScope.launch {
            taskRepository.setDone(task, done)
            if (done) _events.send(TaskEvent.Completed)
        }
    }

    fun setReminder(task: Task, reminderAt: Long?) {
        if (reminderAt != null && reminderAt <= System.currentTimeMillis()) {
            _events.trySend(TaskEvent.ReminderInPast)
            return
        }
        viewModelScope.launch { taskRepository.setReminder(task, reminderAt) }
    }

    fun delete(task: Task) {
        viewModelScope.launch {
            taskRepository.delete(task)
            _events.send(TaskEvent.Deleted(task))
        }
    }

    fun restore(task: Task) {
        viewModelScope.launch { taskRepository.restore(task) }
    }
}
