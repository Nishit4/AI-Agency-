package com.timetracker.app.core

/** Titles shown next to the user's level. The UI maps each one to a string resource. */
enum class LevelTitle { BEGINNER, FOCUSED, ACHIEVER, PRO, MASTER, LEGEND }

data class LevelInfo(
    val level: Int,
    val totalXp: Int,
    /** XP earned since reaching the current level. */
    val xpIntoLevel: Int,
    /** XP needed to go from the current level to the next one. */
    val xpForNextLevel: Int,
    val title: LevelTitle,
) {
    val progressPercent: Int get() = if (xpForNextLevel == 0) 0 else xpIntoLevel * 100 / xpForNextLevel
}

/**
 * Gamification rules. Habits are divided into small parts; every part done earns XP and finishing
 * all parts of a habit for the day earns a bonus. Completed tasks and logged workouts also count.
 */
object Gamification {
    const val XP_PER_HABIT_PART = 10
    const val XP_PER_HABIT_COMPLETED = 50
    const val XP_PER_TASK_DONE = 20
    const val XP_PER_EXERCISE = 15

    fun totalXp(habitParts: Int, habitsCompleted: Int, tasksDone: Int, exercises: Int): Int =
        habitParts * XP_PER_HABIT_PART +
            habitsCompleted * XP_PER_HABIT_COMPLETED +
            tasksDone * XP_PER_TASK_DONE +
            exercises * XP_PER_EXERCISE

    /** XP needed to go from [level] to `level + 1`. Each level needs 100 XP more than the previous one. */
    fun xpToNextLevel(level: Int): Int = 100 * level

    fun levelFor(totalXp: Int): LevelInfo {
        val xp = totalXp.coerceAtLeast(0)
        var level = 1
        var levelFloor = 0
        while (xp >= levelFloor + xpToNextLevel(level)) {
            levelFloor += xpToNextLevel(level)
            level++
        }
        return LevelInfo(
            level = level,
            totalXp = xp,
            xpIntoLevel = xp - levelFloor,
            xpForNextLevel = xpToNextLevel(level),
            title = titleFor(level),
        )
    }

    fun titleFor(level: Int): LevelTitle = when {
        level >= 15 -> LevelTitle.LEGEND
        level >= 10 -> LevelTitle.MASTER
        level >= 7 -> LevelTitle.PRO
        level >= 4 -> LevelTitle.ACHIEVER
        level >= 2 -> LevelTitle.FOCUSED
        else -> LevelTitle.BEGINNER
    }

    /**
     * Number of consecutive completed days ending today. If today is not completed yet the streak
     * still counts up to yesterday, so it is not lost before the day is over.
     *
     * @param completedDays epoch days on which the habit was fully completed.
     * @param today the current epoch day.
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
}
