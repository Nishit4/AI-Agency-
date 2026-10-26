package com.timemanager.app.ui.tasks

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.timemanager.app.data.TaskRepository
import com.timemanager.app.data.currentDate
import com.timemanager.core.model.Priority
import com.timemanager.core.model.TaskItem
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.time.Clock
import java.time.LocalDate

data class TasksUiState(
    val active: List<TaskItem> = emptyList(),
    val completed: List<TaskItem> = emptyList(),
    val todayEpochDay: Long = 0,
)

/** Open tasks: highest priority first, then the earliest due date, then the oldest. */
private val activeOrder = compareByDescending<TaskItem> { it.priority }
    .thenBy(nullsLast(naturalOrder<Long>())) { it.dueEpochDay }
    .thenBy { it.createdAtMillis }

class TasksViewModel(private val repository: TaskRepository, clock: Clock) : ViewModel() {

    val uiState: StateFlow<TasksUiState> = combine(repository.tasks, clock.currentDate()) { tasks, today ->
        val (done, open) = tasks.partition { it.isDone }
        TasksUiState(
            active = open.sortedWith(activeOrder),
            completed = done.sortedByDescending { it.completedAtMillis ?: 0L },
            todayEpochDay = today.toEpochDay(),
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), TasksUiState())

    fun add(title: String, notes: String, priority: Priority, due: LocalDate?) {
        viewModelScope.launch { repository.add(title.trim(), notes.trim(), priority, due) }
    }

    fun setDone(task: TaskItem, done: Boolean) {
        viewModelScope.launch { repository.setDone(task, done) }
    }

    fun delete(task: TaskItem) {
        viewModelScope.launch { repository.delete(task.id) }
    }
}
