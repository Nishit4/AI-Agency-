package com.timemanager.app.ui.timer

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.timemanager.app.data.TimeRepository
import com.timemanager.app.data.currentDate
import com.timemanager.core.model.TimeEntry
import com.timemanager.core.time.startOfDayMillis
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.time.Clock

val DefaultCategories = listOf("Work", "Study", "Exercise", "Personal", "Leisure", "Other")

data class TimerUiState(
    val running: TimeEntry? = null,
    val todayEntries: List<TimeEntry> = emptyList(),
    val dayStartMillis: Long = 0,
    val dayEndMillis: Long = 0,
)

class TimerViewModel(private val repository: TimeRepository, clock: Clock) : ViewModel() {

    @OptIn(ExperimentalCoroutinesApi::class)
    val uiState: StateFlow<TimerUiState> = clock.currentDate()
        .flatMapLatest { today ->
            val from = today.startOfDayMillis(clock.zone)
            val to = today.plusDays(1).startOfDayMillis(clock.zone)
            combine(repository.running, repository.entriesBetween(from, to)) { running, entries ->
                TimerUiState(running, entries, from, to)
            }
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), TimerUiState())

    fun start(category: String, note: String) {
        viewModelScope.launch { repository.start(category, note.trim()) }
    }

    fun stop() {
        viewModelScope.launch { repository.stop() }
    }

    fun delete(entry: TimeEntry) {
        viewModelScope.launch { repository.delete(entry.id) }
    }
}
