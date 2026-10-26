package com.timetracker.app.ui.settings

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.text.InputType
import android.view.View
import androidx.annotation.DrawableRes
import androidx.annotation.StringRes
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.snackbar.Snackbar
import com.timetracker.app.BuildConfig
import com.timetracker.app.R
import com.timetracker.app.appContainer
import com.timetracker.app.core.AuthField
import com.timetracker.app.core.AuthValidator
import com.timetracker.app.data.repository.AuthResult
import com.timetracker.app.databinding.DialogChangePasswordBinding
import com.timetracker.app.databinding.FragmentSettingsBinding
import com.timetracker.app.databinding.ItemSettingRowBinding
import com.timetracker.app.notification.Notifications
import com.timetracker.app.ui.auth.messageRes
import com.timetracker.app.ui.common.collectWhenStarted
import com.timetracker.app.ui.common.confirm
import com.timetracker.app.ui.common.levelTitleRes
import com.timetracker.app.ui.common.showTextInputDialog
import com.timetracker.app.ui.main.MainActivity
import kotlinx.coroutines.launch

/** Profile, appearance, notification and data settings, plus logout. */
class SettingsFragment : Fragment(R.layout.fragment_settings) {

    private var _binding: FragmentSettingsBinding? = null
    private val binding get() = _binding!!

    private val container get() = requireContext().appContainer
    private val userId get() = container.preferences.requireUserId()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        _binding = FragmentSettingsBinding.bind(view)

        setupRow(binding.rowEditName, R.drawable.ic_person, R.string.settings_edit_name) { editName() }
        setupRow(binding.rowChangePassword, R.drawable.ic_lock, R.string.settings_change_password) { changePassword() }
        setupRow(binding.rowTheme, R.drawable.ic_palette, R.string.settings_theme) { chooseTheme() }
        setupRow(binding.rowNotifications, R.drawable.ic_notifications, R.string.settings_notifications) {
            openNotificationSettings()
        }
        setupRow(binding.rowExactAlarms, R.drawable.ic_alarm, R.string.settings_exact_alarms) { openExactAlarmSettings() }
        setupRow(binding.rowSampleData, R.drawable.ic_dataset, R.string.settings_sample_data) { loadSampleData() }
        setupRow(binding.rowAbout, R.drawable.ic_info, R.string.settings_about) { showAbout() }
        binding.rowSampleData.rowSubtitle.setText(R.string.settings_sample_data_summary)
        binding.rowSampleData.rowSubtitle.isVisible = true
        binding.rowAbout.rowSubtitle.text = getString(R.string.settings_version, BuildConfig.VERSION_NAME)
        binding.rowAbout.rowSubtitle.isVisible = true
        binding.rowExactAlarms.root.isVisible = Build.VERSION.SDK_INT >= Build.VERSION_CODES.S

        binding.logoutButton.setOnClickListener { (requireActivity() as MainActivity).confirmLogout() }

