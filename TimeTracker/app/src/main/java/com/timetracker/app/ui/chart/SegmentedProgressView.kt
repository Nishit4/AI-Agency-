package com.timetracker.app.ui.chart

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RectF
import android.util.AttributeSet
import android.view.View
import androidx.annotation.ColorInt
import com.google.android.material.color.MaterialColors
import com.google.android.material.R as MaterialR

/**
 * Shows a habit's parts as a row of segments, filling one segment for every part done.
 * Falls back to a single continuous bar when there are too many parts to draw separately.
 */
class SegmentedProgressView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0,
) : View(context, attrs, defStyleAttr) {

    private var total = 1
    private var filled = 0

    private val density = resources.displayMetrics.density
    private val gap = 4f * density
    private val minSegmentWidth = 6f * density
    private val rect = RectF()

    private val filledPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = MaterialColors.getColor(this@SegmentedProgressView, MaterialR.attr.colorPrimary, 0xFF4F46E5.toInt())
    }

    private val emptyPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = MaterialColors.getColor(this@SegmentedProgressView, MaterialR.attr.colorSurfaceVariant, 0xFFE0E0E0.toInt())
    }

    fun setProgress(filled: Int, total: Int) {
        this.total = total.coerceAtLeast(1)
        this.filled = filled.coerceIn(0, this.total)
        invalidate()
    }

    fun setFilledColor(@ColorInt color: Int) {
        filledPaint.color = color
        invalidate()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val left = paddingLeft.toFloat()
        val top = paddingTop.toFloat()
        val right = (width - paddingRight).toFloat()
        val bottom = (height - paddingBottom).toFloat()
        val availableWidth = right - left
        if (availableWidth <= 0f || bottom <= top) return
        val radius = (bottom - top) / 2f

        val segmentWidth = (availableWidth - gap * (total - 1)) / total
        if (segmentWidth < minSegmentWidth) {
            rect.set(left, top, right, bottom)
            canvas.drawRoundRect(rect, radius, radius, emptyPaint)
            if (filled > 0) {
                rect.set(left, top, left + availableWidth * filled / total, bottom)
                canvas.drawRoundRect(rect, radius, radius, filledPaint)
            }
            return
        }

        for (i in 0 until total) {
            val segmentLeft = left + i * (segmentWidth + gap)
            rect.set(segmentLeft, top, segmentLeft + segmentWidth, bottom)
            canvas.drawRoundRect(rect, radius, radius, if (i < filled) filledPaint else emptyPaint)
        }
    }
}
