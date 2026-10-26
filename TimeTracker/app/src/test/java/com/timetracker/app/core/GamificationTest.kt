package com.timetracker.app.core

import org.junit.Assert.assertEquals
import org.junit.Test

class GamificationTest {

    @Test
    fun totalXp_addsEveryKindOfActivity() {
        val xp = Gamification.totalXp(habitParts = 3, habitsCompleted = 1, tasksDone = 2, exercises = 1)
        assertEquals(3 * 10 + 50 + 2 * 20 + 15, xp)
    }

    @Test
    fun newUser_isLevelOneBeginner() {
        val info = Gamification.levelFor(0)
        assertEquals(1, info.level)
        assertEquals(0, info.xpIntoLevel)
        assertEquals(100, info.xpForNextLevel)
        assertEquals(LevelTitle.BEGINNER, info.title)
    }

    @Test
    fun levelThresholds_growBy100PerLevel() {
        // Level 2 needs 100 XP, level 3 needs 100 + 200 = 300, level 4 needs 300 + 300 = 600.
        assertEquals(1, Gamification.levelFor(99).level)
        assertEquals(2, Gamification.levelFor(100).level)
        assertEquals(2, Gamification.levelFor(299).level)
        assertEquals(3, Gamification.levelFor(300).level)
        assertEquals(4, Gamification.levelFor(600).level)
    }

    @Test
    fun levelInfo_reportsProgressInsideTheLevel() {
        val info = Gamification.levelFor(450)
        assertEquals(3, info.level)
        assertEquals(150, info.xpIntoLevel)
        assertEquals(300, info.xpForNextLevel)
        assertEquals(50, info.progressPercent)
    }

    @Test
    fun negativeXp_isTreatedAsZero() {
        assertEquals(1, Gamification.levelFor(-20).level)
    }

    @Test
    fun titles_matchLevels() {
        assertEquals(LevelTitle.FOCUSED, Gamification.titleFor(2))
        assertEquals(LevelTitle.ACHIEVER, Gamification.titleFor(4))
        assertEquals(LevelTitle.PRO, Gamification.titleFor(7))
        assertEquals(LevelTitle.MASTER, Gamification.titleFor(10))
        assertEquals(LevelTitle.LEGEND, Gamification.titleFor(20))
    }

    @Test
    fun streak_countsConsecutiveDaysEndingToday() {
        assertEquals(3, Gamification.currentStreak(setOf(10L, 9L, 8L, 5L), today = 10L))
    }

    @Test
    fun streak_isKeptUntilTheDayIsOver() {
        // Today (11) is not done yet, so the streak up to yesterday still counts.
        assertEquals(3, Gamification.currentStreak(setOf(10L, 9L, 8L), today = 11L))
    }

    @Test
    fun streak_isZeroAfterAMissedDay() {
        assertEquals(0, Gamification.currentStreak(setOf(8L, 7L), today = 10L))
        assertEquals(0, Gamification.currentStreak(emptySet(), today = 10L))
    }
}
