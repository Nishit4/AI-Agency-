package com.timemanager.core.gamification

import com.timemanager.core.habit.HabitProgress
import com.timemanager.core.model.HabitCheck
import com.timemanager.core.model.HabitStep

object XpRules {
    const val HABIT_STEP = 10
    const val HABIT_DAY_BONUS = 20
    const val TASK = 15
    const val WORKOUT = 30
}

data class LevelInfo(
    val level: Int,
    val totalXp: Int,
    val xpIntoLevel: Int,
    val xpForNextLevel: Int,
) {
    val progress: Float get() = if (xpForNextLevel == 0) 0f else xpIntoLevel.toFloat() / xpForNextLevel
}

object Gamification {
    /** XP needed to go from [level] to the next one: 100, 200, 300, ... */
    fun xpToNextLevel(level: Int): Int = 100 * level

    fun levelFor(totalXp: Int): LevelInfo {
        var level = 1
        var remaining = totalXp.coerceAtLeast(0)
        while (remaining >= xpToNextLevel(level)) {
            remaining -= xpToNextLevel(level)
            level++
        }
        return LevelInfo(level, totalXp, remaining, xpToNextLevel(level))
    }

    /**
     * XP from habits: every checked step earns [XpRules.HABIT_STEP], and every day on which a habit
     * is fully done adds [XpRules.HABIT_DAY_BONUS]. Pass [days] to count only part of the history.
     */
    fun habitXp(
        stepsByHabit: Map<Long, List<HabitStep>>,
        checks: List<HabitCheck>,
        days: LongRange? = null,
    ): Int {
        val counted = if (days == null) checks else checks.filter { it.epochDay in days }
        val checksByHabit = counted.groupBy { it.habitId }
        var xp = 0
        for ((habitId, steps) in stepsByHabit) {
            val habitChecks = checksByHabit[habitId].orEmpty()
            val stepIds = steps.mapTo(HashSet()) { it.id }
            xp += habitChecks.count { it.stepId in stepIds } * XpRules.HABIT_STEP
            xp += HabitProgress.completedDays(steps, habitChecks).size * XpRules.HABIT_DAY_BONUS
        }
        return xp
    }

    fun taskXp(tasksCompleted: Int): Int = tasksCompleted * XpRules.TASK

    fun workoutXp(workouts: Int): Int = workouts * XpRules.WORKOUT
}
