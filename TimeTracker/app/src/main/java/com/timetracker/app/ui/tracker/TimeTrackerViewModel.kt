package com.timetracker.app.ui.tracker

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.timetracker.app.core.DateRange
import com.timetracker.app.core.ReportCalculator
import com.timetracker.app.data.entity.Task
import com.timetracker.app.data.entity.TimeLog
import com.timetracker.app.data.entity.toTimeSpan
import com.timetracker.app.data.repository.TaskRepository
import com.timetracker.app.data.repository.TimeLogRepository
import com.timetracker.app.service.StopwatchController
import com.timetracker.app.service.StopwatchState
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.ZoneId

sealed interface TrackerEvent {
    data class Saved(val activity: String, val durationMs: Long) : TrackerEvent
    data object TooShort : TrackerEvent
    data class Deleted(val log: TimeLog) : TrackerEvent
}

@OptIn(ExperimentalCoroutinesApi::class)
class TimeTrackerViewModel(
    private val userId: Long,
    private val stopwatch: StopwatchController,
    private val timeLogRepository: TimeLogRepository,
    taskRepository: TaskRepository,
) : ViewModel() {

    val stopwatchState: StateFlow<StopwatchState> = stopwatch.state

    /** Elapsed time of the running segment, updated every second. */
    val elapsed: StateFlow<Long> = stopwatch.state
        .flatMapLatest { state -> if (state.isRunning) ticker(state) else flowOf(0L) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), stopwatch.state.value.elapsed())

    private val today = MutableStateFlow(LocalDate.now())

    val todayLogs: StateFlow<List<TimeLog>> = today
        .flatMapLatest { date ->
            val range = DateRange.day(date)
            val zone = ZoneId.systemDefault()
            timeLogRepository.observeBetween(userId, range.startMillis(zone), range.endMillis(zone))
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    val todayTotal: StateFlow<Long> = combine(todayLogs, today) { logs, date ->
        val range = DateRange.day(date)
        val zone = ZoneId.systemDefault()
        ReportCalculator.totalTime(logs.map { it.toTimeSpan() }, range.startMillis(zone), range.endMillis(zone))
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), 0L)

    /** Pending tasks, offered as suggestions for the activity name. */
    val taskSuggestions: StateFlow<List<Task>> = taskRepository.observePending(userId)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    private val _events = Channel<TrackerEvent>(Channel.BUFFERED)
    val events: Flow<TrackerEvent> = _events.receiveAsFlow()

    /** Called when the screen becomes visible, in case the date changed while it was hidden. */
    fun refreshDay() {
        today.value = LocalDate.now()
    }

    fun start(activity: String) {
        stopwatch.start(activity)
    }

    /** Saves the time so far as one record and keeps the stopwatch running for the next one. */
    fun lap(activity: String) {
        val state = stopwatch.state.value
        if (!state.isRunning) return
        val now = System.currentTimeMillis()
        saveSegment(state.startedAt, now, activity)
        stopwatch.start(activity, now)
    }

    /** Saves the time so far and stops the stopwatch. */
    fun stop(activity: String) {
        val state = stopwatch.state.value
        if (!state.isRunning) return
        saveSegment(state.startedAt, System.currentTimeMillis(), activity)
        stopwatch.stop()
    }

    /** Stops the stopwatch without saving. */
    fun reset() {
        stopwatch.stop()
    }

    fun addManualEntry(activity: String, startTime: Long, endTime: Long) {
        saveSegment(startTime, endTime, activity)
    }

    fun delete(log: TimeLog) {
        viewModelScope.launch {
            timeLogRepository.delete(log)
            _events.send(TrackerEvent.Deleted(log))
        }
    }

    fun restore(log: TimeLog) {
        viewModelScope.launch { timeLogRepository.add(log) }
    }

    private fun saveSegment(startTime: Long, endTime: Long, activity: String) {
        if (endTime - startTime < MIN_SEGMENT_MS) {
            _events.trySend(TrackerEvent.TooShort)
            return
        }
        val name = activity.trim()
        val taskId = taskSuggestions.value.firstOrNull { it.title.trim().equals(name, ignoreCase = true) }?.id
        viewModelScope.launch {
            timeLogRepository.add(
                TimeLog(userId = userId, taskId = taskId, activity = name, startTime = startTime, endTime = endTime)
            )
            _events.send(TrackerEvent.Saved(name, endTime - startTime))
        }
    }

    private fun ticker(state: StopwatchState): Flow<Long> = flow {
        while (true) {
            val elapsed = state.elapsed()
            emit(elapsed)
            delay(1_000L - elapsed % 1_000L)
        }
    }

    private companion object {
        const val MIN_SEGMENT_MS = 1_000L
    }
}
