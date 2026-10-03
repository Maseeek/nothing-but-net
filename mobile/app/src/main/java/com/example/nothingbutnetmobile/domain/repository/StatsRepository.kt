package com.example.nothingbutnetmobile.domain.repository

import com.example.nothingbutnetmobile.domain.model.Session
import kotlinx.coroutines.flow.Flow

interface StatsRepository {
    fun getLatestSession(): Flow<Session?>
    fun getAllSessions(): Flow<List<Session>>
    suspend fun getSessionById(id: Long): Session?
    suspend fun saveSession(session: Session)
    suspend fun seedDatabase()
    suspend fun clearAll()
    
    // server sync
    suspend fun syncWithServer(): Result<Unit>
    suspend fun pushSessionToServer(session: Session): Result<Unit>
}
