package com.timetracker.app.ui.tracker

import android.content.res.ColorStateList
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.timetracker.app.R
import com.timetracker.app.core.TimeFormat
import com.timetracker.app.data.entity.TimeLog
import com.timetracker.app.data.entity.durationMs
import com.timetracker.app.databinding.ItemTimeLogBinding
import com.timetracker.app.ui.chart.ChartColors
import com.timetracker.app.ui.common.UiFormat

class TimeLogAdapter(
    private val onDelete: (TimeLog) -> Unit,
) : ListAdapter<TimeLog, TimeLogAdapter.ViewHolder>(DIFF) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder =
        ViewHolder(ItemTimeLogBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun onBindViewHolder(holder: ViewHolder, position: Int) = holder.bind(getItem(position))

    inner class ViewHolder(private val binding: ItemTimeLogBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(log: TimeLog) {
            val context = binding.root.context
            binding.activityName.text = log.activity
            binding.timeRange.text = UiFormat.timeRange(context, log.startTime, log.endTime)
            binding.duration.text = TimeFormat.duration(log.durationMs)
            binding.colorDot.backgroundTintList = ColorStateList.valueOf(ChartColors.forLabel(log.activity))
            binding.deleteButton.contentDescription = context.getString(R.string.cd_delete_record, log.activity)
            binding.deleteButton.setOnClickListener { onDelete(log) }
        }
    }

    private companion object {
        val DIFF = object : DiffUtil.ItemCallback<TimeLog>() {
            override fun areItemsTheSame(oldItem: TimeLog, newItem: TimeLog) = oldItem.id == newItem.id
            override fun areContentsTheSame(oldItem: TimeLog, newItem: TimeLog) = oldItem == newItem
        }
    }
}
