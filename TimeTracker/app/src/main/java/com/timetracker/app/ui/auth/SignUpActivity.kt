package com.timetracker.app.ui.auth

import android.content.Intent
import android.os.Bundle
import android.view.inputmethod.EditorInfo
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.isVisible
import androidx.core.widget.doAfterTextChanged
import com.google.android.material.textfield.TextInputLayout
import com.timetracker.app.core.AuthField
import com.timetracker.app.databinding.ActivitySignupBinding
import com.timetracker.app.ui.common.appViewModelFactory
import com.timetracker.app.ui.common.collectWhenStarted
import com.timetracker.app.ui.common.textValue
import com.timetracker.app.ui.main.MainActivity

/** Creates a new account and signs the user in. */
class SignUpActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySignupBinding

    private val viewModel: AuthViewModel by viewModels {
        appViewModelFactory { AuthViewModel(it.authRepository, it.taskRepository, it.preferences) }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        binding = ActivitySignupBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.signUpButton.setOnClickListener { submit() }
        binding.confirmPasswordInput.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == EditorInfo.IME_ACTION_DONE) {
                submit()
                true
            } else {
                false
            }
        }
        binding.loginLink.setOnClickListener { finish() }
        listOf(
            binding.nameLayout,
            binding.usernameLayout,
            binding.passwordLayout,
            binding.confirmPasswordLayout,
        ).forEach { layout ->
            layout.editText?.doAfterTextChanged {
                layout.error = null
                viewModel.clearError()
            }
        }

        collectWhenStarted(viewModel.state) { render(it) }
    }

    private fun submit() {
        viewModel.signUp(
            name = binding.nameLayout.textValue,
            username = binding.usernameLayout.textValue,
            password = binding.passwordInput.text?.toString().orEmpty(),
            confirmPassword = binding.confirmPasswordInput.text?.toString().orEmpty(),
        )
    }

    private fun render(state: AuthUiState) {
        val loading = state == AuthUiState.Loading
        binding.progress.isVisible = loading
        binding.signUpButton.isEnabled = !loading
        when (state) {
            is AuthUiState.Error -> layoutFor(state.field).error = getString(state.message)
            AuthUiState.LoggedIn -> {
                val intent = Intent(this, MainActivity::class.java)
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
                startActivity(intent)
                finish()
            }
            else -> Unit
        }
    }

    private fun layoutFor(field: AuthField?): TextInputLayout = when (field) {
        AuthField.NAME -> binding.nameLayout
        AuthField.USERNAME -> binding.usernameLayout
        AuthField.CONFIRM_PASSWORD -> binding.confirmPasswordLayout
        else -> binding.passwordLayout
    }
}
