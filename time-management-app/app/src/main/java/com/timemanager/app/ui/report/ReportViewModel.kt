package com.timemanager.app.ui.report

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.timemanager.app.data.ExerciseRepository
import com.timemanager.app.data.HabitRepository
import com.timemanager.app.data.TaskRepository
import com.timemanager.app.data.TimeRepository
import com.timemanager.app.data.currentDate
import com.timemanager.app.data.ticker
import com.timemanager.core.model.ActivityData
import com.timemanager.core.report.WeeklyReport
import com.timemanager.core.report.WeeklyReportCalculator
import com.timemanager.core.time.Weeks
import com.timemanager.core.time.startOfDayMillis
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import java.time.Clock

data class ReportUiState(
    val report: WeeklyReport? = null,
    val isCurrentWeek: Boolean = true,
)

class ReportViewModel(
    timeRepository: TimeRepository,
    taskRepository: TaskRepository,
    habitRepository: HabitRepository,
    exerciseRepository: ExerciseRepository,
    clock: Clock,
) : ViewModel() {
    /** 0 = this week, 1 = last week, and so on. */
    private val weeksBack = MutableStateFlow(0)
    private val calculator = WeeklyReportCalculator(clock.zone)

    private val habitData = combine(habitRepository.habits, habitRepository.steps, habitRepository.checks) { habits, steps, checks ->
        Triple(habits, steps, checks)
    }

    @OptIn(ExperimentalCoroutinesApi::class)
    val uiState: StateFlow<ReportUiState> = combine(weeksBack, clock.currentDate()) { back, today -> back to today }
        .flatMapLatest { (back, today) ->
            val weekStart = Weeks.startOf(today).minusWeeks(back.toLong())
            val from = weekStart.startOfDayMillis(clock.zone)
            val to = weekStart.plusDays(7).startOfDayMillis(clock.zone)
            combine(
                timeRepository.entriesBetween(from, to),
                taskRepository.tasks,
                exerciseRepository.sessions,
                habitData,
                // Refresh every minute so a running timer keeps adding to the report.
                ticker(60_000),
            ) { entries, tasks, sessions, (habits, steps, checks), _ ->
                val data = ActivityData(entries, tasks, habits, steps, checks, sessions)
                ReportUiState(
                    report = calculator.calculate(weekStart, today, clock.millis(), data),
                    isCurrentWeek = back == 0,
                )
            }
        }
        .flowOn(Dispatchers.Default)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), ReportUiState())

    fun previousWeek() = weeksBack.update { it + 1 }

    fun nextWeek() = weeksBack.update { (it - 1).coerceAtLeast(0) }
}
