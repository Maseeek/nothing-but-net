package com.example.nothingbutnetmobile.data.remote.models

import com.google.gson.annotations.SerializedName

data class MongoObjectId(
    @SerializedName("\$oid") val oid: String
)

data class MongoDate(
    @SerializedName("\$date") val dateStr: String
)

data class SessionRequest(
    @SerializedName("userId") val userId: MongoObjectId?,
    @SerializedName("makes") val makes: Int,
    @SerializedName("misses") val misses: Int,
    @SerializedName("longest_streak") val longestStreak: Int,
    @SerializedName("average_angle") val averageAngle: Double,
    @SerializedName("average_make_angle") val averageMakeAngle: Double,
    @SerializedName("average_miss_angle") val averageMissAngle: Double,
    @SerializedName("fg_percentage") val fgPercentage: Double,
    @SerializedName(value = "shot_angles", alternate = ["shotAngles"]) val shotAngles: List<Double>,
    @SerializedName(value = "shot_results", alternate = ["shotsResults", "shots_results", "shotResults"]) val shotsResults: List<Int>,
    @SerializedName("total_shots") val totalShots: Int
)

data class SessionResponse(
    val message: String,
    val session: SessionData
)

data class SessionData(
    @SerializedName("_id") val mongoId: MongoObjectId?,
    @SerializedName("userId") val mongoUserId: MongoObjectId?,
    @SerializedName("sessionDate") val mongoDate: MongoDate?,
    @SerializedName("makes") val makes: Int,
    @SerializedName("misses") val misses: Int,
    @SerializedName("longest_streak") val longestStreak: Int? = 0,
    @SerializedName("average_angle") val averageAngle: Double? = 0.0,
    @SerializedName("average_make_angle") val averageMakeAngle: Double? = 0.0,
    @SerializedName("average_miss_angle") val averageMissAngle: Double? = 0.0,
    @SerializedName("fg_percentage") val fgPercentage: Double? = 0.0,
    @SerializedName(value = "shot_angles", alternate = ["shotAngles"]) val shotAngles: List<Double>? = emptyList(),
    @SerializedName(value = "shot_results", alternate = ["shotsResults", "shots_results", "shotResults"]) val shotsResults: List<Int>? = emptyList(),
    @SerializedName("total_shots") val totalShots: Int? = 0,
    @SerializedName("__v") val version: Int? = 0
) {
    val id: String get() = mongoId?.oid ?: ""
    val userId: String get() = mongoUserId?.oid ?: ""
    val sessionDate: String get() = mongoDate?.dateStr ?: ""
}

data class FgPercentageResponse(
    val fieldGoalPercentage: String
)

data class LongestStreakResponse(
    val longestStreak: Int
)
