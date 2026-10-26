package com.timemanager.core.habit

import com.timemanager.core.model.HabitCheck
import com.timemanager.core.model.HabitStep

object HabitProgress {
    /** Fraction (0..1) of [steps] checked on [epochDay]. */
    fun dayProgress(steps: List<HabitStep>, checks: List<HabitCheck>, epochDay: Long): Float {
        if (steps.isEmpty()) return 0f
        val stepIds = steps.mapTo(HashSet()) { it.id }
        val done = checks.asSequence()
            .filter { it.epochDay == epochDay && it.stepId in stepIds }
            .mapTo(HashSet()) { it.stepId }
            .size
        return done.toFloat() / stepIds.size
    }

    /** Days (epoch days) on which every one of [steps] was checked. */
    fun completedDays(steps: List<HabitStep>, checks: List<HabitCheck>): Set<Long> {
        if (steps.isEmpty()) return emptySet()
        val stepIds = steps.mapTo(HashSet()) { it.id }
        return checks.asSequence()
            .filter { it.stepId in stepIds }
            .groupBy({ it.epochDay }, { it.stepId })
            .filterValues { it.toSet().containsAll(stepIds) }
            .keys
    }

    /**
     * Consecutive completed days ending today. While today is still unfinished, the streak that
     * ended yesterday is kept, so it doesn't reset to zero every morning.
     */
    fun currentStreak(completedDays: Set<Long>, today: Long): Int {
        var day = if (today in completedDays) today else today - 1
        var streak = 0
        while (day in completedDays) {
            streak++
            day--
        }
        return streak
    }

    fun bestStreak(completedDays: Set<Long>): Int {
        var best = 0
        var run = 0
        var previous: Long? = null
        for (day in completedDays.sorted()) {
            run = if (previous != null && day == previous + 1) run + 1 else 1
            best = maxOf(best, run)
            previous = day
        }
        return best
    }
}
