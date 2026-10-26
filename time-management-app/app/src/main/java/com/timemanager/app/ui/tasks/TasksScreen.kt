package com.timemanager.app.ui.tasks

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Event
import androidx.compose.material.icons.filled.TaskAlt
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Checkbox
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ListItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.timemanager.app.ui.AppViewModelProvider
import com.timemanager.app.ui.components.ConfirmDeleteDialog
import com.timemanager.app.ui.components.EmptyState
import com.timemanager.app.ui.components.SectionHeader
import com.timemanager.core.model.Priority
import com.timemanager.core.model.TaskItem
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter

private val dueFormatter: DateTimeFormatter = DateTimeFormatter.ofPattern("EEE, MMM d")

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TasksScreen(viewModel: TasksViewModel = viewModel(factory = AppViewModelProvider.Factory)) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    var showAddDialog by rememberSaveable { mutableStateOf(false) }
    var pendingDelete by remember { mutableStateOf<TaskItem?>(null) }

    Scaffold(
        topBar = { TopAppBar(title = { Text("To-do list") }) },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = { showAddDialog = true },
                icon = { Icon(Icons.Filled.Add, contentDescription = null) },
                text = { Text("Add task") },
            )
        },
    ) { padding ->
        if (state.active.isEmpty() && state.completed.isEmpty()) {
            EmptyState(
                icon = Icons.Filled.TaskAlt,
                title = "No tasks yet",
                message = "Add what you need to get done. Finished tasks earn XP.",
                modifier = Modifier.padding(padding),
            )
        } else {
            LazyColumn(
                modifier = Modifier.padding(padding),
                contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 88.dp),
            ) {
                item { SectionHeader("To do · ${state.active.size}") }
                items(state.active, key = { it.id }) { task ->
                    Column {
                        TaskRow(task, state.todayEpochDay, viewModel::setDone, onDelete = { pendingDelete = task })
                        HorizontalDivider()
                    }
                }
                if (state.completed.isNotEmpty()) {
                    item { SectionHeader("Completed · ${state.completed.size}") }
                    items(state.completed, key = { it.id }) { task ->
                        Column {
                            TaskRow(task, state.todayEpochDay, viewModel::setDone, onDelete = { pendingDelete = task })
                            HorizontalDivider()
                        }
                    }
                }
            }
        }
    }

    if (showAddDialog) {
        AddTaskDialog(
            onAdd = { title, notes, priority, due -> viewModel.add(title, notes, priority, due) },
            onDismiss = { showAddDialog = false },
        )
    }
    pendingDelete?.let { task ->
        ConfirmDeleteDialog(
            title = "Delete task?",
            message = "\"${task.title}\" will be removed.",
            onConfirm = { viewModel.delete(task) },
            onDismiss = { pendingDelete = null },
        )
    }
}

@Composable
private fun TaskRow(
    task: TaskItem,
    todayEpochDay: Long,
    onDoneChange: (TaskItem, Boolean) -> Unit,
    onDelete: () -> Unit,
) {
    ListItem(
        leadingContent = {
            Checkbox(checked = task.isDone, onCheckedChange = { onDoneChange(task, it) })
        },
        headlineContent = {
            Text(
                task.title,
                textDecoration = if (task.isDone) TextDecoration.LineThrough else null,
                color = if (task.isDone) MaterialTheme.colorScheme.onSurfaceVariant else Color.Unspecified,
            )
        },
        supportingContent = {
            val due = task.dueEpochDay
            if (task.notes.isNotBlank() || due != null) {
                Column {
                    if (task.notes.isNotBlank()) Text(task.notes)
                    if (due != null) {
                        val overdue = !task.isDone && due < todayEpochDay
                        Text(
                            when {
                                due == todayEpochDay -> "Due today"
                                overdue -> "Overdue · ${LocalDate.ofEpochDay(due).format(dueFormatter)}"
                                else -> "Due ${LocalDate.ofEpochDay(due).format(dueFormatter)}"
                            },
                            color = if (overdue) MaterialTheme.colorScheme.error else Color.Unspecified,
                            style = MaterialTheme.typography.labelMedium,
                        )
                    }
                }
            }
        },
        trailingContent = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                PriorityBadge(task.priority)
                IconButton(onClick = onDelete) {
                    Icon(Icons.Filled.Delete, contentDescription = "Delete task")
                }
            }
        },
    )
}

@Composable
private fun PriorityBadge(priority: Priority) {
    val (container, content) = when (priority) {
        Priority.HIGH -> MaterialTheme.colorScheme.errorContainer to MaterialTheme.colorScheme.onErrorContainer
        Priority.MEDIUM -> MaterialTheme.colorScheme.secondaryContainer to MaterialTheme.colorScheme.onSecondaryContainer
        Priority.LOW -> MaterialTheme.colorScheme.surfaceVariant to MaterialTheme.colorScheme.onSurfaceVariant
    }
    Surface(color = container, contentColor = content, shape = RoundedCornerShape(8.dp)) {
        Text(
            priority.label(),
            style = MaterialTheme.typography.labelSmall,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
        )
    }
}

private fun Priority.label(): String = name.lowercase().replaceFirstChar { it.uppercase() }

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AddTaskDialog(
    onAdd: (title: String, notes: String, priority: Priority, due: LocalDate?) -> Unit,
    onDismiss: () -> Unit,
) {
    var title by rememberSaveable { mutableStateOf("") }
    var notes by rememberSaveable { mutableStateOf("") }
    var priority by rememberSaveable { mutableStateOf(Priority.MEDIUM) }
    var due by rememberSaveable { mutableStateOf<LocalDate?>(null) }
    var showDatePicker by rememberSaveable { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("New task") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Title") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )
                OutlinedTextField(
                    value = notes,
                    onValueChange = { notes = it },
                    label = { Text("Notes (optional)") },
                    modifier = Modifier.fillMaxWidth(),
                )
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Priority.entries.forEach { option ->
                        FilterChip(
                            selected = option == priority,
                            onClick = { priority = option },
                            label = { Text(option.label()) },
                        )
                    }
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    TextButton(onClick = { showDatePicker = true }) {
                        Icon(Icons.Filled.Event, contentDescription = null)
                        Text(
                            due?.let { "Due ${it.format(dueFormatter)}" } ?: "Set due date",
                            modifier = Modifier.padding(start = 8.dp),
                        )
                    }
                    if (due != null) {
                        IconButton(onClick = { due = null }) {
                            Icon(Icons.Filled.Close, contentDescription = "Clear due date")
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(
                enabled = title.isNotBlank(),
                onClick = {
                    onAdd(title, notes, priority, due)
                    onDismiss()
                },
            ) { Text("Add") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } },
    )

    if (showDatePicker) {
        // The date picker works in UTC milliseconds.
        val pickerState = rememberDatePickerState(
            initialSelectedDateMillis = (due ?: LocalDate.now()).atStartOfDay(ZoneOffset.UTC).toInstant().toEpochMilli(),
        )
        DatePickerDialog(
            onDismissRequest = { showDatePicker = false },
            confirmButton = {
                TextButton(onClick = {
                    pickerState.selectedDateMillis?.let {
                        due = Instant.ofEpochMilli(it).atZone(ZoneOffset.UTC).toLocalDate()
                    }
                    showDatePicker = false
                }) { Text("OK") }
            },
            dismissButton = { TextButton(onClick = { showDatePicker = false }) { Text("Cancel") } },
        ) {
            DatePicker(state = pickerState)
        }
    }
}
