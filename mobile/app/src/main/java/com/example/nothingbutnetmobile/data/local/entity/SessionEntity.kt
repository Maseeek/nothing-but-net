package com.example.nothingbutnetmobile.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

import com.example.nothingbutnetmobile.domain.model.Session
import com.example.nothingbutnetmobile.domain.model.calculateLongestStreak
import com.example.nothingbutnetmobile.domain.model.calculateAverageMakeAngle
import com.example.nothingbutnetmobile.domain.model.calculateAverageMissAngle

@Entity(tableName = "sessions")
data class SessionEntity(
    @PrimaryKey(autoGenerate = true)
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
    val timestamp: Long = System.currentTimeMillis()
)

fun SessionEntity.toDomain(): Session {
    val computedTotalShots = if (totalShots > 0) totalShots else (makes + misses)
    val computedStreak = if (longestStreak > 0) longestStreak else calculateLongestStreak(shotsResults)
    val computedMakeAngle = if (averageMakeAngle > 0.0) averageMakeAngle else calculateAverageMakeAngle(shotAngles, shotsResults)
    val computedMissAngle = if (averageMissAngle > 0.0) averageMissAngle else calculateAverageMissAngle(shotAngles, shotsResults)
    return Session(
        id = id,
        totalShots = computedTotalShots,
        makes = makes,
        misses = misses,
        fgPercentage = fgPercentage,
        longestStreak = computedStreak,
        averageAngle = averageAngle,
        averageMakeAngle = computedMakeAngle,
        averageMissAngle = computedMissAngle,
        shotAngles = shotAngles,
        shotsResults = shotsResults,
        timestamp = timestamp
    )
}

