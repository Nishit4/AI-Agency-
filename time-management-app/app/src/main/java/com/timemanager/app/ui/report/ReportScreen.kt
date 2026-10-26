package com.timemanager.app.ui.report

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowLeft
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.timemanager.app.ui.AppViewModelProvider
import com.timemanager.app.ui.components.SectionHeader
import com.timemanager.app.ui.components.StatCard
import com.timemanager.core.report.DayTotal
import com.timemanager.core.report.WeeklyReport
import com.timemanager.core.time.DurationFormat
import java.time.format.DateTimeFormatter
import java.time.format.TextStyle
import java.util.Locale
import kotlin.math.roundToInt

private val shortDate: DateTimeFormatter = DateTimeFormatter.ofPattern("MMM d")
private val longDate: DateTimeFormatter = DateTimeFormatter.ofPattern("MMM d, yyyy")

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReportScreen(viewModel: ReportViewModel = viewModel(factory = AppViewModelProvider.Factory)) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    Scaffold(topBar = { TopAppBar(title = { Text("Weekly report") }) }) { padding ->
        val report = state.report
        if (report == null) {
            Box(
                Modifier
                    .padding(padding)
                    .fillMaxSize(),
                contentAlignment = Alignment.Center,
            ) { CircularProgressIndicator() }
        } else {
            ReportContent(
                report = report,
                isCurrentWeek = state.isCurrentWeek,
                onPrevious = viewModel::previousWeek,
                onNext = viewModel::nextWeek,
                modifier = Modifier.padding(padding),
            )
        }
    }
}

@Composable
private fun ReportContent(
    report: WeeklyReport,
    isCurrentWeek: Boolean,
    onPrevious: () -> Unit,
    onNext: () -> Unit,
    modifier: Modifier = Modifier,
) {
    LazyColumn(
        modifier = modifier,
        contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 24.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            WeekSelector(
                report = report,
                isCurrentWeek = isCurrentWeek,
                onPrevious = onPrevious,
                onNext = onNext,
            )
        }
        item { Summary(report) }
        item {
            Column {
                SectionHeader("Time per day")
                DayBars(report.byDay)
            }
        }
        item { SectionHeader("Time by category") }
        if (report.byCategory.isEmpty()) {
            item { Hint("No time tracked this week. Start the timer to see where your time goes.") }
        }
        items(report.byCategory, key = { it.category }) { category ->
            LabeledProgress(
                label = category.category,
                value = DurationFormat.short(category.millis),
                progress = category.millis.toFloat() / report.totalTrackedMillis.coerceAtLeast(1),
            )
        }
        item { SectionHeader("Habits") }
        if (report.habits.isEmpty()) {
            item { Hint("No habits yet. Add one on the Habits tab.") }
        }
        items(report.habits, key = { it.habitId }) { habit ->
            LabeledProgress(
                label = habit.name,
                value = if (habit.eligibleDays == 0) "Not started" else "${habit.daysCompleted} of ${habit.eligibleDays} days",
                progress = if (habit.eligibleDays == 0) 0f else habit.daysCompleted.toFloat() / habit.eligibleDays,
            )
        }
    }
}

@Composable
private fun WeekSelector(report: WeeklyReport, isCurrentWeek: Boolean, onPrevious: () -> Unit, onNext: () -> Unit) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        IconButton(onClick = onPrevious) {
            Icon(Icons.AutoMirrored.Filled.KeyboardArrowLeft, contentDescription = "Previous week")
        }
        Column(Modifier.weight(1f), horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                "${report.weekStart.format(shortDate)} – ${report.weekEnd.format(longDate)}",
                style = MaterialTheme.typography.titleMedium,
            )
            if (isCurrentWeek) {
                Text("This week", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.primary)
            }
        }
        IconButton(onClick = onNext, enabled = !isCurrentWeek) {
            Icon(Icons.AutoMirrored.Filled.KeyboardArrowRight, contentDescription = "Next week")
        }
    }
}

@Composable
private fun Summary(report: WeeklyReport) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            StatCard("Time tracked", DurationFormat.short(report.totalTrackedMillis), Modifier.weight(1f))
            StatCard("Tasks completed", "${report.tasksCompleted}", Modifier.weight(1f))
        }
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            StatCard(
                "Habit days completed",
                report.habitCompletionRate?.let { "${(it * 100).roundToInt()}%" } ?: "—",
                Modifier.weight(1f),
            )
            StatCard("Workouts · ${report.workoutMinutes} min", "${report.workouts}", Modifier.weight(1f))
        }
        StatCard("XP earned this week", "+${report.xpEarned} XP", Modifier.fillMaxWidth())
    }
}

@Composable
private fun DayBars(days: List<DayTotal>) {
    val maxMillis = days.maxOfOrNull { it.millis }?.takeIf { it > 0 } ?: 1L
    Card(Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(180.dp)
                .padding(12.dp),
            verticalAlignment = Alignment.Bottom,
        ) {
            days.forEach { day ->
                val fraction = day.millis.toFloat() / maxMillis
                Column(Modifier.weight(1f), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        if (day.millis > 0) DurationFormat.short(day.millis) else "",
                        style = MaterialTheme.typography.labelSmall,
                    )
                    Spacer(Modifier.height(4.dp))
                    Box(
                        Modifier
                            .fillMaxWidth(0.6f)
                            .height(maxOf(2.dp, 110.dp * fraction))
                            .clip(RoundedCornerShape(topStart = 4.dp, topEnd = 4.dp))
                            .background(
                                if (day.millis > 0) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                            ),
                    )
                    Spacer(Modifier.height(4.dp))
                    Text(
                        day.date.dayOfWeek.getDisplayName(TextStyle.SHORT, Locale.getDefault()),
                        style = MaterialTheme.typography.labelSmall,
                    )
                }
            }
        }
    }
}

@Composable
private fun LabeledProgress(label: String, value: String, progress: Float) {
    Column {
        Row {
            Text(label, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
            Text(value, style = MaterialTheme.typography.bodyMedium)
        }
        Spacer(Modifier.height(4.dp))
        LinearProgressIndicator(progress = { progress.coerceIn(0f, 1f) }, modifier = Modifier.fillMaxWidth())
    }
}

@Composable
private fun Hint(text: String) {
    Text(text, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
}
