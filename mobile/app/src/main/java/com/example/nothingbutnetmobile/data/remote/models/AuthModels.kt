package com.example.nothingbutnetmobile.data.remote.models

import com.google.gson.annotations.SerializedName

data class LoginRequest(
    val username: String,
    val password: String
)

data class RegisterRequest(
    val username: String,
    val email: String,
    val password: String
)

data class AuthResponse(
    val token: String?,
    val error: String?,
    val message: String?
)

data class ProfileResponse(
    val userId: String,
    val username: String,
    val email: String,
    val emailVerified: Boolean,
    val isPro: Boolean
)
