package com.timetracker.app

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.timetracker.app.data.AppDatabase
import com.timetracker.app.data.entity.Habit
import com.timetracker.app.data.entity.HabitLog
import com.timetracker.app.data.entity.Task
import com.timetracker.app.data.entity.TaskPriority
import com.timetracker.app.data.entity.TimeLog
import com.timetracker.app.data.entity.User
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith

/** Checks the Room queries against a real (in-memory) SQLite database on a device or emulator. */
@RunWith(AndroidJUnit4::class)
class AppDatabaseTest {

    private lateinit var db: AppDatabase
    private var userId = 0L

    @Before
    fun setUp() = runTest {
        val context = ApplicationProvider.getApplicationContext<Context>()
        db = Room.inMemoryDatabaseBuilder(context, AppDatabase::class.java).allowMainThreadQueries().build()
        userId = db.userDao().insert(User(name = "Test", username = "test", passwordHash = "h", salt = "s"))
    }

    @After
    fun tearDown() {
        db.close()
    }

    @Test
    fun tasks_areSortedPendingFirstThenByPriority() = runTest {
        val dao = db.taskDao()
        dao.insert(Task(userId = userId, title = "Low", priority = TaskPriority.LOW))
        dao.insert(Task(userId = userId, title = "Done", priority = TaskPriority.HIGH, isDone = true))
        dao.insert(Task(userId = userId, title = "High", priority = TaskPriority.HIGH))

        val titles = dao.observeAll(userId).first().map { it.title }

        assertEquals(listOf("High", "Low", "Done"), titles)
        assertEquals(1, dao.observeCompletedCount(userId).first())
    }

    @Test
    fun timeLogs_overlappingTheRangeAreReturned() = runTest {
        val dao = db.timeLogDao()
        dao.insert(TimeLog(userId = userId, activity = "Before", startTime = 0, endTime = 50))
        dao.insert(TimeLog(userId = userId, activity = "Crossing", startTime = 90, endTime = 150))
        dao.insert(TimeLog(userId = userId, activity = "Inside", startTime = 120, endTime = 180))

        val activities = dao.observeBetween(userId, 100, 200).first().map { it.activity }

        assertEquals(listOf("Inside", "Crossing"), activities)
    }

    @Test
    fun habitProgress_isJoinedForTheRequestedDay() = runTest {
        val dao = db.habitDao()
        val habitId = dao.insert(Habit(userId = userId, name = "Water", target = 4))
        dao.upsertLog(HabitLog(habitId = habitId, day = 10, progress = 4))
        dao.upsertLog(HabitLog(habitId = habitId, day = 11, progress = 2))

        assertEquals(2, dao.observeWithProgress(userId, 11).first().single().progress)
        assertEquals(0, dao.observeWithProgress(userId, 12).first().single().progress)
        assertEquals(1, dao.observeCompletedCount(userId).first())
        assertEquals(6, dao.observeTotalParts(userId).first())
    }
}
