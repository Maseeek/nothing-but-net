package com.example.nothingbutnetmobile.data.repository

import com.example.nothingbutnetmobile.data.local.dao.SessionDao
import com.example.nothingbutnetmobile.data.local.entity.SessionEntity
import com.example.nothingbutnetmobile.data.local.entity.toDomain
import com.example.nothingbutnetmobile.data.remote.AuthApi
import com.example.nothingbutnetmobile.data.remote.models.SessionRequest
import com.example.nothingbutnetmobile.data.remote.models.MongoObjectId
import com.example.nothingbutnetmobile.domain.model.Session
import com.example.nothingbutnetmobile.domain.model.toEntity
import com.example.nothingbutnetmobile.domain.model.calculateLongestStreak
import com.example.nothingbutnetmobile.domain.repository.AuthRepository
import com.example.nothingbutnetmobile.domain.repository.StatsRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.text.SimpleDateFormat
import java.util.*
import javax.inject.Inject
import javax.inject.Singleton
import android.util.Log

@Singleton
class StatsRepositoryImpl @Inject constructor(
    private val sessionDao: SessionDao,
    private val authApi: AuthApi,
    private val authRepository: AuthRepository
) : StatsRepository {

    override fun getLatestSession(): Flow<Session?> {
        return sessionDao.getLatestSession().map { it?.toDomain() }
    }

    override fun getAllSessions(): Flow<List<Session>> {
        return sessionDao.getAllSessions().map { entities ->
            entities.map { it.toDomain() }
        }
    }

    override suspend fun getSessionById(id: Long): Session? {
        return sessionDao.getSessionById(id)?.toDomain()
    }

    override suspend fun saveSession(session: Session) {
        sessionDao.insertSession(session.toEntity())
    }

    override suspend fun seedDatabase() {
        // no longer seeding dummy data
    }

    override suspend fun clearAll() {
        sessionDao.deleteAll()
    }

    override suspend fun syncWithServer(): Result<Unit> {
        return try {
            val userId = authRepository.getUserId() ?: return Result.failure(Exception("User not logged in"))
            val response = authApi.getSessions(userId)
            
            if (response.isSuccessful) {
                val sessionsData = response.body() ?: emptyList()
                val sessionEntities = sessionsData.map { sessionData ->
                    val timestamp = parseServerDate(sessionData.sessionDate)
                    val rawTotal = sessionData.totalShots ?: 0
                    val computedTotalShots = if (rawTotal > 0) rawTotal else (sessionData.makes + sessionData.misses)
                    val results = sessionData.shotsResults ?: emptyList()
                    val rawStreak = sessionData.longestStreak ?: 0
                    val computedStreak = if (rawStreak > 0) rawStreak else calculateLongestStreak(results)
                    SessionEntity(
                        totalShots = computedTotalShots,
                        makes = sessionData.makes,
                        misses = sessionData.misses,
                        fgPercentage = sessionData.fgPercentage ?: 0.0,
                        longestStreak = computedStreak,
                        averageAngle = sessionData.averageAngle ?: 0.0,
                        averageMakeAngle = sessionData.averageMakeAngle ?: 0.0,
                        averageMissAngle = sessionData.averageMissAngle ?: 0.0,
                        shotAngles = sessionData.shotAngles ?: emptyList(),
                        shotsResults = results,
                        timestamp = timestamp
                    )
                }
                sessionDao.replaceAllSessions(sessionEntities)

                Result.success(Unit)
            } else {
                Result.failure(Exception("Sync failed: ${response.message()}"))
            }
        } catch (e: Exception) {
            Log.e("StatsRepository", "Sync error", e)
            Result.failure(e)
        }
    }

    private fun parseServerDate(dateStr: String?): Long {
        if (dateStr.isNullOrBlank()) return System.currentTimeMillis()
        
        // check if already a numeric timestamp
        val asLong = dateStr.toLongOrNull()
        if (asLong != null) {
            // check if seconds instead of ms
            return if (asLong < 1000000000000L) asLong * 1000L else asLong
        }

        try {
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                return java.time.Instant.parse(dateStr).toEpochMilli()
            }
        } catch (e: Exception) {
            // fallback to simpledateformat
        }

        val formats = listOf(
            "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
            "yyyy-MM-dd'T'HH:mm:ss'Z'",
            "EEE, dd MMM yyyy HH:mm:ss zzz"
        )
        for (format in formats) {
            try {
                val sdf = SimpleDateFormat(format, Locale.US).apply {
                    timeZone = TimeZone.getTimeZone("UTC")
                }
                val parsed = sdf.parse(dateStr)
                if (parsed != null) return parsed.time
            } catch (e: Exception) { continue }
        }
        return System.currentTimeMillis()
    }

    override suspend fun pushSessionToServer(session: Session): Result<Unit> {
        return try {
            val userId = authRepository.getUserId()
            val request = SessionRequest(
                userId = userId?.let { MongoObjectId(it) },
                makes = session.makes,
                misses = session.misses,
                longestStreak = session.longestStreak,
                averageAngle = session.averageAngle,
                averageMakeAngle = session.averageMakeAngle,
                averageMissAngle = session.averageMissAngle,
                fgPercentage = session.fgPercentage,
                shotAngles = session.shotAngles,
                shotsResults = session.shotsResults,
                totalShots = session.totalShots
            )
            
            val response = authApi.saveSession(request)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Push failed: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
