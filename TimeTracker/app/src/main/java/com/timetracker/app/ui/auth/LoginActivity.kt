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
import com.timetracker.app.appContainer
import com.timetracker.app.core.AuthField
import com.timetracker.app.databinding.ActivityLoginBinding
import com.timetracker.app.ui.common.appViewModelFactory
import com.timetracker.app.ui.common.collectWhenStarted
import com.timetracker.app.ui.common.textValue
import com.timetracker.app.ui.main.MainActivity

/** Sign-in screen. This is the launcher activity; signed-in users go straight to [MainActivity]. */
class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding

    private val viewModel: AuthViewModel by viewModels {
        appViewModelFactory { AuthViewModel(it.authRepository, it.taskRepository, it.preferences) }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (appContainer.preferences.isLoggedIn) {
            openMain()
            return
        }
        enableEdgeToEdge()
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.loginButton.setOnClickListener { submit() }
        binding.passwordInput.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == EditorInfo.IME_ACTION_DONE) {
                submit()
                true
            } else {
                false
            }
        }
        binding.signUpLink.setOnClickListener {
            startActivity(Intent(this, SignUpActivity::class.java))
        }
        listOf(binding.usernameLayout, binding.passwordLayout).forEach { layout ->
            layout.editText?.doAfterTextChanged {
                layout.error = null
                viewModel.clearError()
            }
        }

        collectWhenStarted(viewModel.state) { render(it) }
    }

    private fun submit() {
        viewModel.login(binding.usernameLayout.textValue, binding.passwordInput.text?.toString().orEmpty())
    }

    private fun render(state: AuthUiState) {
        val loading = state == AuthUiState.Loading
        binding.progress.isVisible = loading
        binding.loginButton.isEnabled = !loading
        binding.signUpLink.isEnabled = !loading
        when (state) {
            is AuthUiState.Error -> layoutFor(state.field).error = getString(state.message)
            AuthUiState.LoggedIn -> openMain()
            else -> Unit
        }
    }

    private fun layoutFor(field: AuthField?): TextInputLayout =
        if (field == AuthField.USERNAME) binding.usernameLayout else binding.passwordLayout

    private fun openMain() {
        startActivity(Intent(this, MainActivity::class.java))
        finish()
    }
}
