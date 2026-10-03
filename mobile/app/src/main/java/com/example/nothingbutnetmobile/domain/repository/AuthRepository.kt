package com.example.nothingbutnetmobile.domain.repository

import com.example.nothingbutnetmobile.domain.model.User

interface AuthRepository {
    suspend fun login(username: String, password: String): Result<Unit>
    suspend fun register(username: String, email: String, password: String): Result<String>
    fun isLoggedIn(): Boolean
    fun getUser(): User?
    suspend fun getUserId(): String?
    fun logout()
}
