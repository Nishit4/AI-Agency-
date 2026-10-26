package com.timetracker.app.data

import androidx.room.TypeConverter
import com.timetracker.app.data.entity.TaskPriority

/** Stores [TaskPriority] as a number so tasks can be sorted by priority in SQL. */
class Converters {
    @TypeConverter
    fun priorityToLevel(priority: TaskPriority): Int = priority.level

    @TypeConverter
    fun levelToPriority(level: Int): TaskPriority = TaskPriority.fromLevel(level)
}
