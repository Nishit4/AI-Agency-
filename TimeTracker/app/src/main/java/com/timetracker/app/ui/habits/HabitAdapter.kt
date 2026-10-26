package com.timetracker.app.ui.habits

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.view.isVisible
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.timetracker.app.R
import com.timetracker.app.databinding.ItemHabitBinding
import com.timetracker.app.ui.common.themeColor
import com.google.android.material.R as MaterialR

class HabitAdapter(
    private val onAddPart: (HabitItem) -> Unit,
    private val onRemovePart: (HabitItem) -> Unit,
    private val onMore: (HabitItem, View) -> Unit,
) : ListAdapter<HabitItem, HabitAdapter.ViewHolder>(DIFF) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder =
        ViewHolder(ItemHabitBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun onBindViewHolder(holder: ViewHolder, position: Int) = holder.bind(getItem(position))

    inner class ViewHolder(private val binding: ItemHabitBinding) : RecyclerView.ViewHolder(binding.root) {

        fun bind(item: HabitItem) {
            val context = binding.root.context
            val habit = item.habit

            binding.habitName.text = habit.name
            binding.progressText.text = context.getString(R.string.habit_progress, item.progress, habit.target)
            binding.parts.setProgress(item.progress, habit.target)
            binding.parts.setFilledColor(
                context.themeColor(if (item.isComplete) MaterialR.attr.colorTertiary else MaterialR.attr.colorPrimary)
            )

            binding.streakText.isVisible = item.streak > 0
            binding.streakText.text = context.resources.getQuantityString(R.plurals.habit_streak, item.streak, item.streak)
            binding.completedText.isVisible = item.isComplete

            binding.addPartButton.isEnabled = !item.isComplete
            binding.removePartButton.isEnabled = item.progress > 0
            binding.addPartButton.contentDescription = context.getString(R.string.cd_add_part, habit.name)
            binding.removePartButton.contentDescription = context.getString(R.string.cd_remove_part, habit.name)
            binding.moreButton.contentDescription = context.getString(R.string.cd_habit_options, habit.name)

            binding.addPartButton.setOnClickListener { onAddPart(item) }
            binding.removePartButton.setOnClickListener { onRemovePart(item) }
            binding.moreButton.setOnClickListener { onMore(item, it) }
        }
    }

    private companion object {
        val DIFF = object : DiffUtil.ItemCallback<HabitItem>() {
            override fun areItemsTheSame(oldItem: HabitItem, newItem: HabitItem) = oldItem.habit.id == newItem.habit.id
            override fun areContentsTheSame(oldItem: HabitItem, newItem: HabitItem) = oldItem == newItem
        }
    }
}
