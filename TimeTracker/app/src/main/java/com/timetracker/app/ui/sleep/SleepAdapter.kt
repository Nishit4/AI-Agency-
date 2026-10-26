package com.timetracker.app.ui.sleep

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.view.isVisible
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.timetracker.app.R
import com.timetracker.app.core.TimeFormat
import com.timetracker.app.data.entity.SleepLog
import com.timetracker.app.data.entity.durationMs
import com.timetracker.app.databinding.ItemSleepBinding
import com.timetracker.app.ui.common.UiFormat

class SleepAdapter(
    private val onDelete: (SleepLog) -> Unit,
) : ListAdapter<SleepLog, SleepAdapter.ViewHolder>(DIFF) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder =
        ViewHolder(ItemSleepBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun onBindViewHolder(holder: ViewHolder, position: Int) = holder.bind(getItem(position))

    inner class ViewHolder(private val binding: ItemSleepBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(log: SleepLog) {
            val context = binding.root.context
            binding.sleepDate.text = UiFormat.shortDate(log.sleepEnd)
            binding.sleepRange.text = UiFormat.timeRange(context, log.sleepStart, log.sleepEnd)
            binding.sleepDuration.text = TimeFormat.duration(log.durationMs)
            binding.sleepQuality.rating = log.quality.toFloat()
            binding.sleepQuality.contentDescription = context.getString(R.string.cd_sleep_quality, log.quality)
            binding.sleepNote.text = log.note
            binding.sleepNote.isVisible = log.note.isNotBlank()
            binding.deleteButton.contentDescription = context.getString(R.string.cd_delete_sleep)
            binding.deleteButton.setOnClickListener { onDelete(log) }
        }
    }

    private companion object {
        val DIFF = object : DiffUtil.ItemCallback<SleepLog>() {
            override fun areItemsTheSame(oldItem: SleepLog, newItem: SleepLog) = oldItem.id == newItem.id
            override fun areContentsTheSame(oldItem: SleepLog, newItem: SleepLog) = oldItem == newItem
        }
    }
}
