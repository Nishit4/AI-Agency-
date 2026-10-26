package com.timetracker.app.data.repository

import android.database.sqlite.SQLiteConstraintException
import com.timetracker.app.core.AuthValidator
import com.timetracker.app.core.PasswordHasher
import com.timetracker.app.data.dao.UserDao
import com.timetracker.app.data.entity.User
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext

sealed interface AuthResult {
    data class Success(val user: User) : AuthResult
    data class Failure(val reason: Reason) : AuthResult

    enum class Reason { USERNAME_TAKEN, INVALID_CREDENTIALS, WRONG_PASSWORD, USER_NOT_FOUND }
}

/** Creates accounts and checks sign-in details against the local user table. */
class AuthRepository(private val userDao: UserDao) {

    fun observeUser(userId: Long): Flow<User?> = userDao.observe(userId)

    suspend fun getUser(userId: Long): User? = userDao.findById(userId)

    suspend fun signUp(name: String, username: String, password: String): AuthResult =
        withContext(Dispatchers.Default) {
            val normalized = AuthValidator.normalizeUsername(username)
            if (userDao.findByUsername(normalized) != null) {
                return@withContext AuthResult.Failure(AuthResult.Reason.USERNAME_TAKEN)
            }
            val hashed = PasswordHasher.hash(password)
            val user = User(
                name = name.trim(),
                username = normalized,
                passwordHash = hashed.hash,
                salt = hashed.salt,
            )
            try {
                val id = userDao.insert(user)
                AuthResult.Success(user.copy(id = id))
            } catch (e: SQLiteConstraintException) {
                AuthResult.Failure(AuthResult.Reason.USERNAME_TAKEN)
            }
        }

    suspend fun login(username: String, password: String): AuthResult =
        withContext(Dispatchers.Default) {
            val user = userDao.findByUsername(AuthValidator.normalizeUsername(username))
            if (user != null && PasswordHasher.verify(password, user.passwordHash, user.salt)) {
                AuthResult.Success(user)
            } else {
                AuthResult.Failure(AuthResult.Reason.INVALID_CREDENTIALS)
            }
        }

    suspend fun changePassword(userId: Long, currentPassword: String, newPassword: String): AuthResult =
        withContext(Dispatchers.Default) {
            val user = userDao.findById(userId)
                ?: return@withContext AuthResult.Failure(AuthResult.Reason.USER_NOT_FOUND)
            if (!PasswordHasher.verify(currentPassword, user.passwordHash, user.salt)) {
                return@withContext AuthResult.Failure(AuthResult.Reason.WRONG_PASSWORD)
            }
            val hashed = PasswordHasher.hash(newPassword)
            val updated = user.copy(passwordHash = hashed.hash, salt = hashed.salt)
            userDao.update(updated)
            AuthResult.Success(updated)
        }

    suspend fun updateName(userId: Long, name: String) {
        val user = userDao.findById(userId) ?: return
        userDao.update(user.copy(name = name.trim()))
    }
}
