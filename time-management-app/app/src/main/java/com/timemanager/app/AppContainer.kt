package com.timemanager.app

import android.content.Context
import com.timemanager.app.data.ExerciseRepository
import com.timemanager.app.data.HabitRepository
import com.timemanager.app.data.ProgressRepository
import com.timemanager.app.data.TaskRepository
import com.timemanager.app.data.TimeRepository
import com.timemanager.app.data.local.AppDatabase
import java.time.Clock

/** Manual dependency injection: one instance of each repository for the whole app. */
class AppContainer(context: Context) {
    val clock: Clock = Clock.systemDefaultZone()

    private val database = AppDatabase.build(context)

    val timeRepository = TimeRepository(database.timeEntryDao(), clock)
    val taskRepository = TaskRepository(database.taskDao(), clock)
    val habitRepository = HabitRepository(database.habitDao(), clock)
    val exerciseRepository = ExerciseRepository(database.exerciseDao(), clock)
    val progressRepository = ProgressRepository(habitRepository, taskRepository, exerciseRepository)
}
