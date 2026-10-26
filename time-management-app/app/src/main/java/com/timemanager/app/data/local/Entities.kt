package com.timemanager.app.data.local

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey
import com.timemanager.core.model.Habit
import com.timemanager.core.model.HabitCheck
import com.timemanager.core.model.HabitStep
import com.timemanager.core.model.Priority
import com.timemanager.core.model.Routine
import com.timemanager.core.model.RoutineExercise
import com.timemanager.core.model.TaskItem
import com.timemanager.core.model.TimeEntry
import com.timemanager.core.model.WorkoutSession

@Entity(tableName = "time_entries", indices = [Index("startMillis")])
data class TimeEntryEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val category: String,
    val note: String,
    val startMillis: Long,
    val endMillis: Long?,
) {
    fun toModel() = TimeEntry(id, category, note, startMillis, endMillis)
}

@Entity(tableName = "tasks")
data class TaskEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val notes: String,
    val priority: Priority,
    val dueEpochDay: Long?,
    val isDone: Boolean,
    val createdAtMillis: Long,
    val completedAtMillis: Long?,
) {
    fun toModel() = TaskItem(id, title, notes, priority, dueEpochDay, isDone, createdAtMillis, completedAtMillis)

    companion object {
        fun from(task: TaskItem) = TaskEntity(
            id = task.id,
            title = task.title,
            notes = task.notes,
            priority = task.priority,
            dueEpochDay = task.dueEpochDay,
            isDone = task.isDone,
            createdAtMillis = task.createdAtMillis,
            completedAtMillis = task.completedAtMillis,
        )
    }
}

@Entity(tableName = "habits")
data class HabitEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val createdAtMillis: Long,
) {
    fun toModel() = Habit(id, name, createdAtMillis)
}

@Entity(
    tableName = "habit_steps",
    foreignKeys = [
        ForeignKey(
            entity = HabitEntity::class,
            parentColumns = ["id"],
            childColumns = ["habitId"],
            onDelete = ForeignKey.CASCADE,
        ),
    ],
    indices = [Index("habitId")],
)
data class HabitStepEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val habitId: Long,
    val title: String,
    val position: Int,
) {
    fun toModel() = HabitStep(id, habitId, title, position)
}

@Entity(
    tableName = "habit_checks",
    primaryKeys = ["stepId", "epochDay"],
    foreignKeys = [
        ForeignKey(
            entity = HabitEntity::class,
            parentColumns = ["id"],
            childColumns = ["habitId"],
            onDelete = ForeignKey.CASCADE,
        ),
        ForeignKey(
            entity = HabitStepEntity::class,
            parentColumns = ["id"],
            childColumns = ["stepId"],
            onDelete = ForeignKey.CASCADE,
        ),
    ],
    indices = [Index("habitId"), Index("epochDay")],
)
data class HabitCheckEntity(
    val habitId: Long,
    val stepId: Long,
    val epochDay: Long,
) {
    fun toModel() = HabitCheck(habitId, stepId, epochDay)
}

@Entity(tableName = "routines")
data class RoutineEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
) {
    fun toModel() = Routine(id, name)
}

@Entity(
    tableName = "routine_exercises",
    foreignKeys = [
        ForeignKey(
            entity = RoutineEntity::class,
            parentColumns = ["id"],
            childColumns = ["routineId"],
            onDelete = ForeignKey.CASCADE,
        ),
    ],
    indices = [Index("routineId")],
)
data class RoutineExerciseEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val routineId: Long,
    val name: String,
    val sets: Int,
    val reps: Int,
    val position: Int,
) {
    fun toModel() = RoutineExercise(id, routineId, name, sets, reps, position)
}

@Entity(
    tableName = "workout_sessions",
    foreignKeys = [
        ForeignKey(
            entity = RoutineEntity::class,
            parentColumns = ["id"],
            childColumns = ["routineId"],
            onDelete = ForeignKey.CASCADE,
        ),
    ],
    indices = [Index("routineId"), Index("epochDay")],
)
data class WorkoutSessionEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val routineId: Long,
    val epochDay: Long,
    val durationMinutes: Int,
    val loggedAtMillis: Long,
) {
    fun toModel() = WorkoutSession(id, routineId, epochDay, durationMinutes, loggedAtMillis)
}
