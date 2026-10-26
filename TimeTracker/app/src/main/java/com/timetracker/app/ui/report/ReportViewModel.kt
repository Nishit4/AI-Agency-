package com.timetracker.app.ui.report

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.timetracker.app.core.DateRange
import com.timetracker.app.data.repository.ReportRepository
import com.timetracker.app.data.repository.WeeklyReport
import com.timetracker.app.ui.common.UiFormat
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import java.time.LocalDate

enum class ReportMode { DAY, WEEK }

data class ReportSelection(val mode: ReportMode, val anchor: LocalDate) {
    val range: DateRange
        get() = when (mode) {
            ReportMode.DAY -> DateRange.day(anchor)
            ReportMode.WEEK -> DateRange.week(anchor, UiFormat.firstDayOfWeek())
        }
}

@OptIn(ExperimentalCoroutinesApi::class)
class ReportViewModel(
    private val userId: Long,
    private val reportRepository: ReportRepository,
) : ViewModel() {

    private val _selection = MutableStateFlow(ReportSelection(ReportMode.WEEK, LocalDate.now()))
    val selection: StateFlow<ReportSelection> = _selection.asStateFlow()

    private val _showBarChart = MutableStateFlow(false)
    val showBarChart: StateFlow<Boolean> = _showBarChart.asStateFlow()

    val report: StateFlow<WeeklyReport?> = _selection
        .flatMapLatest { reportRepository.observeReport(userId, it.range) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)

    fun setMode(mode: ReportMode) = _selection.update { it.copy(mode = mode) }

    fun previous() = _selection.update { it.copy(anchor = it.anchor.minusDays(stepDays(it.mode))) }

    fun next() = _selection.update { it.copy(anchor = it.anchor.plusDays(stepDays(it.mode))) }

    fun showDate(date: LocalDate) = _selection.update { it.copy(anchor = date) }

    fun setShowBarChart(show: Boolean) {
        _showBarChart.value = show
    }

    private fun stepDays(mode: ReportMode): Long = if (mode == ReportMode.DAY) 1 else 7
}
