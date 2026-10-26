package com.timetracker.app

import android.app.Application
import android.content.Context
import androidx.appcompat.app.AppCompatDelegate
import com.timetracker.app.alarm.TaskAlarmScheduler
import com.timetracker.app.data.AppDatabase
import com.timetracker.app.data.AppPreferences
import com.timetracker.app.data.SampleDataSeeder
import com.timetracker.app.data.repository.AuthRepository
import com.timetracker.app.data.repository.ExerciseRepository
import com.timetracker.app.data.repository.HabitRepository
import com.timetracker.app.data.repository.ReportRepository
import com.timetracker.app.data.repository.SleepRepository
import com.timetracker.app.data.repository.StatsRepository
import com.timetracker.app.data.repository.TaskRepository
import com.timetracker.app.data.repository.TimeLogRepository
import com.timetracker.app.notification.Notifications
import com.timetracker.app.service.StopwatchController
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob

class TimeTrackerApp : Application() {

    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        container = AppContainer(this)
        Notifications.createChannels(this)
        AppCompatDelegate.setDefaultNightMode(container.preferences.themeMode)
    }
}

/** Creates the app's shared objects once (simple manual dependency injection). */
class AppContainer(context: Context) {
    private val appContext = context.applicationContext

    /** For short writes that should finish even if the screen that started them is closed. */
    val applicationScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    val preferences = AppPreferences(appContext)

    val database: AppDatabase by lazy { AppDatabase.build(appContext) }

    val alarmScheduler by lazy { TaskAlarmScheduler(appContext) }

    val stopwatch by lazy { StopwatchController(appContext, preferences) }

    val authRepository by lazy { AuthRepository(database.userDao()) }

    val taskRepository by lazy { TaskRepository(database.taskDao(), alarmScheduler) }

    val timeLogRepository by lazy { TimeLogRepository(database.timeLogDao()) }

    val habitRepository by lazy { HabitRepository(database.habitDao()) }

    val exerciseRepository by lazy { ExerciseRepository(database.exerciseDao()) }

    val sleepRepository by lazy { SleepRepository(database.sleepDao()) }

    val statsRepository by lazy {
        StatsRepository(database.habitDao(), database.taskDao(), database.exerciseDao())
    }

    val reportRepository by lazy {
        ReportRepository(
            database.timeLogDao(),
            database.taskDao(),
            database.habitDao(),
            database.exerciseDao(),
            database.sleepDao(),
        )
    }

    val sampleDataSeeder by lazy { SampleDataSeeder(database) }
}

val Context.appContainer: AppContainer
    get() = (applicationContext as TimeTrackerApp).container
