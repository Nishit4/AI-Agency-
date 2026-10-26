package com.timemanager.app.ui.timer

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ListItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.timemanager.app.ui.AppViewModelProvider
import com.timemanager.app.ui.components.ConfirmDeleteDialog
import com.timemanager.app.ui.components.SectionHeader
import com.timemanager.core.model.TimeEntry
import com.timemanager.core.time.DurationFormat
import kotlinx.coroutines.delay
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.time.format.FormatStyle

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TimerScreen(viewModel: TimerViewModel = viewModel(factory = AppViewModelProvider.Factory)) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    var category by rememberSaveable { mutableStateOf(DefaultCategories.first()) }
    var note by rememberSaveable { mutableStateOf("") }
    var pendingDelete by remember { mutableStateOf<TimeEntry?>(null) }

    // Re-read the clock every second while a timer runs.
    val running = state.running
    var now by remember { mutableLongStateOf(System.currentTimeMillis()) }
    LaunchedEffect(running?.id) {
        now = System.currentTimeMillis()
        while (running != null) {
            delay(1_000)
            now = System.currentTimeMillis()
        }
    }

    val todayTotal = state.todayEntries.sumOf { entry ->
        val start = maxOf(entry.startMillis, state.dayStartMillis)
        val end = minOf(entry.endMillis ?: now, state.dayEndMillis)
        (end - start).coerceAtLeast(0)
    }

    Scaffold(topBar = { TopAppBar(title = { Text("Time tracker") }) }) { padding ->
        LazyColumn(
            modifier = Modifier.padding(padding),
            contentPadding = PaddingValues(16.dp),
        ) {
            item {
                TimerCard(
                    running = running,
                    now = now,
                    category = category,
                    onCategoryChange = { category = it },
                    note = note,
                    onNoteChange = { note = it },
                    onStart = {
                        viewModel.start(category, note)
                        note = ""
                    },
                    onStop = viewModel::stop,
                )
            }
            item {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    SectionHeader("Today", modifier = Modifier.weight(1f))
                    Text(
                        DurationFormat.short(todayTotal),
                        style = MaterialTheme.typography.titleSmall,
                        modifier = Modifier.padding(top = 8.dp),
                    )
                }
            }
            if (state.todayEntries.isEmpty()) {
                item {
                    Text(
                        "Nothing tracked yet today. Pick a category and press Start.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
            items(state.todayEntries, key = { it.id }) { entry ->
                Column {
                    TimeEntryRow(entry = entry, now = now, onDelete = { pendingDelete = entry })
                    HorizontalDivider()
                }
            }
        }
    }

    pendingDelete?.let { entry ->
        ConfirmDeleteDialog(
            title = "Delete entry?",
            message = "This removes ${entry.category} (${DurationFormat.short(entry.durationMillis(now))}) from your history.",
            onConfirm = { viewModel.delete(entry) },
            onDismiss = { pendingDelete = null },
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun TimerCard(
    running: TimeEntry?,
    now: Long,
    category: String,
    onCategoryChange: (String) -> Unit,
    note: String,
    onNoteChange: (String) -> Unit,
    onStart: () -> Unit,
    onStop: () -> Unit,
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text(
                if (running != null) "Tracking · ${running.category}" else "Ready to track",
                style = MaterialTheme.typography.titleMedium,
            )
            Text(
                DurationFormat.clock(running?.durationMillis(now) ?: 0),
                style = MaterialTheme.typography.displayMedium,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.SemiBold,
            )
            if (running != null) {
                if (running.note.isNotBlank()) {
                    Text(running.note, style = MaterialTheme.typography.bodyMedium)
                }
                Button(
                    onClick = onStop,
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error),
                ) {
                    Icon(Icons.Filled.Stop, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("Stop")
                }
            } else {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    DefaultCategories.forEach { option ->
                        FilterChip(
                            selected = option == category,
                            onClick = { onCategoryChange(option) },
                            label = { Text(option) },
                        )
                    }
                }
                OutlinedTextField(
                    value = note,
                    onValueChange = onNoteChange,
                    label = { Text("What are you working on? (optional)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )
                Button(onClick = onStart) {
                    Icon(Icons.Filled.PlayArrow, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("Start")
                }
            }
        }
    }
}

private val timeFormatter: DateTimeFormatter = DateTimeFormatter.ofLocalizedTime(FormatStyle.SHORT)

private fun formatTime(millis: Long): String =
    Instant.ofEpochMilli(millis).atZone(ZoneId.systemDefault()).toLocalTime().format(timeFormatter)

@Composable
private fun TimeEntryRow(entry: TimeEntry, now: Long, onDelete: () -> Unit) {
    val range = "${formatTime(entry.startMillis)} – ${entry.endMillis?.let(::formatTime) ?: "now"}"
    ListItem(
        headlineContent = { Text(entry.category) },
        supportingContent = {
            Text(if (entry.note.isBlank()) range else "$range · ${entry.note}")
        },
        trailingContent = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(DurationFormat.short(entry.durationMillis(now)), style = MaterialTheme.typography.labelLarge)
                IconButton(onClick = onDelete) {
                    Icon(Icons.Filled.Delete, contentDescription = "Delete entry")
                }
            }
        },
    )
}
