package com.timemanager.app.ui.habits

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.selection.toggleable
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.Checkbox
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.timemanager.app.ui.AppViewModelProvider
import com.timemanager.app.ui.components.ConfirmDeleteDialog
import com.timemanager.app.ui.components.EmptyState
import com.timemanager.app.ui.components.LevelCard
import com.timemanager.core.gamification.XpRules
import com.timemanager.core.model.Habit
import com.timemanager.core.model.HabitStep

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HabitsScreen(viewModel: HabitsViewModel = viewModel(factory = AppViewModelProvider.Factory)) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    var showAddDialog by rememberSaveable { mutableStateOf(false) }
    var pendingDelete by remember { mutableStateOf<Habit?>(null) }

    Scaffold(
        topBar = { TopAppBar(title = { Text("Habits") }) },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = { showAddDialog = true },
                icon = { Icon(Icons.Filled.Add, contentDescription = null) },
                text = { Text("Add habit") },
            )
        },
    ) { padding ->
        LazyColumn(
            modifier = Modifier.padding(padding),
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 88.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            item { LevelCard(state.level) }
            if (state.habits.isEmpty()) {
                item {
                    EmptyState(
                        icon = Icons.Filled.LocalFireDepartment,
                        title = "No habits yet",
                        message = "Break a habit into small steps, tick them off each day and build a streak.",
                    )
                }
            }
            items(state.habits, key = { it.habit.id }) { habit ->
                HabitCard(
                    habit = habit,
                    onStepChecked = viewModel::setStepChecked,
                    onDelete = { pendingDelete = habit.habit },
                )
            }
        }
    }

    if (showAddDialog) {
        AddHabitDialog(onAdd = viewModel::add, onDismiss = { showAddDialog = false })
    }
    pendingDelete?.let { habit ->
        ConfirmDeleteDialog(
            title = "Delete habit?",
            message = "\"${habit.name}\" and its whole history will be removed, including the XP it earned.",
            onConfirm = { viewModel.delete(habit) },
            onDismiss = { pendingDelete = null },
        )
    }
}

@Composable
private fun HabitCard(
    habit: HabitUi,
    onStepChecked: (HabitStep, Boolean) -> Unit,
    onDelete: () -> Unit,
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(habit.habit.name, style = MaterialTheme.typography.titleMedium, modifier = Modifier.weight(1f))
                Icon(
                    Icons.Filled.LocalFireDepartment,
                    contentDescription = null,
                    tint = if (habit.currentStreak > 0) MaterialTheme.colorScheme.tertiary else MaterialTheme.colorScheme.outline,
                    modifier = Modifier.size(20.dp),
                )
                Text(
                    "${habit.currentStreak}",
                    style = MaterialTheme.typography.titleSmall,
                    modifier = Modifier.padding(start = 4.dp),
                )
                IconButton(onClick = onDelete) {
                    Icon(Icons.Filled.Delete, contentDescription = "Delete habit")
                }
            }
            val doneSteps = habit.steps.count { it.checkedToday }
            Text(
                buildString {
                    append("Today: $doneSteps of ${habit.steps.size} steps")
                    append(" · Best streak: ${habit.bestStreak} ${if (habit.bestStreak == 1) "day" else "days"}")
                },
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(8.dp))
            LinearProgressIndicator(progress = { habit.progressToday }, modifier = Modifier.fillMaxWidth())
            Spacer(Modifier.height(4.dp))
            habit.steps.forEach { step ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .toggleable(
                            value = step.checkedToday,
                            role = Role.Checkbox,
                            onValueChange = { onStepChecked(step.step, it) },
                        ),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Checkbox(checked = step.checkedToday, onCheckedChange = null)
                    Text(
                        step.step.title,
                        modifier = Modifier.padding(start = 12.dp, top = 12.dp, bottom = 12.dp),
                        textDecoration = if (step.checkedToday) TextDecoration.LineThrough else null,
                    )
                }
            }
            if (habit.doneToday) {
                Text(
                    "Done for today · +${XpRules.HABIT_DAY_BONUS} XP bonus",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.primary,
                )
            }
        }
    }
}

@Composable
private fun AddHabitDialog(onAdd: (name: String, stepsText: String) -> Unit, onDismiss: () -> Unit) {
    var name by rememberSaveable { mutableStateOf("") }
    var steps by rememberSaveable { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("New habit") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Habit") },
                    placeholder = { Text("Morning walk") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )
                OutlinedTextField(
                    value = steps,
                    onValueChange = { steps = it },
                    label = { Text("Small steps (optional)") },
                    placeholder = { Text("Put on shoes\nWalk 10 minutes\nStretch") },
                    supportingText = { Text("One step per line. Each step earns ${XpRules.HABIT_STEP} XP.") },
                    minLines = 3,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        },
        confirmButton = {
            TextButton(
                enabled = name.isNotBlank(),
                onClick = {
                    onAdd(name, steps)
                    onDismiss()
                },
            ) { Text("Add") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } },
    )
}
