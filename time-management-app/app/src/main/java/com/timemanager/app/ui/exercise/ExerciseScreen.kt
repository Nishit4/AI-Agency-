package com.timemanager.app.ui.exercise

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ListItem
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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.timemanager.app.ui.AppViewModelProvider
import com.timemanager.app.ui.components.ConfirmDeleteDialog
import com.timemanager.app.ui.components.EmptyState
import com.timemanager.app.ui.components.SectionHeader
import com.timemanager.app.ui.components.StatCard
import com.timemanager.core.gamification.XpRules
import com.timemanager.core.model.Routine
import com.timemanager.core.model.WorkoutSession
import java.time.LocalDate
import java.time.format.DateTimeFormatter

private val dayFormatter: DateTimeFormatter = DateTimeFormatter.ofPattern("EEE, MMM d")

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ExerciseScreen(viewModel: ExerciseViewModel = viewModel(factory = AppViewModelProvider.Factory)) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    var showAddDialog by rememberSaveable { mutableStateOf(false) }
    var logFor by remember { mutableStateOf<Routine?>(null) }
    var routineToDelete by remember { mutableStateOf<Routine?>(null) }
    var sessionToDelete by remember { mutableStateOf<SessionUi?>(null) }

    Scaffold(
        topBar = { TopAppBar(title = { Text("Exercise") }) },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = { showAddDialog = true },
                icon = { Icon(Icons.Filled.Add, contentDescription = null) },
                text = { Text("Add routine") },
            )
        },
    ) { padding ->
        LazyColumn(
            modifier = Modifier.padding(padding),
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 88.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    StatCard("Workouts this week", "${state.workoutsThisWeek}", Modifier.weight(1f))
                    StatCard("Minutes this week", "${state.minutesThisWeek}", Modifier.weight(1f))
                }
            }
            if (state.routines.isEmpty()) {
                item {
                    EmptyState(
                        icon = Icons.Filled.FitnessCenter,
                        title = "No routines yet",
                        message = "Create a routine, then log it each time you train. Every workout earns ${XpRules.WORKOUT} XP.",
                    )
                }
            } else {
                item { SectionHeader("Routines") }
                items(state.routines, key = { "routine-${it.routine.id}" }) { routine ->
                    RoutineCard(
                        routine = routine,
                        onLog = { logFor = routine.routine },
                        onDelete = { routineToDelete = routine.routine },
                    )
                }
            }
            if (state.recent.isNotEmpty()) {
                item { SectionHeader("Recent workouts") }
                items(state.recent, key = { "session-${it.session.id}" }) { session ->
                    Column {
                        SessionRow(session, onDelete = { sessionToDelete = session })
                        HorizontalDivider()
                    }
                }
            }
        }
    }

    if (showAddDialog) {
        AddRoutineDialog(onAdd = viewModel::addRoutine, onDismiss = { showAddDialog = false })
    }
    logFor?.let { routine ->
        LogWorkoutDialog(
            routineName = routine.name,
            onLog = { minutes -> viewModel.logWorkout(routine, minutes) },
            onDismiss = { logFor = null },
        )
    }
    routineToDelete?.let { routine ->
        ConfirmDeleteDialog(
            title = "Delete routine?",
            message = "\"${routine.name}\" and every workout logged for it will be removed.",
            onConfirm = { viewModel.deleteRoutine(routine) },
            onDismiss = { routineToDelete = null },
        )
    }
    sessionToDelete?.let { session ->
        ConfirmDeleteDialog(
            title = "Delete workout?",
            message = "This removes the ${session.routineName} workout from ${session.session.dayLabel()}.",
            onConfirm = { viewModel.deleteSession(session.session) },
            onDismiss = { sessionToDelete = null },
        )
    }
}

private fun WorkoutSession.dayLabel(): String = LocalDate.ofEpochDay(epochDay).format(dayFormatter)

@Composable
private fun RoutineCard(routine: RoutineUi, onLog: () -> Unit, onDelete: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(routine.routine.name, style = MaterialTheme.typography.titleMedium, modifier = Modifier.weight(1f))
                IconButton(onClick = onDelete) {
                    Icon(Icons.Filled.Delete, contentDescription = "Delete routine")
                }
            }
            routine.exercises.forEach { exercise ->
                Text(
                    "• ${exercise.name} — ${exercise.sets} × ${exercise.reps}",
                    style = MaterialTheme.typography.bodyMedium,
                )
            }
            Spacer(Modifier.height(8.dp))
            Text(
                when {
                    routine.doneToday -> "Done today · ${routine.timesThisWeek} this week"
                    routine.lastDone != null -> "Last done ${routine.lastDone.format(dayFormatter)} · ${routine.timesThisWeek} this week"
                    else -> "Not logged yet"
                },
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(8.dp))
            FilledTonalButton(onClick = onLog) { Text("Log workout") }
        }
    }
}

@Composable
private fun SessionRow(session: SessionUi, onDelete: () -> Unit) {
    ListItem(
        headlineContent = { Text(session.routineName) },
        supportingContent = { Text("${session.session.dayLabel()} · ${session.session.durationMinutes} min") },
        trailingContent = {
            IconButton(onClick = onDelete) {
                Icon(Icons.Filled.Delete, contentDescription = "Delete workout")
            }
        },
    )
}

@Composable
private fun AddRoutineDialog(onAdd: (name: String, exercisesText: String) -> Unit, onDismiss: () -> Unit) {
    var name by rememberSaveable { mutableStateOf("") }
    var exercises by rememberSaveable { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("New routine") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Routine name") },
                    placeholder = { Text("Upper body") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )
                OutlinedTextField(
                    value = exercises,
                    onValueChange = { exercises = it },
                    label = { Text("Exercises") },
                    placeholder = { Text("Push-ups 3x12\nPull-ups 3x8\nPlank") },
                    supportingText = { Text("One per line as \"name sets x reps\". Without sets x reps it defaults to 3 x 10.") },
                    minLines = 3,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        },
        confirmButton = {
            TextButton(
                enabled = name.isNotBlank(),
                onClick = {
                    onAdd(name, exercises)
                    onDismiss()
                },
            ) { Text("Add") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } },
    )
}

@Composable
private fun LogWorkoutDialog(routineName: String, onLog: (minutes: Int) -> Unit, onDismiss: () -> Unit) {
    var minutesText by rememberSaveable { mutableStateOf("30") }
    val minutes = minutesText.toIntOrNull()?.takeIf { it in 1..600 }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Log $routineName") },
        text = {
            OutlinedTextField(
                value = minutesText,
                onValueChange = { input -> minutesText = input.filter(Char::isDigit).take(3) },
                label = { Text("Duration (minutes)") },
                isError = minutes == null,
                supportingText = { Text(if (minutes == null) "Enter 1 to 600 minutes" else "Earns ${XpRules.WORKOUT} XP") },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                modifier = Modifier.fillMaxWidth(),
            )
        },
        confirmButton = {
            TextButton(
                enabled = minutes != null,
                onClick = {
                    if (minutes != null) onLog(minutes)
                    onDismiss()
                },
            ) { Text("Log") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } },
    )
}
