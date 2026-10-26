package com.timetracker.app.core

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class AuthTest {

    @Test
    fun usernames_areNormalised() {
        assertEquals("vansh", AuthValidator.normalizeUsername("  Vansh "))
    }

    @Test
    fun signUp_acceptsValidInput() {
        assertNull(AuthValidator.validateSignUp("Vansh Panchal", "vansh_p", "secret1", "secret1"))
    }

    @Test
    fun signUp_reportsTheFirstProblem() {
        assertEquals(
            FieldError(AuthField.NAME, ValidationError.NAME_REQUIRED),
            AuthValidator.validateSignUp(" ", "vansh", "secret1", "secret1"),
        )
        assertEquals(
            FieldError(AuthField.USERNAME, ValidationError.USERNAME_INVALID),
            AuthValidator.validateSignUp("Vansh", "va", "secret1", "secret1"),
        )
        assertEquals(
            FieldError(AuthField.USERNAME, ValidationError.USERNAME_INVALID),
            AuthValidator.validateSignUp("Vansh", "vansh panchal", "secret1", "secret1"),
        )
        assertEquals(
            FieldError(AuthField.PASSWORD, ValidationError.PASSWORD_TOO_SHORT),
            AuthValidator.validateSignUp("Vansh", "vansh", "123", "123"),
        )
        assertEquals(
            FieldError(AuthField.CONFIRM_PASSWORD, ValidationError.PASSWORDS_DO_NOT_MATCH),
            AuthValidator.validateSignUp("Vansh", "vansh", "secret1", "secret2"),
        )
    }

    @Test
    fun login_requiresBothFields() {
        assertEquals(ValidationError.USERNAME_REQUIRED, AuthValidator.validateLogin("", "x")?.error)
        assertEquals(ValidationError.PASSWORD_REQUIRED, AuthValidator.validateLogin("vansh", "")?.error)
        assertNull(AuthValidator.validateLogin("vansh", "x"))
    }

    @Test
    fun passwordHash_verifiesOnlyTheRightPassword() {
        val hashed = PasswordHasher.hash("secret1")
        assertTrue(PasswordHasher.verify("secret1", hashed.hash, hashed.salt))
        assertFalse(PasswordHasher.verify("secret2", hashed.hash, hashed.salt))
    }

    @Test
    fun passwordHash_usesARandomSalt() {
        val first = PasswordHasher.hash("secret1")
        val second = PasswordHasher.hash("secret1")
        assertNotEquals(first.salt, second.salt)
        assertNotEquals(first.hash, second.hash)
    }

    @Test
    fun passwordHash_rejectsCorruptedData() {
        assertFalse(PasswordHasher.verify("secret1", "not base64!", "also not base64!"))
    }
}
