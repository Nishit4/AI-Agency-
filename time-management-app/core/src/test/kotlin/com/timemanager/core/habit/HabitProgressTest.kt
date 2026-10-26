package com.timemanager.core.habit

import com.timemanager.core.model.HabitCheck
import com.timemanager.core.model.HabitStep
import kotlin.test.Test
import kotlin.test.assertEquals

class HabitProgressTest {
    private val steps = listOf(
        HabitStep(id = 1, habitId = 7, title = "Put on shoes", position = 0),
        HabitStep(id = 2, habitId = 7, title = "Walk 10 minutes", position = 1),
    )

    private fun check(stepId: Long, day: Long) = HabitCheck(habitId = 7, stepId = stepId, epochDay = day)

    @Test
    fun dayProgressIsTheShareOfStepsChecked() {
        val checks = listOf(check(1, 100), check(1, 101), check(2, 101))

        assertEquals(0.5f, HabitProgress.dayProgress(steps, checks, 100))
        assertEquals(1f, HabitProgress.dayProgress(steps, checks, 101))
        assertEquals(0f, HabitProgress.dayProgress(steps, checks, 102))
        assertEquals(0f, HabitProgress.dayProgress(emptyList(), checks, 101))
    }

    @Test
    fun aDayCountsOnlyWhenEveryStepIsChecked() {
        val checks = listOf(check(1, 100), check(1, 101), check(2, 101), check(99, 102))

        assertEquals(setOf(101L), HabitProgress.completedDays(steps, checks))
    }

    @Test
    fun currentStreakKeepsYesterdaysRunUntilTodayIsDone() {
        val completed = setOf(97L, 98L, 99L)

        assertEquals(3, HabitProgress.currentStreak(completed, today = 100))
        assertEquals(4, HabitProgress.currentStreak(completed + 100L, today = 100))
        assertEquals(0, HabitProgress.currentStreak(completed, today = 101))
    }

    @Test
    fun bestStreakIsTheLongestRun() {
        assertEquals(3, HabitProgress.bestStreak(setOf(1L, 2L, 3L, 7L, 8L)))
        assertEquals(0, HabitProgress.bestStreak(emptySet()))
    }
}
