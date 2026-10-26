package com.timetracker.app.ui.sleep

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.timetracker.app.core.ReportCalculator
import com.timetracker.app.core.SleepMath
import com.timetracker.app.data.entity.SleepLog
import com.timetracker.app.data.entity.durationMs
import com.timetracker.app.data.repository.SleepRepository
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import java.util.concurrent.TimeUnit

data class SleepSummary(
    val lastNightMs: Long? = null,
    val weekAverageMs: Long? = null,
    val weekAverageQuality: Float? = null,
)

sealed interface SleepEvent {
    data class Deleted(val log: SleepLog) : SleepEvent
}

class SleepViewModel(
    private val userId: Long,
    private val sleepRepository: SleepRepository,
) : ViewModel() {

    val logs: StateFlow<List<SleepLog>> = sleepRepository.observeAll(userId)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    val summary: StateFlow<SleepSummary> = logs
        .map { list ->
            val weekAgo = System.currentTimeMillis() - TimeUnit.DAYS.toMillis(7)
            val lastWeek = list.filter { it.sleepEnd >= weekAgo }
            SleepSummary(
                lastNightMs = list.firstOrNull()?.durationMs,
                weekAverageMs = ReportCalculator.average(lastWeek.map { it.durationMs }),
                weekAverageQuality = if (lastWeek.isEmpty()) null else lastWeek.map { it.quality }.average().toFloat(),
            )
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), SleepSummary())

    private val _events = Channel<SleepEvent>(Channel.BUFFERED)
    val events: Flow<SleepEvent> = _events.receiveAsFlow()

    /** Returns false if the times give an impossible sleep length. */
    fun add(wakeDate: LocalDate, bedtime: LocalTime, wakeTime: LocalTime, quality: Int, note: String): Boolean {
        val (start, end) = SleepMath.interval(wakeDate, bedtime, wakeTime, ZoneId.systemDefault())
        if (!SleepMath.isValidDuration(end - start)) return false
        viewModelScope.launch {
            sleepRepository.add(
                SleepLog(
                    userId = userId,
                    sleepStart = start,
                    sleepEnd = end,
                    quality = quality.coerceIn(1, 5),
                    note = note.trim(),
                )
            )
        }
        return true
    }

    fun delete(log: SleepLog) {
        viewModelScope.launch {
            sleepRepository.delete(log)
            _events.send(SleepEvent.Deleted(log))
        }
    }

    fun restore(log: SleepLog) {
        viewModelScope.launch { sleepRepository.add(log) }
    }
}
