package com.timetracker.app.core

/** Validation problems for the login, sign-up and change-password forms. */
enum class ValidationError {
    NAME_REQUIRED,
    USERNAME_REQUIRED,
    USERNAME_INVALID,
    PASSWORD_REQUIRED,
    PASSWORD_TOO_SHORT,
    PASSWORDS_DO_NOT_MATCH,
}

enum class AuthField { NAME, USERNAME, PASSWORD, CONFIRM_PASSWORD }

data class FieldError(val field: AuthField, val error: ValidationError)

object AuthValidator {
    const val MIN_PASSWORD_LENGTH = 6
    private val USERNAME_PATTERN = Regex("^[a-z0-9._]{3,20}$")

    /** Usernames are stored lower-case and trimmed so `Vansh` and `vansh ` are the same account. */
    fun normalizeUsername(username: String): String = username.trim().lowercase()

    fun validateLogin(username: String, password: String): FieldError? = when {
        username.isBlank() -> FieldError(AuthField.USERNAME, ValidationError.USERNAME_REQUIRED)
        password.isEmpty() -> FieldError(AuthField.PASSWORD, ValidationError.PASSWORD_REQUIRED)
        else -> null
    }

    fun validateSignUp(name: String, username: String, password: String, confirm: String): FieldError? {
        val normalized = normalizeUsername(username)
        return when {
            name.isBlank() -> FieldError(AuthField.NAME, ValidationError.NAME_REQUIRED)
            normalized.isEmpty() -> FieldError(AuthField.USERNAME, ValidationError.USERNAME_REQUIRED)
            !USERNAME_PATTERN.matches(normalized) -> FieldError(AuthField.USERNAME, ValidationError.USERNAME_INVALID)
            else -> validateNewPassword(password, confirm)
        }
    }

    fun validateNewPassword(password: String, confirm: String): FieldError? = when {
        password.isEmpty() -> FieldError(AuthField.PASSWORD, ValidationError.PASSWORD_REQUIRED)
        password.length < MIN_PASSWORD_LENGTH -> FieldError(AuthField.PASSWORD, ValidationError.PASSWORD_TOO_SHORT)
        password != confirm -> FieldError(AuthField.CONFIRM_PASSWORD, ValidationError.PASSWORDS_DO_NOT_MATCH)
        else -> null
    }
}
