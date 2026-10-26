package com.timemanager.app.data

import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.flow
import java.time.Clock
import java.time.LocalDate

/** Emits today's date, and again just after each midnight, so screens roll over to the new day. */
fun Clock.currentDate(): Flow<LocalDate> {
    val clock = this
    return flow {
        while (true) {
            val today = LocalDate.now(clock)
            emit(today)
            val nextMidnight = today.plusDays(1).atStartOfDay(clock.zone).toInstant().toEpochMilli()
            delay((nextMidnight - clock.millis()).coerceAtLeast(1_000))
        }
    }.distinctUntilChanged()
}

/** Emits immediately and then every [periodMillis]. */
fun ticker(periodMillis: Long): Flow<Unit> = flow {
    while (true) {
        emit(Unit)
        delay(periodMillis)
    }
}
