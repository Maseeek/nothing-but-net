package com.example.nothingbutnetmobile.data.repository

import com.example.nothingbutnetmobile.data.local.TokenManager
import com.example.nothingbutnetmobile.data.remote.AuthApi
import com.example.nothingbutnetmobile.data.remote.models.LoginRequest
import com.example.nothingbutnetmobile.data.remote.models.RegisterRequest
import com.example.nothingbutnetmobile.domain.model.User
import com.example.nothingbutnetmobile.domain.repository.AuthRepository
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepositoryImpl @Inject constructor(
    private val api: AuthApi,
    private val tokenManager: TokenManager
) : AuthRepository {

    override suspend fun login(username: String, password: String): Result<Unit> {
        return try {
            val response = api.login(LoginRequest(username, password))
            if (response.isSuccessful) {
                val body = response.body()
                if (body?.token != null) {
                    tokenManager.saveToken(body.token)
                    tokenManager.saveUsername(username)
                    
                    // fetch profile for userId
                    try {
                        val profileResponse = api.getProfile()
                        if (profileResponse.isSuccessful) {
                            profileResponse.body()?.userId?.let { 
                                tokenManager.saveUserId(it)
                            }
                        }
                    } catch (e: Exception) {
                        // profile failed, but we got the token
                    }
                    
                    Result.success(Unit)
                } else {
                    Result.failure(Exception(body?.error ?: "Unknown error occurred"))
                }
            } else {
                // parse error or fallback
                val errorMsg = response.errorBody()?.string() ?: response.message()
                Result.failure(Exception("Login failed: $errorMsg"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun register(username: String, email: String, password: String): Result<String> {
        return try {
            val response = api.register(RegisterRequest(username, email, password))
            if (response.isSuccessful) {
                val body = response.body()
                Result.success(body?.message ?: "Registration successful")
            } else {
                val errorMsg = response.errorBody()?.string() ?: response.message()
                Result.failure(Exception("Registration failed: $errorMsg"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override fun isLoggedIn(): Boolean {
        return tokenManager.isLoggedIn()
    }

    override fun getUser(): User? {
        return tokenManager.getUsername()?.let { User(it) }
    }

    override suspend fun getUserId(): String? {
        val storedId = tokenManager.getUserId()
        if (storedId != null) return storedId
        
        if (tokenManager.isLoggedIn()) {
            try {
                val response = api.getProfile()
                if (response.isSuccessful) {
                    val userId = response.body()?.userId
                    userId?.let { tokenManager.saveUserId(it) }
                    return userId
                }
            } catch (e: Exception) {
            }
        }
        return null
    }

    override fun logout() {
        tokenManager.clearToken()
        // clearToken forces sync to clear eventually
    }
}
