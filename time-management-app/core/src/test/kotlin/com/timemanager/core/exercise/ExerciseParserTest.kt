package com.timemanager.core.exercise

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

class ExerciseParserTest {
    @Test
    fun readsSetsAndReps() {
        assertEquals(ParsedExercise("Push-ups", 3, 12), ExerciseParser.parseLine("Push-ups 3x12"))
        assertEquals(ParsedExercise("Barbell squats", 4, 10), ExerciseParser.parseLine("  Barbell squats 4 X 10 "))
        assertEquals(ParsedExercise("Lunges", 2, 20), ExerciseParser.parseLine("Lunges 2×20"))
    }

    @Test
    fun fallsBackToDefaultsWithoutSetsAndReps() {
        assertEquals(ParsedExercise("Plank", 3, 10), ExerciseParser.parseLine("Plank"))
        assertEquals(ParsedExercise("3x12", 3, 10), ExerciseParser.parseLine("3x12"))
    }

    @Test
    fun skipsBlankLines() {
        assertNull(ExerciseParser.parseLine("   "))
        assertEquals(
            listOf(ParsedExercise("Push-ups", 3, 12), ParsedExercise("Plank", 3, 10)),
            ExerciseParser.parseAll("Push-ups 3x12\n\nPlank\n"),
        )
    }
}
