package com.timemanager.core.exercise

data class ParsedExercise(val name: String, val sets: Int, val reps: Int)

object ExerciseParser {
    const val DEFAULT_SETS = 3
    const val DEFAULT_REPS = 10

    private val setsTimesReps = Regex("""^(.*?)\s+(\d{1,3})\s*[xX×]\s*(\d{1,4})$""")

    /** Parses one line such as "Push-ups 3x12". Without "sets x reps" it falls back to 3 x 10. */
    fun parseLine(line: String): ParsedExercise? {
        val trimmed = line.trim()
        if (trimmed.isEmpty()) return null
        val match = setsTimesReps.find(trimmed)
        if (match != null) {
            val (name, sets, reps) = match.destructured
            if (name.isNotBlank()) {
                return ParsedExercise(name.trim(), sets.toInt().coerceAtLeast(1), reps.toInt().coerceAtLeast(1))
            }
        }
        return ParsedExercise(trimmed, DEFAULT_SETS, DEFAULT_REPS)
    }

    /** Parses one exercise per line, skipping blank lines. */
    fun parseAll(text: String): List<ParsedExercise> = text.lines().mapNotNull(::parseLine)
}
