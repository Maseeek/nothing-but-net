package com.example.nothingbutnetmobile

import android.content.ContentUris
import android.content.ContentValues
import android.database.Cursor
import android.net.Uri
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class SessionProviderTest {

    private val providerUri = Uri.parse("content://com.example.nothingbutnetmobile.provider/sessions")
    private val context = InstrumentationRegistry.getInstrumentation().targetContext
    private val gson = Gson()

    @Test
    fun testProviderInsertQueryAndDelete() {
        val resolver = context.contentResolver

        // insert session data
        val values = ContentValues().apply {
            put("totalShots", 5)
            put("makes", 3)
            put("misses", 2)
            put("fgPercentage", 60.0)
            put("longestStreak", 2)
            put("averageAngle", 51.5)
            put("averageMakeAngle", 52.0)
            put("averageMissAngle", 50.75)
            put("shotAngles", "[51.5, 52.0, 50.75]")
            put("shotsResults", "[1, 0, 1, 0, 1]")
            put("timestamp", 123456789L)
        }

        val insertedUri = resolver.insert(providerUri, values)
        assertNotNull("Inserted Uri should not be null", insertedUri)
        
        val insertedId = ContentUris.parseId(insertedUri!!)
        assertTrue("Inserted ID should be valid", insertedId > 0)

        // query all sessions
        val directoryCursor = resolver.query(providerUri, null, null, null, null)
        assertNotNull("Directory cursor should not be null", directoryCursor)
        
        try {
            var found = false
            val idIndex = directoryCursor!!.getColumnIndex("id")
            assertTrue("ID column should exist", idIndex >= 0)
            
            while (directoryCursor.moveToNext()) {
                if (directoryCursor.getLong(idIndex) == insertedId) {
                    found = true
                    
                    // verify fields are retrieved correctly
                    val totalShotsIndex = directoryCursor.getColumnIndex("totalShots")
                    val makesIndex = directoryCursor.getColumnIndex("makes")
                    val fgPercentageIndex = directoryCursor.getColumnIndex("fgPercentage")
                    val shotAnglesIndex = directoryCursor.getColumnIndex("shotAngles")
                    val shotsResultsIndex = directoryCursor.getColumnIndex("shotsResults")
                    
                    assertTrue("Columns should be found", totalShotsIndex >= 0 && makesIndex >= 0)
                    assertEquals(5, directoryCursor.getInt(totalShotsIndex))
                    assertEquals(3, directoryCursor.getInt(makesIndex))
                    assertEquals(60.0, directoryCursor.getDouble(fgPercentageIndex), 0.01)

                    // verify list json parsing
                    val shotAnglesStr = directoryCursor.getString(shotAnglesIndex)
                    val shotsResultsStr = directoryCursor.getString(shotsResultsIndex)
                    
                    val doubleType = object : TypeToken<List<Double>>() {}.type
                    val intType = object : TypeToken<List<Int>>() {}.type
                    
                    val shotAngles: List<Double> = gson.fromJson(shotAnglesStr, doubleType)
                    val shotsResults: List<Int> = gson.fromJson(shotsResultsStr, intType)
                    
                    assertEquals(3, shotAngles.size)
                    assertEquals(51.5, shotAngles[0], 0.01)
                    assertEquals(5, shotsResults.size)
                    assertEquals(1, shotsResults[0])
                    break
                }
            }
            assertTrue("Inserted row should be found in directory query", found)
        } finally {
            directoryCursor?.close()
        }

        // query specific session by id
        val itemUri = ContentUris.withAppendedId(providerUri, insertedId)
        val itemCursor = resolver.query(itemUri, null, null, null, null)
        assertNotNull("Item cursor should not be null", itemCursor)
        
        try {
            assertTrue("Item cursor should have the record", itemCursor!!.moveToFirst())
            val idIndex = itemCursor.getColumnIndex("id")
            assertEquals(insertedId, itemCursor.getLong(idIndex))
        } finally {
            itemCursor?.close()
        }

        // delete item
        val deleteCount = resolver.delete(itemUri, null, null)
        assertEquals("Should delete exactly 1 record", 1, deleteCount)

        // verify record is deleted
        val checkCursor = resolver.query(itemUri, null, null, null, null)
        assertNotNull("Cursor should not be null", checkCursor)
        try {
            assertFalse("Record should no longer exist", checkCursor!!.moveToFirst())
        } finally {
            checkCursor?.close()
        }
    }
}
