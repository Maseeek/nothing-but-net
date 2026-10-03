package com.example.nothingbutnetmobile.domain.model

import com.example.nothingbutnetmobile.data.local.entity.SessionEntity

data class Session(
    val id: Long = 0,
    val totalShots: Int,
    val makes: Int,
    val misses: Int,
    val fgPercentage: Double,
    val longestStreak: Int,
    val averageAngle: Double,
    val averageMakeAngle: Double,
    val averageMissAngle: Double,
    val shotAngles: List<Double>,
    val shotsResults: List<Int>,
    val timestamp: Long
)

fun Session.toEntity(): SessionEntity {
    return SessionEntity(
        id = id,
        totalShots = totalShots,
        makes = makes,
        misses = misses,
        fgPercentage = fgPercentage,
        longestStreak = longestStreak,
        averageAngle = averageAngle,
        averageMakeAngle = averageMakeAngle,
        averageMissAngle = averageMissAngle,
        shotAngles = shotAngles,
        shotsResults = shotsResults,
        timestamp = timestamp
    )
}

fun calculateLongestStreak(results: List<Int>): Int {
    var maxStreak = 0
    var currentStreak = 0
    for (res in results) {
        if (res == 1) {
            currentStreak++
            if (currentStreak > maxStreak) maxStreak = currentStreak
        } else {
            currentStreak = 0
        }
    }
    return maxStreak
}

fun calculateAverageMakeAngle(angles: List<Double>, results: List<Int>): Double {
    val makeAngles = angles.filterIndexed { index, valAngle -> 
        index < results.size && results[index] == 1 && valAngle > 0.0 
    }
    return if (makeAngles.isNotEmpty()) makeAngles.average() else 0.0
}

fun calculateAverageMissAngle(angles: List<Double>, results: List<Int>): Double {
    val missAngles = angles.filterIndexed { index, valAngle -> 
        index < results.size && results[index] == 0 && valAngle > 0.0 
    }
    return if (missAngles.isNotEmpty()) missAngles.average() else 0.0
}


