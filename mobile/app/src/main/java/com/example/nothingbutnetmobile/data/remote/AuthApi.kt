package com.example.nothingbutnetmobile.data.remote

import com.example.nothingbutnetmobile.data.remote.models.*
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface AuthApi {
    @POST("api/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @POST("api/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    @GET("api/profile")
    suspend fun getProfile(): Response<ProfileResponse>

    @POST("api/session")
    suspend fun saveSession(@Body session: SessionRequest): Response<SessionResponse>

    @GET("api/sessions/{userId}")
    suspend fun getSessions(@Path("userId") userId: String): Response<List<SessionData>>

    @GET("api/field-goal-percentage/{userId}")
    suspend fun getFgPercentage(@Path("userId") userId: String): Response<FgPercentageResponse>

    @GET("api/longest-streak/{userId}")
    suspend fun getLongestStreak(@Path("userId") userId: String): Response<LongestStreakResponse>
}
