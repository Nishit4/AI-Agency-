package com.timetracker.app.ui.report

import android.content.res.ColorStateList
import android.os.Bundle
import android.view.View
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import com.timetracker.app.R
import com.timetracker.app.core.ReportCalculator
import com.timetracker.app.core.TimeFormat
import com.timetracker.app.data.repository.WeeklyReport
import com.timetracker.app.databinding.FragmentReportBinding
import com.timetracker.app.databinding.ItemLegendBinding
import com.timetracker.app.databinding.ItemStatBinding
import com.timetracker.app.ui.chart.BarChartView
import com.timetracker.app.ui.chart.ChartColors
import com.timetracker.app.ui.chart.PieChartView
import com.timetracker.app.ui.common.Pickers
import com.timetracker.app.ui.common.UiFormat
import com.timetracker.app.ui.common.appViewModelFactory
import com.timetracker.app.ui.common.collectWhenStarted
import com.timetracker.app.ui.common.themeColor
import java.time.LocalDate
import com.google.android.material.R as MaterialR

/** Daily and weekly report with pie and bar charts of where the time went. */
class ReportFragment : Fragment(R.layout.fragment_report) {

    private var _binding: FragmentReportBinding? = null
    private val binding get() = _binding!!

    private val viewModel: ReportViewModel by viewModels {
        appViewModelFactory { ReportViewModel(it.preferences.requireUserId(), it.reportRepository) }
    }

    /** Only animate the charts when the data changes, not on every re-collection. */
    private var lastRendered: WeeklyReport? = null

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        _binding = FragmentReportBinding.bind(view)
        lastRendered = null

        binding.statTracked.statLabel.setText(R.string.report_stat_tracked)
        binding.statTasks.statLabel.setText(R.string.report_stat_tasks)
        binding.statHabits.statLabel.setText(R.string.report_stat_habits)
        binding.statWorkouts.statLabel.setText(R.string.report_stat_workouts)
        binding.statSleep.statLabel.setText(R.string.report_stat_sleep)
        binding.statTop.statLabel.setText(R.string.report_stat_top)

        binding.rangeToggle.addOnButtonCheckedListener { _, checkedId, isChecked ->
            if (!isChecked) return@addOnButtonCheckedListener
            viewModel.setMode(if (checkedId == R.id.dayButton) ReportMode.DAY else ReportMode.WEEK)
        }
        binding.previousButton.setOnClickListener { viewModel.previous() }
        binding.nextButton.setOnClickListener { viewModel.next() }
        binding.rangeLabel.setOnClickListener {
            Pickers.pickDate(childFragmentManager, viewModel.selection.value.anchor, R.string.report_pick_date) {
                viewModel.showDate(it)
            }
        }
        binding.chartTypeSwitch.setOnCheckedChangeListener { _, checked -> viewModel.setShowBarChart(checked) }

        val owner = viewLifecycleOwner
        owner.collectWhenStarted(viewModel.selection) { selection ->
            val toggleId = if (selection.mode == ReportMode.DAY) R.id.dayButton else R.id.weekButton
            if (binding.rangeToggle.checkedButtonId != toggleId) binding.rangeToggle.check(toggleId)
            binding.rangeLabel.text = UiFormat.rangeLabel(selection.range)
            binding.nextButton.isEnabled = !selection.range.endExclusive.isAfter(LocalDate.now())
            binding.dailyCard.isVisible = selection.mode == ReportMode.WEEK
        }
        owner.collectWhenStarted(viewModel.showBarChart) { showBar ->
            if (binding.chartTypeSwitch.isChecked != showBar) binding.chartTypeSwitch.isChecked = showBar
            lastRendered?.let { renderActivityChart(it, animate = true) }
        }
        owner.collectWhenStarted(viewModel.report) { report ->
            if (report != null) {
                val animate = report != lastRendered
                lastRendered = report
                renderReport(report, animate)
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private fun renderReport(report: WeeklyReport, animate: Boolean) {
        val none = getString(R.string.value_none)
        setStat(binding.statTracked, TimeFormat.duration(report.totalTrackedMs))
        setStat(binding.statTasks, report.tasksCompleted.toString())
        setStat(binding.statHabits, report.habitGoalsMet.toString())
        setStat(
            binding.statWorkouts,
            getString(R.string.report_workouts_value, report.workouts, report.workoutMinutes),
        )
        setStat(binding.statSleep, report.averageSleepMs?.let(TimeFormat::duration) ?: none)
        setStat(binding.statTop, report.topActivity?.activity ?: none)

        renderActivityChart(report, animate)

        val maxDay = report.dailyTotals.maxOfOrNull { it.durationMs } ?: 0L
        val primary = requireContext().themeColor(MaterialR.attr.colorPrimary)
        val highlight = requireContext().themeColor(MaterialR.attr.colorTertiary)
        binding.dailyBarChart.setData(
            report.dailyTotals.map { day ->
                BarChartView.Bar(
                    label = UiFormat.weekday(day.date),
                    value = day.durationMs.toFloat(),
                    color = if (day.durationMs == maxDay && maxDay > 0) highlight else primary,
                    valueLabel = TimeFormat.hoursDecimal(day.durationMs),
                )
            },
            animate,
        )
    }

    private fun renderActivityChart(report: WeeklyReport, animate: Boolean) {
        val totals = ReportCalculator.topWithOther(report.activityTotals, MAX_CHART_ITEMS, getString(R.string.report_other))
        val hasData = totals.isNotEmpty()
        val showBar = viewModel.showBarChart.value
        binding.chartEmpty.isVisible = !hasData
        binding.pieChart.isVisible = hasData && !showBar
        binding.activityBarChart.isVisible = hasData && showBar

        if (showBar) {
            binding.activityBarChart.setData(
                totals.mapIndexed { index, total ->
                    BarChartView.Bar(
                        label = total.activity,
                        value = total.durationMs.toFloat(),
                        color = ChartColors.forIndex(index),
                        valueLabel = TimeFormat.hoursDecimal(total.durationMs),
                    )
                },
                animate,
            )
        } else {
            binding.pieChart.setData(
                totals.mapIndexed { index, total ->
                    PieChartView.Slice(total.activity, total.durationMs.toFloat(), ChartColors.forIndex(index))
                },
                title = TimeFormat.duration(report.totalTrackedMs),
                subtitle = getString(
                    if (report.range.dayCount == 1) R.string.report_pie_day else R.string.report_pie_week
                ),
                animate = animate,
            )
        }
        binding.pieChart.contentDescription = totals.joinToString(prefix = getString(R.string.cd_chart_prefix)) {
            "${it.activity} ${TimeFormat.duration(it.durationMs)}"
        }
        binding.activityBarChart.contentDescription = binding.pieChart.contentDescription

        binding.legendContainer.removeAllViews()
        totals.forEachIndexed { index, total ->
            val row = ItemLegendBinding.inflate(layoutInflater, binding.legendContainer, true)
            row.legendColor.backgroundTintList = ColorStateList.valueOf(ChartColors.forIndex(index))
            row.legendLabel.text = total.activity
            row.legendValue.text = getString(
                R.string.report_legend_value,
                TimeFormat.duration(total.durationMs),
                percent(total.durationMs, report.totalTrackedMs),
            )
        }
    }

    private fun setStat(stat: ItemStatBinding, value: String) {
        stat.statValue.text = value
    }

    private fun percent(part: Long, total: Long): Int =
        if (total <= 0) 0 else ((part * 100.0) / total).toInt()

    private companion object {
        const val MAX_CHART_ITEMS = 7
    }
}
