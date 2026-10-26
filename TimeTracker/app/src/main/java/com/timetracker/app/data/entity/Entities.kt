package com.timetracker.app.data.entity

import androidx.room.Embedded
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey
import com.timetracker.app.core.TimeSpan

/** The account holder who owns tasks, time logs, habits, exercises and sleep logs. */
@Entity(
    tableName = "users",
    indices = [Index(value = ["username"], unique = true)],
)
data class User(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val username: String,
    val passwordHash: String,
    val salt: String,
    val createdAt: Long = System.currentTimeMillis(),
)

enum class TaskPriority(val level: Int) {
    LOW(0),
    MEDIUM(1),
    HIGH(2);

    companion object {
        fun fromLevel(level: Int): TaskPriority = entries.firstOrNull { it.level == level } ?: MEDIUM
    }
}

/** An item in the to-do list. [reminderAt] is the time the task alarm should fire. */
@Entity(
    tableName = "tasks",
    foreignKeys = [
        ForeignKey(entity = User::class, parentColumns = ["id"], childColumns = ["userId"], onDelete = ForeignKey.CASCADE),
    ],
    indices = [Index("userId")],
)
data class Task(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val userId: Long,
    val title: String,
    val description: String = "",
    val priority: TaskPriority = TaskPriority.MEDIUM,
    val isDone: Boolean = false,
    val reminderAt: Long? = null,
    val createdAt: Long = System.currentTimeMillis(),
    val completedAt: Long? = null,
)

/** Time spent on an activity, recorded with the stopwatch or added manually. */
@Entity(
    tableName = "time_logs",
    foreignKeys = [
        ForeignKey(entity = User::class, parentColumns = ["id"], childColumns = ["userId"], onDelete = ForeignKey.CASCADE),
        ForeignKey(entity = Task::class, parentColumns = ["id"], childColumns = ["taskId"], onDelete = ForeignKey.SET_NULL),
    ],
    indices = [Index("userId"), Index("taskId"), Index("startTime")],
)
data class TimeLog(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val userId: Long,
    val taskId: Long? = null,
    val activity: String,
    val startTime: Long,
    val endTime: Long,
)

val TimeLog.durationMs: Long get() = (endTime - startTime).coerceAtLeast(0)

fun TimeLog.toTimeSpan(): TimeSpan = TimeSpan(activity, startTime, endTime)

/** A habit split into [target] small parts per day, e.g. "Drink water" with 8 parts. */
@Entity(
    tableName = "habits",
    foreignKeys = [
        ForeignKey(entity = User::class, parentColumns = ["id"], childColumns = ["userId"], onDelete = ForeignKey.CASCADE),
    ],
    indices = [Index("userId")],
)
data class Habit(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val userId: Long,
    val name: String,
    val target: Int,
    val createdAt: Long = System.currentTimeMillis(),
)

/** How many parts of a habit were done on one day. [day] is a `LocalDate.toEpochDay()` value. */
@Entity(
    tableName = "habit_logs",
    primaryKeys = ["habitId", "day"],
    foreignKeys = [
        ForeignKey(entity = Habit::class, parentColumns = ["id"], childColumns = ["habitId"], onDelete = ForeignKey.CASCADE),
    ],
)
data class HabitLog(
    val habitId: Long,
    val day: Long,
    val progress: Int,
)

/** An exercise routine entry. */
@Entity(
    tableName = "exercises",
    foreignKeys = [
        ForeignKey(entity = User::class, parentColumns = ["id"], childColumns = ["userId"], onDelete = ForeignKey.CASCADE),
    ],
    indices = [Index("userId"), Index("performedAt")],
)
data class Exercise(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val userId: Long,
    val name: String,
    val durationMinutes: Int,
    val sets: Int = 0,
    val reps: Int = 0,
    val performedAt: Long = System.currentTimeMillis(),
)

/** One night's sleep. [quality] is a rating from 1 to 5. */
@Entity(
    tableName = "sleep_logs",
    foreignKeys = [
        ForeignKey(entity = User::class, parentColumns = ["id"], childColumns = ["userId"], onDelete = ForeignKey.CASCADE),
    ],
    indices = [Index("userId"), Index("sleepEnd")],
)
data class SleepLog(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val userId: Long,
    val sleepStart: Long,
    val sleepEnd: Long,
    val quality: Int,
    val note: String = "",
)

val SleepLog.durationMs: Long get() = (sleepEnd - sleepStart).coerceAtLeast(0)

/** A habit together with the number of parts done on the requested day. */
data class HabitWithProgress(
    @Embedded val habit: Habit,
    val progress: Int,
)

/** A day on which a habit was fully completed. */
data class HabitDay(
    val habitId: Long,
    val day: Long,
)
