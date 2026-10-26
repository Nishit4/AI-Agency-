package com.timemanager.app.ui

import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.consumeWindowInsets
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.TaskAlt
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.timemanager.app.ui.exercise.ExerciseScreen
import com.timemanager.app.ui.habits.HabitsScreen
import com.timemanager.app.ui.report.ReportScreen
import com.timemanager.app.ui.tasks.TasksScreen
import com.timemanager.app.ui.timer.TimerScreen

private enum class Destination(val route: String, val label: String, val icon: ImageVector) {
    Timer("timer", "Timer", Icons.Filled.Timer),
    Tasks("tasks", "Tasks", Icons.Filled.TaskAlt),
    Habits("habits", "Habits", Icons.Filled.LocalFireDepartment),
    Exercise("exercise", "Exercise", Icons.Filled.FitnessCenter),
    Report("report", "Report", Icons.Filled.BarChart),
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun TimeManagerApp() {
    val navController = rememberNavController()
    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = backStackEntry?.destination

    Scaffold(
        // Each screen draws its own top bar, so only the bottom bar's space is reserved here.
        contentWindowInsets = WindowInsets(0, 0, 0, 0),
        bottomBar = {
            NavigationBar {
                Destination.entries.forEach { destination ->
                    NavigationBarItem(
                        selected = currentDestination?.hierarchy?.any { it.route == destination.route } == true,
                        onClick = {
                            navController.navigate(destination.route) {
                                popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = { Icon(destination.icon, contentDescription = null) },
                        label = { Text(destination.label) },
                    )
                }
            }
        },
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Destination.Timer.route,
            modifier = Modifier
                .padding(innerPadding)
                .consumeWindowInsets(innerPadding),
        ) {
            composable(Destination.Timer.route) { TimerScreen() }
            composable(Destination.Tasks.route) { TasksScreen() }
            composable(Destination.Habits.route) { HabitsScreen() }
            composable(Destination.Exercise.route) { ExerciseScreen() }
            composable(Destination.Report.route) { ReportScreen() }
        }
    }
}