        val owner = viewLifecycleOwner
        owner.collectWhenStarted(container.authRepository.observeUser(userId)) { user ->
            binding.profileName.text = user?.name.orEmpty()
            binding.profileUsername.text = getString(R.string.settings_username, user?.username.orEmpty())
            binding.profileInitial.text = user?.name?.firstOrNull()?.uppercase().orEmpty()
        }
        owner.collectWhenStarted(container.statsRepository.observeLevel(userId)) { level ->
            binding.profileLevel.text = getString(
                R.string.drawer_level,
                level.level,
                getString(level.title.levelTitleRes()),
                level.totalXp,
            )
        }
    }

    override fun onResume() {
        super.onResume()
        // Permissions can be changed in system settings while this screen is hidden.
        renderStatusRows()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private fun setupRow(
        row: ItemSettingRowBinding,
        @DrawableRes icon: Int,
        @StringRes title: Int,
        onClick: () -> Unit,
    ) {
        row.rowIcon.setImageResource(icon)
        row.rowTitle.setText(title)
        row.rowSubtitle.isVisible = false
        row.root.setOnClickListener { onClick() }
    }

    private fun renderStatusRows() {
        val context = requireContext()
        binding.rowTheme.rowSubtitle.setText(themeLabel(container.preferences.themeMode))
        binding.rowTheme.rowSubtitle.isVisible = true

        binding.rowNotifications.rowSubtitle.setText(
            if (Notifications.canPostNotifications(context)) R.string.settings_on else R.string.settings_notifications_off
        )
        binding.rowNotifications.rowSubtitle.isVisible = true

        binding.rowExactAlarms.rowSubtitle.setText(
            if (container.alarmScheduler.canScheduleExactAlarms()) R.string.settings_on else R.string.settings_exact_alarms_off
        )
        binding.rowExactAlarms.rowSubtitle.isVisible = true
    }

    private fun editName() {
        viewLifecycleOwner.lifecycleScope.launch {
            val current = container.authRepository.getUser(userId)?.name.orEmpty()
            showTextInputDialog(
                title = R.string.settings_edit_name,
                hint = R.string.hint_full_name,
                initialText = current,
                inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PERSON_NAME or
                    InputType.TYPE_TEXT_FLAG_CAP_WORDS,
                validate = { if (it.isBlank()) R.string.error_name_required else null },
            ) { name ->
                container.applicationScope.launch { container.authRepository.updateName(userId, name) }
            }
        }
    }

    private fun changePassword() {
        val dialogBinding = DialogChangePasswordBinding.inflate(layoutInflater)
        val dialog = MaterialAlertDialogBuilder(requireContext())
            .setTitle(R.string.settings_change_password)
            .setView(dialogBinding.root)
            .setPositiveButton(R.string.action_save, null)
            .setNegativeButton(R.string.action_cancel, null)
            .show()
        val positive = dialog.getButton(AlertDialog.BUTTON_POSITIVE)
        positive.setOnClickListener {
            val current = dialogBinding.currentInput.text?.toString().orEmpty()
            val newPassword = dialogBinding.newInput.text?.toString().orEmpty()
            val confirmPassword = dialogBinding.confirmInput.text?.toString().orEmpty()
            dialogBinding.currentLayout.error = null
            dialogBinding.newLayout.error = null
            dialogBinding.confirmLayout.error = null

            if (current.isEmpty()) {
                dialogBinding.currentLayout.error = getString(R.string.error_password_required)
                return@setOnClickListener
            }
            val error = AuthValidator.validateNewPassword(newPassword, confirmPassword)
            if (error != null) {
                val layout = if (error.field == AuthField.CONFIRM_PASSWORD) dialogBinding.confirmLayout else dialogBinding.newLayout
                layout.error = getString(error.error.messageRes())
                return@setOnClickListener
            }
            positive.isEnabled = false
            viewLifecycleOwner.lifecycleScope.launch {
                val result = container.authRepository.changePassword(userId, current, newPassword)
                positive.isEnabled = true
                if (result is AuthResult.Success) {
                    dialog.dismiss()
                    Snackbar.make(binding.root, R.string.settings_password_changed, Snackbar.LENGTH_SHORT).show()
                } else {
                    dialogBinding.currentLayout.error = getString(R.string.error_wrong_password)
                }
            }
        }
    }

    private fun chooseTheme() {
        val modes = intArrayOf(
            AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM,
            AppCompatDelegate.MODE_NIGHT_NO,
            AppCompatDelegate.MODE_NIGHT_YES,
        )
        val labels = modes.map { getString(themeLabel(it)) }.toTypedArray()
        val selected = modes.indexOf(container.preferences.themeMode).coerceAtLeast(0)
        MaterialAlertDialogBuilder(requireContext())
            .setTitle(R.string.settings_theme)
            .setSingleChoiceItems(labels, selected) { dialog, which ->
                container.preferences.themeMode = modes[which]
                dialog.dismiss()
                AppCompatDelegate.setDefaultNightMode(modes[which])
            }
            .setNegativeButton(R.string.action_cancel, null)
            .show()
    }

    @StringRes
    private fun themeLabel(mode: Int): Int = when (mode) {
        AppCompatDelegate.MODE_NIGHT_NO -> R.string.theme_light
        AppCompatDelegate.MODE_NIGHT_YES -> R.string.theme_dark
        else -> R.string.theme_system
    }

    private fun openNotificationSettings() {
        val intent = Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS)
            .putExtra(Settings.EXTRA_APP_PACKAGE, requireContext().packageName)
        startActivity(intent)
    }

    private fun openExactAlarmSettings() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return
        val intent = Intent(
            Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM,
            Uri.parse("package:${requireContext().packageName}"),
        )
        startActivity(intent)
    }

    private fun loadSampleData() {
        confirm(R.string.settings_sample_data, getString(R.string.sample_data_confirm), R.string.action_add) {
            val appContainer = container
            val id = userId
            appContainer.applicationScope.launch {
                appContainer.sampleDataSeeder.seed(id)
                appContainer.taskRepository.rescheduleReminders(id)
            }
            Snackbar.make(binding.root, R.string.sample_data_added, Snackbar.LENGTH_SHORT).show()
        }
    }

    private fun showAbout() {
        MaterialAlertDialogBuilder(requireContext())
            .setTitle(R.string.app_name)
            .setMessage(getString(R.string.about_message, BuildConfig.VERSION_NAME))
            .setPositiveButton(android.R.string.ok, null)
            .show()
    }
}
