package com.timetracker.app.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.timetracker.app.data.dao.ExerciseDao
import com.timetracker.app.data.dao.HabitDao
import com.timetracker.app.data.dao.SleepDao
import com.timetracker.app.data.dao.TaskDao
import com.timetracker.app.data.dao.TimeLogDao
import com.timetracker.app.data.dao.UserDao
import com.timetracker.app.data.entity.Exercise
import com.timetracker.app.data.entity.Habit
import com.timetracker.app.data.entity.HabitLog
import com.timetracker.app.data.entity.SleepLog
import com.timetracker.app.data.entity.Task
import com.timetracker.app.data.entity.TimeLog
import com.timetracker.app.data.entity.User

/** Local SQLite database (via Room) that stores all app data on the device. */
@Database(
    entities = [
        User::class,
        Task::class,
        TimeLog::class,
        Habit::class,
        HabitLog::class,
        Exercise::class,
        SleepLog::class,
    ],
    version = 1,
    exportSchema = false,
)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
    abstract fun taskDao(): TaskDao
    abstract fun timeLogDao(): TimeLogDao
    abstract fun habitDao(): HabitDao
    abstract fun exerciseDao(): ExerciseDao
    abstract fun sleepDao(): SleepDao

    companion object {
        private const val DATABASE_NAME = "time_tracker.db"

        fun build(context: Context): AppDatabase =
            Room.databaseBuilder(context.applicationContext, AppDatabase::class.java, DATABASE_NAME).build()
    }
}
