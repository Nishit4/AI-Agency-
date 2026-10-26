package com.timetracker.app.ui.chart

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Typeface
import android.text.TextPaint
import android.util.AttributeSet
import android.util.TypedValue
import android.view.View
import android.view.animation.DecelerateInterpolator
import androidx.annotation.ColorInt
import com.google.android.material.color.MaterialColors
import kotlin.math.min
import com.google.android.material.R as MaterialR

/** A donut chart drawn with Canvas, with a title and subtitle in the middle. */
class PieChartView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0,
) : View(context, attrs, defStyleAttr) {

    data class Slice(val label: String, val value: Float, @ColorInt val color: Int)

    private var slices: List<Slice> = emptyList()
    private var centerTitle: String = ""
    private var centerSubtitle: String = ""
    private var progress = 1f
    private var animator: ValueAnimator? = null

    private val oval = RectF()

    private val arcPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.STROKE }

    private val trackPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        color = MaterialColors.getColor(this@PieChartView, MaterialR.attr.colorSurfaceVariant, 0xFFE0E0E0.toInt())
    }

    private val titlePaint = TextPaint(Paint.ANTI_ALIAS_FLAG).apply {
        textAlign = Paint.Align.CENTER
        typeface = Typeface.DEFAULT_BOLD
        textSize = sp(22f)
        color = MaterialColors.getColor(this@PieChartView, MaterialR.attr.colorOnSurface, 0xFF000000.toInt())
    }

    private val subtitlePaint = TextPaint(Paint.ANTI_ALIAS_FLAG).apply {
        textAlign = Paint.Align.CENTER
        textSize = sp(13f)
        color = MaterialColors.getColor(this@PieChartView, MaterialR.attr.colorOnSurfaceVariant, 0xFF666666.toInt())
    }

    fun setData(slices: List<Slice>, title: String, subtitle: String, animate: Boolean = true) {
        this.slices = slices.filter { it.value > 0f }
        centerTitle = title
        centerSubtitle = subtitle
        animator?.cancel()
        if (animate && this.slices.isNotEmpty()) {
            animator = ValueAnimator.ofFloat(0f, 1f).apply {
                duration = 700
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
        val contentWidth = width - paddingLeft - paddingRight
        val contentHeight = height - paddingTop - paddingBottom
        val size = min(contentWidth, contentHeight).toFloat()
        if (size <= 0f) return

        val strokeWidth = size * 0.16f
        val radius = (size - strokeWidth) / 2f
        val cx = paddingLeft + contentWidth / 2f
        val cy = paddingTop + contentHeight / 2f
        oval.set(cx - radius, cy - radius, cx + radius, cy + radius)
        arcPaint.strokeWidth = strokeWidth
        trackPaint.strokeWidth = strokeWidth

        canvas.drawOval(oval, trackPaint)

        val total = slices.sumOf { it.value.toDouble() }.toFloat()
        if (total > 0f) {
            val gap = if (slices.size > 1) GAP_DEGREES else 0f
            var startAngle = -90f
            for (slice in slices) {
                val sweep = slice.value / total * 360f * progress
                val visibleSweep = sweep - gap
                if (visibleSweep > 0f) {
                    arcPaint.color = slice.color
                    canvas.drawArc(oval, startAngle, visibleSweep, false, arcPaint)
                }
                startAngle += sweep
            }
        }

        // Centre the title (and the subtitle under it) vertically.
        val titleHeight = titlePaint.descent() - titlePaint.ascent()
        val subtitleHeight = if (centerSubtitle.isEmpty()) 0f else subtitlePaint.descent() - subtitlePaint.ascent()
        val blockTop = cy - (titleHeight + subtitleHeight) / 2f
        canvas.drawText(centerTitle, cx, blockTop - titlePaint.ascent(), titlePaint)
        if (centerSubtitle.isNotEmpty()) {
            canvas.drawText(centerSubtitle, cx, blockTop + titleHeight - subtitlePaint.ascent(), subtitlePaint)
        }
    }

    private fun sp(value: Float): Float =
        TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_SP, value, resources.displayMetrics)

    private companion object {
        const val GAP_DEGREES = 1.5f
    }
}
