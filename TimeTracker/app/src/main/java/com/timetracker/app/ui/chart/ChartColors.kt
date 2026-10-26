package com.timetracker.app.ui.chart

import androidx.annotation.ColorInt

/** Colours used for chart slices and activity markers. Mid-tones that work in light and dark mode. */
object ChartColors {
    private val palette = intArrayOf(
        0xFF6366F1.toInt(), // indigo
        0xFFF97316.toInt(), // orange
        0xFF10B981.toInt(), // emerald
        0xFFEF4444.toInt(), // red
        0xFF3B82F6.toInt(), // blue
        0xFFEAB308.toInt(), // yellow
        0xFFEC4899.toInt(), // pink
        0xFF14B8A6.toInt(), // teal
    )

    @ColorInt
    fun forIndex(index: Int): Int = palette[index % palette.size]

    /** The same activity name always gets the same colour. */
    @ColorInt
    fun forLabel(label: String): Int = palette[Math.floorMod(label.trim().lowercase().hashCode(), palette.size)]
}
