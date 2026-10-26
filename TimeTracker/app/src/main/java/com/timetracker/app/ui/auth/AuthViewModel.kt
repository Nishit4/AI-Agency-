package com.timetracker.app.ui.auth

import androidx.annotation.StringRes
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.timetracker.app.R
import com.timetracker.app.core.AuthField
import com.timetracker.app.core.AuthValidator
import com.timetracker.app.core.FieldError
import com.timetracker.app.core.ValidationError
import com.timetracker.app.data.AppPreferences
import com.timetracker.app.data.repository.AuthRepository
import com.timetracker.app.data.repository.AuthResult
import com.timetracker.app.data.repository.TaskRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed interface AuthUiState {
    data object Idle : AuthUiState
    data object Loading : AuthUiState
    data object LoggedIn : AuthUiState
    data class Error(val field: AuthField?, @StringRes val message: Int) : AuthUiState
}

/** Shared by the login and sign-up screens. */
class AuthViewModel(
    private val authRepository: AuthRepository,
    private val taskRepository: TaskRepository,
    private val preferences: AppPreferences,
) : ViewModel() {

    private val _state = MutableStateFlow<AuthUiState>(AuthUiState.Idle)
    val state: StateFlow<AuthUiState> = _state.asStateFlow()

    fun login(username: String, password: String) {
        AuthValidator.validateLogin(username, password)?.let {
            _state.value = it.toUiState()
            return
        }
        authenticate { authRepository.login(username, password) }
    }

    fun signUp(name: String, username: String, password: String, confirmPassword: String) {
        AuthValidator.validateSignUp(name, username, password, confirmPassword)?.let {
            _state.value = it.toUiState()
            return
        }
        authenticate { authRepository.signUp(name, username, password) }
    }

    fun clearError() {
        if (_state.value is AuthUiState.Error) _state.value = AuthUiState.Idle
    }

    private fun authenticate(action: suspend () -> AuthResult) {
        if (_state.value == AuthUiState.Loading) return
        _state.value = AuthUiState.Loading
        viewModelScope.launch {
            _state.value = when (val result = action()) {
                is AuthResult.Success -> {
                    preferences.currentUserId = result.user.id
                    taskRepository.rescheduleReminders(result.user.id)
                    AuthUiState.LoggedIn
                }
                is AuthResult.Failure -> when (result.reason) {
                    AuthResult.Reason.USERNAME_TAKEN ->
                        AuthUiState.Error(AuthField.USERNAME, R.string.error_username_taken)
                    else -> AuthUiState.Error(null, R.string.error_invalid_credentials)
                }
            }
        }
    }
}

@StringRes
fun ValidationError.messageRes(): Int = when (this) {
    ValidationError.NAME_REQUIRED -> R.string.error_name_required
    ValidationError.USERNAME_REQUIRED -> R.string.error_username_required
    ValidationError.USERNAME_INVALID -> R.string.error_username_invalid
    ValidationError.PASSWORD_REQUIRED -> R.string.error_password_required
    ValidationError.PASSWORD_TOO_SHORT -> R.string.error_password_too_short
    ValidationError.PASSWORDS_DO_NOT_MATCH -> R.string.error_passwords_do_not_match
}

private fun FieldError.toUiState() = AuthUiState.Error(field, error.messageRes())
