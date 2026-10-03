package com.example.nothingbutnetmobile.data.remote.models

import com.google.gson.Gson
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Test

class SessionDataTest {

    @Test
    fun `test SessionData parses shot_angles and longest_streak correctly`() {
        // given a json payload similar to server response
        val jsonPayload = """
            {
                "makes": 5,
                "misses": 5,
                "total_shots": 10,
                "longest_streak": 3,
                "shot_angles": [45.5, 48.0, 52.1, 55.5, 43.2],
                "shot_results": [1, 1, 1, 0, 0]
            }
        """.trimIndent()

        val gson = Gson()

        // when deserializing
        val sessionData = gson.fromJson(jsonPayload, SessionData::class.java)

        // then verify streak and angles map correctly
        assertNotNull(sessionData)
        assertEquals(3, sessionData.longestStreak)
        assertNotNull(sessionData.shotAngles)
        assertEquals(5, sessionData.shotAngles?.size)
        assertEquals(45.5, sessionData.shotAngles?.get(0))
        assertEquals(48.0, sessionData.shotAngles?.get(1))
    }
    
    @Test
    fun `test SessionData uses alternate keys for shotAngles and shotsResults`() {
        val jsonPayload = """
            {
                "makes": 2,
                "misses": 1,
                "longest_streak": 2,
                "shotAngles": [50.0, 52.0, 48.0],
                "shotsResults": [1, 1, 0]
            }
        """.trimIndent()

        val gson = Gson()

        // when deserializing
        val sessionData = gson.fromJson(jsonPayload, SessionData::class.java)

        // then verify alternate keys map correctly
        assertNotNull(sessionData.shotAngles)
        assertEquals(3, sessionData.shotAngles?.size)
        assertEquals(50.0, sessionData.shotAngles?.get(0))
        
        assertNotNull(sessionData.shotsResults)
        assertEquals(3, sessionData.shotsResults?.size)
        assertEquals(1, sessionData.shotsResults?.get(0))
        assertEquals(0, sessionData.shotsResults?.get(2))
    }

    @Test
    fun `test calculateAverageMakeAngle and calculateAverageMissAngle`() {
        val angles = listOf(45.0, 0.0, 50.0, 30.0, 40.0)
        val results = listOf(1, 1, 1, 0, 0)
        
        // makes are at 0, 1, 2. angles are 45.0, 0.0, 50.0
        // 0.0 is filtered out as failed detection
        // valid make angles are 45.0 and 50.0. avg is 47.5
        val avgMake = com.example.nothingbutnetmobile.domain.model.calculateAverageMakeAngle(angles, results)
        assertEquals(47.5, avgMake, 0.001)

        // misses are at 3, 4. angles are 30.0, 40.0
        // both are valid (>0.0). avg is 35.0
        val avgMiss = com.example.nothingbutnetmobile.domain.model.calculateAverageMissAngle(angles, results)
        assertEquals(35.0, avgMiss, 0.001)
    }
}
