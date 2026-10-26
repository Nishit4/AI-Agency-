package com.timemanager.core.gamification

import com.timemanager.core.model.HabitCheck
import com.timemanager.core.model.HabitStep
import kotlin.test.Test
import kotlin.test.assertEquals

class GamificationTest {
    @Test
    fun levelsNeedOneHundredMoreXpEachTime() {
        assertEquals(LevelInfo(level = 1, totalXp = 0, xpIntoLevel = 0, xpForNextLevel = 100), Gamification.levelFor(0))
        assertEquals(LevelInfo(level = 2, totalXp = 100, xpIntoLevel = 0, xpForNextLevel = 200), Gamification.levelFor(100))
        assertEquals(LevelInfo(level = 3, totalXp = 350, xpIntoLevel = 50, xpForNextLevel = 300), Gamification.levelFor(350))
        assertEquals(1f / 6, Gamification.levelFor(350).progress)
    }

    @Test
    fun habitXpCountsStepsAndFullDays() {
        val stepsByHabit = mapOf(
            1L to listOf(HabitStep(id = 10, habitId = 1, title = "a", position = 0), HabitStep(id = 11, habitId = 1, title = "b", position = 1)),
        )
        val checks = listOf(
            HabitCheck(habitId = 1, stepId = 10, epochDay = 5),
            HabitCheck(habitId = 1, stepId = 11, epochDay = 5),
            HabitCheck(habitId = 1, stepId = 10, epochDay = 6),
        )

        // 3 steps x 10 + 1 full day x 20
        assertEquals(50, Gamification.habitXp(stepsByHabit, checks))
        // Only day 6: 1 step, no full day
        assertEquals(10, Gamification.habitXp(stepsByHabit, checks, days = 6L..6L))
    }

    @Test
    fun tasksAndWorkoutsHaveFixedXp() {
        assertEquals(45, Gamification.taskXp(3))
        assertEquals(60, Gamification.workoutXp(2))
    }
}
