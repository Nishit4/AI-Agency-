package com.timetracker.app.ui.chart

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Typeface
import android.text.TextPaint
import android.text.TextUtils
import android.util.AttributeSet
import android.util.TypedValue
import android.view.View
import android.view.animation.DecelerateInterpolator
import androidx.annotation.ColorInt
import com.google.android.material.color.MaterialColors
import kotlin.math.min
import com.google.android.material.R as MaterialR

/** A vertical bar chart drawn with Canvas. Each bar has a label underneath and its value on top. */
class BarChartView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0,
) : View(context, attrs, defStyleAttr) {

    data class Bar(val label: String, val value: Float, @ColorInt val color: Int, val valueLabel: String)

    private var bars: List<Bar> = emptyList()
    private var progress = 1f
    private var animator: ValueAnimator? = null

    private val barRect = RectF()
    private val density = resources.displayMetrics.density
    private val cornerRadius = 6f * density
    private val maxBarWidth = 44f * density

    private val barPaint = Paint(Paint.ANTI_ALIAS_FLAG)

    private val gridPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        strokeWidth = density
        color = MaterialColors.getColor(this@BarChartView, MaterialR.attr.colorOutlineVariant, 0xFFDDDDDD.toInt())
    }

    private val labelPaint = TextPaint(Paint.ANTI_ALIAS_FLAG).apply {
        textAlign = Paint.Align.CENTER
        textSize = sp(11f)
        color = MaterialColors.getColor(this@BarChartView, MaterialR.attr.colorOnSurfaceVariant, 0xFF666666.toInt())
    }

    private val valuePaint = TextPaint(Paint.ANTI_ALIAS_FLAG).apply {
        textAlign = Paint.Align.CENTER
        textSize = sp(11f)
        typeface = Typeface.DEFAULT_BOLD
        color = MaterialColors.getColor(this@BarChartView, MaterialR.attr.colorOnSurface, 0xFF000000.toInt())
    }

    fun setData(bars: List<Bar>, animate: Boolean = true) {
        this.bars = bars
        animator?.cancel()
        if (animate && bars.isNotEmpty()) {
            animator = ValueAnimator.ofFloat(0f, 1f).apply {
                duration = 600
                interpolator = DecelerateInterpolator()
                addUpdateListener {
                    progress = it.animatedValue as Float
                    invalidate()
                }
                start()
            }
        } else {
            progress = 1f
            invalidate()
        }
    }

    override fun onDetachedFromWindow() {
        animator?.cancel()
        super.onDetachedFromWindow()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        if (bars.isEmpty()) return

        val labelArea = labelPaint.textSize * 1.8f
        val valueArea = valuePaint.textSize * 1.6f
        val left = paddingLeft.toFloat()
        val right = (width - paddingRight).toFloat()
        val top = paddingTop + valueArea
        val bottom = height - paddingBottom - labelArea
        val chartHeight = bottom - top
        if (chartHeight <= 0f || right <= left) return

        for (i in 0..GRID_LINES) {
            val y = bottom - chartHeight * i / GRID_LINES
            canvas.drawLine(left, y, right, y, gridPaint)
        }

        val maxValue = bars.maxOf { it.value }.takeIf { it > 0f } ?: 1f
        val slot = (right - left) / bars.size
        val barWidth = min(slot * 0.6f, maxBarWidth)

        bars.forEachIndexed { index, bar ->
            val centerX = left + slot * index + slot / 2f
            val barHeight = chartHeight * (bar.value / maxValue) * progress
            if (barHeight > 0f) {
                barRect.set(centerX - barWidth / 2f, bottom - barHeight, centerX + barWidth / 2f, bottom)
                barPaint.color = bar.color
                canvas.drawRoundRect(barRect, cornerRadius, cornerRadius, barPaint)
            }
            if (bar.value > 0f) {
                canvas.drawText(bar.valueLabel, centerX, bottom - barHeight - valuePaint.textSize * 0.5f, valuePaint)
            }
            val label = TextUtils.ellipsize(bar.label, labelPaint, slot - 4f * density, TextUtils.TruncateAt.END)
            canvas.drawText(label.toString(), centerX, bottom + labelPaint.textSize * 1.4f, labelPaint)
        }
    }

    private fun sp(value: Float): Float =
        TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_SP, value, resources.displayMetrics)

    private companion object {
        const val GRID_LINES = 3
    }
}
