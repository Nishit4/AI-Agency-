package com.timetracker.app.ui.exercise

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.timetracker.app.R
import com.timetracker.app.data.entity.Exercise
import com.timetracker.app.databinding.ItemExerciseBinding
import com.timetracker.app.ui.common.UiFormat

class ExerciseAdapter(
    private val onDelete: (Exercise) -> Unit,
) : ListAdapter<Exercise, ExerciseAdapter.ViewHolder>(DIFF) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder =
        ViewHolder(ItemExerciseBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun onBindViewHolder(holder: ViewHolder, position: Int) = holder.bind(getItem(position))

    inner class ViewHolder(private val binding: ItemExerciseBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(exercise: Exercise) {
            val context = binding.root.context
            binding.exerciseName.text = exercise.name
            val minutes = context.getString(R.string.exercise_minutes, exercise.durationMinutes)
            binding.exerciseDetails.text = when {
                exercise.sets > 0 && exercise.reps > 0 ->
                    context.getString(R.string.exercise_details_sets_reps, minutes, exercise.sets, exercise.reps)
                exercise.sets > 0 -> context.getString(R.string.exercise_details_sets, minutes, exercise.sets)
                else -> minutes
            }
            binding.exerciseDate.text = UiFormat.dateTime(context, exercise.performedAt)
            binding.deleteButton.contentDescription = context.getString(R.string.cd_delete_exercise, exercise.name)
            binding.deleteButton.setOnClickListener { onDelete(exercise) }
        }
    }

    private companion object {
        val DIFF = object : DiffUtil.ItemCallback<Exercise>() {
            override fun areItemsTheSame(oldItem: Exercise, newItem: Exercise) = oldItem.id == newItem.id
            override fun areContentsTheSame(oldItem: Exercise, newItem: Exercise) = oldItem == newItem
        }
    }
}
