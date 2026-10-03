package com.example.nothingbutnetmobile.data.local.dao

import android.database.Cursor
import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import androidx.room.Transaction
import com.example.nothingbutnetmobile.data.local.entity.SessionEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface SessionDao {
    @Query("SELECT * FROM sessions ORDER BY timestamp DESC LIMIT 1")
    fun getLatestSession(): Flow<SessionEntity?>

    @Query("SELECT * FROM sessions ORDER BY timestamp DESC")
    fun getAllSessions(): Flow<List<SessionEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSession(session: SessionEntity)

    @Query("SELECT * FROM sessions WHERE id = :id")
    suspend fun getSessionById(id: Long): SessionEntity?

    @Query("DELETE FROM sessions")
    suspend fun deleteAll()

    @Transaction
    suspend fun replaceAllSessions(sessions: List<SessionEntity>) {
        deleteAll()
        sessions.forEach { insertSession(it) }
    }

    // content provider queries
    @Query("SELECT * FROM sessions ORDER BY timestamp DESC")
    fun selectAllCursor(): Cursor

    @Query("SELECT * FROM sessions WHERE id = :id")
    fun selectByIdCursor(id: Long): Cursor

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    fun insertSynchronous(session: SessionEntity): Long

    @Query("DELETE FROM sessions WHERE id = :id")
    fun deleteByIdSynchronous(id: Long): Int

    @Update
    fun updateSynchronous(session: SessionEntity): Int
}
