package com.timetracker.app.ui.common

import android.text.InputType
import androidx.annotation.StringRes
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.timetracker.app.R
import com.timetracker.app.databinding.DialogTextInputBinding

/**
 * Shows a dialog with one text field. [validate] returns an error message resource, or null when
 * the text is valid; the dialog only closes once the input is valid.
 */
fun Fragment.showTextInputDialog(
    @StringRes title: Int,
    @StringRes hint: Int,
    initialText: String = "",
    inputType: Int = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_CAP_SENTENCES,
    validate: (String) -> Int? = { if (it.isBlank()) R.string.error_required else null },
    onConfirm: (String) -> Unit,
) {
    val binding = DialogTextInputBinding.inflate(layoutInflater)
    binding.inputLayout.hint = getString(hint)
    binding.input.inputType = inputType
    binding.input.setText(initialText)
    binding.input.setSelection(initialText.length)

    val dialog = MaterialAlertDialogBuilder(requireContext())
        .setTitle(title)
        .setView(binding.root)
        .setPositiveButton(R.string.action_save, null)
        .setNegativeButton(R.string.action_cancel, null)
        .show()
    dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener {
        val text = binding.inputLayout.textValue
        val error = validate(text)
        if (error != null) {
            binding.inputLayout.error = getString(error)
        } else {
            onConfirm(text)
            dialog.dismiss()
        }
    }
}

/** Shows a simple "are you sure?" dialog. */
fun Fragment.confirm(
    @StringRes title: Int,
    message: CharSequence,
    @StringRes positive: Int,
    onConfirm: () -> Unit,
) {
    MaterialAlertDialogBuilder(requireContext())
        .setTitle(title)
        .setMessage(message)
        .setPositiveButton(positive) { _, _ -> onConfirm() }
        .setNegativeButton(R.string.action_cancel, null)
        .show()
}
