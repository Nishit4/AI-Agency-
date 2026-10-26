package com.timemanager.app.ui

import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.CreationExtras
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import com.timemanager.app.AppContainer
import com.timemanager.app.TimeManagerApplication
import com.timemanager.app.ui.exercise.ExerciseViewModel
import com.timemanager.app.ui.habits.HabitsViewModel
import com.timemanager.app.ui.report.ReportViewModel
import com.timemanager.app.ui.tasks.TasksViewModel
import com.timemanager.app.ui.timer.TimerViewModel

object AppViewModelProvider {
    val Factory = viewModelFactory {
        initializer { TimerViewModel(container().timeRepository, container().clock) }
        initializer { TasksViewModel(container().taskRepository, container().clock) }
        initializer {
            HabitsViewModel(container().habitRepository, container().progressRepository, container().clock)
        }
        initializer { ExerciseViewModel(container().exerciseRepository, container().clock) }
        initializer {
            val c = container()
            ReportViewModel(c.timeRepository, c.taskRepository, c.habitRepository, c.exerciseRepository, c.clock)
        }
    }
}

private fun CreationExtras.container(): AppContainer =
    (this[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY] as TimeManagerApplication).container
