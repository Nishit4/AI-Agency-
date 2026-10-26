package com.timetracker.app.core

import java.security.MessageDigest
import java.security.SecureRandom
import java.util.Base64
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.PBEKeySpec

/**
 * Hashes passwords with PBKDF2 (HMAC-SHA256) and a random salt, so plain-text passwords are never
 * stored in the database.
 */
object PasswordHasher {
    private const val ALGORITHM = "PBKDF2WithHmacSHA256"
    private const val ITERATIONS = 100_000
    private const val KEY_LENGTH_BITS = 256
    private const val SALT_BYTES = 16

    private val random = SecureRandom()

    data class HashedPassword(val hash: String, val salt: String)

    fun hash(password: String): HashedPassword {
        val salt = ByteArray(SALT_BYTES).also { random.nextBytes(it) }
        return HashedPassword(encode(derive(password, salt)), encode(salt))
    }

    fun verify(password: String, hash: String, salt: String): Boolean {
        val expected = decode(hash) ?: return false
        val saltBytes = decode(salt) ?: return false
        return MessageDigest.isEqual(derive(password, saltBytes), expected)
    }

    private fun derive(password: String, salt: ByteArray): ByteArray {
        val spec = PBEKeySpec(password.toCharArray(), salt, ITERATIONS, KEY_LENGTH_BITS)
        return try {
            SecretKeyFactory.getInstance(ALGORITHM).generateSecret(spec).encoded
        } finally {
            spec.clearPassword()
        }
    }

    private fun encode(bytes: ByteArray): String = Base64.getEncoder().encodeToString(bytes)

    private fun decode(value: String): ByteArray? =
        try {
            Base64.getDecoder().decode(value)
        } catch (e: IllegalArgumentException) {
            null
        }
}
