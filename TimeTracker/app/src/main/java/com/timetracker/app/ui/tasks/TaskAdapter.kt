package com.timetracker.app.ui.tasks

import android.content.Context
import android.content.res.ColorStateList
import android.graphics.Paint
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.view.isVisible
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.timetracker.app.R
import com.timetracker.app.data.entity.Task
import com.timetracker.app.data.entity.TaskPriority
import com.timetracker.app.databinding.ItemTaskBinding
import com.timetracker.app.ui.common.UiFormat
import com.timetracker.app.ui.common.themeColor
import com.google.android.material.R as MaterialR

class TaskAdapter(
    private val onToggleDone: (Task, Boolean) -> Unit,
    private val onEdit: (Task) -> Unit,
    private val onReminder: (Task) -> Unit,
    private val onDelete: (Task) -> Unit,
) : ListAdapter<Task, TaskAdapter.ViewHolder>(DIFF) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder =
        ViewHolder(ItemTaskBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun onBindViewHolder(holder: ViewHolder, position: Int) = holder.bind(getItem(position))

    inner class ViewHolder(private val binding: ItemTaskBinding) : RecyclerView.ViewHolder(binding.root) {

        fun bind(task: Task) {
            val context = binding.root.context

            binding.doneCheck.setOnCheckedChangeListener(null)
            binding.doneCheck.isChecked = task.isDone
            binding.doneCheck.setOnCheckedChangeListener { _, checked -> onToggleDone(task, checked) }

            binding.title.text = task.title
            binding.title.paintFlags = if (task.isDone) {
                binding.title.paintFlags or Paint.STRIKE_THRU_TEXT_FLAG
            } else {
                binding.title.paintFlags and Paint.STRIKE_THRU_TEXT_FLAG.inv()
            }
            binding.title.alpha = if (task.isDone) 0.6f else 1f

            binding.description.text = task.description
            binding.description.isVisible = task.description.isNotBlank()

            bindPriority(context, task.priority)

            val reminderAt = task.reminderAt
            binding.reminderText.isVisible = reminderAt != null
            if (reminderAt != null) {
                val passed = reminderAt <= System.currentTimeMillis()
                binding.reminderText.text = context.getString(
                    if (passed) R.string.task_reminder_passed else R.string.task_reminder_at,
                    UiFormat.dateTime(context, reminderAt),
                )
            }

            binding.alarmButton.isVisible = !task.isDone
            binding.alarmButton.contentDescription = context.getString(R.string.cd_set_reminder, task.title)
            binding.deleteButton.contentDescription = context.getString(R.string.cd_delete_task, task.title)
            binding.root.setOnClickListener { onEdit(task) }
            binding.alarmButton.setOnClickListener { onReminder(task) }
            binding.deleteButton.setOnClickListener { onDelete(task) }
        }

        private fun bindPriority(context: Context, priority: TaskPriority) {
            val (label, background, foreground) = when (priority) {
                TaskPriority.HIGH -> Triple(
                    R.string.priority_high,
                    MaterialR.attr.colorErrorContainer,
                    MaterialR.attr.colorOnErrorContainer,
                )
                TaskPriority.MEDIUM -> Triple(
                    R.string.priority_medium,
                    MaterialR.attr.colorSecondaryContainer,
                    MaterialR.attr.colorOnSecondaryContainer,
                )
                TaskPriority.LOW -> Triple(
                    R.string.priority_low,
                    MaterialR.attr.colorTertiaryContainer,
                    MaterialR.attr.colorOnTertiaryContainer,
                )
            }
            binding.priorityLabel.setText(label)
            binding.priorityLabel.backgroundTintList = ColorStateList.valueOf(context.themeColor(background))
            binding.priorityLabel.setTextColor(context.themeColor(foreground))
        }
    }

    private companion object {
        val DIFF = object : DiffUtil.ItemCallback<Task>() {
            override fun areItemsTheSame(oldItem: Task, newItem: Task) = oldItem.id == newItem.id
            override fun areContentsTheSame(oldItem: Task, newItem: Task) = oldItem == newItem
        }
    }
}
