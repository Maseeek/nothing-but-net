package com.example.nothingbutnetmobile.data.remote.models

import com.google.gson.annotations.SerializedName

data class AnalysisResult(
    @SerializedName("total_shots") val totalShots: Int,
    @SerializedName("makes") val makes: Int,
    @SerializedName("misses") val misses: Int,
    @SerializedName("fg_percentage") val fgPercentage: Double,
    @SerializedName("longest_streak") val longestStreak: Int,
    @SerializedName("average_angle") val averageAngle: Double,
    @SerializedName("average_make_angle") val averageMakeAngle: Double,
    @SerializedName("average_miss_angle") val averageMissAngle: Double,
    @SerializedName(value = "shot_angles", alternate = ["shotAngles"]) val shotAngles: List<Double>?,
    @SerializedName(value = "shot_results", alternate = ["shotsResults", "shots_results", "shotResults"]) val shotsResults: List<Int>?
)

data class AnalysisResponse(
    val success: Boolean,
    val data: AnalysisResult?,
    val error: String?
)
