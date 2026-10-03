package com.example.nothingbutnetmobile.data.local.provider

import android.content.ContentProvider
import android.content.ContentUris
import android.content.ContentValues
import android.content.UriMatcher
import android.database.Cursor
import android.net.Uri
import androidx.room.Room
import com.example.nothingbutnetmobile.data.local.AppDatabase
import com.example.nothingbutnetmobile.data.local.entity.SessionEntity
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

// content provider required for coursework spec contentprovider requirement, queries room database synchronously
class SessionProvider : ContentProvider() {

    companion object {
        const val AUTHORITY = "com.example.nothingbutnetmobile.provider"
        val CONTENT_URI: Uri = Uri.parse("content://$AUTHORITY/sessions")

        private const val CODE_DIR = 1
        private const val CODE_ITEM = 2

        private val uriMatcher = UriMatcher(UriMatcher.NO_MATCH).apply {
            addURI(AUTHORITY, "sessions", CODE_DIR)
            addURI(AUTHORITY, "sessions/#", CODE_ITEM)
        }
    }

    private lateinit var database: AppDatabase
    private val gson = Gson()

    override fun onCreate(): Boolean {
        val ctx = context ?: return false
        database = Room.databaseBuilder(
            ctx.applicationContext,
            AppDatabase::class.java,
            "nbn_database"
        ).fallbackToDestructiveMigration().build()
        return true
    }

    override fun query(
        uri: Uri,
        projection: Array<out String>?,
        selection: String?,
        selectionArgs: Array<out String>?,
        sortOrder: String?
    ): Cursor? {
        val cursor: Cursor = when (uriMatcher.match(uri)) {
            CODE_DIR -> database.sessionDao().selectAllCursor()
            CODE_ITEM -> {
                val id = ContentUris.parseId(uri)
                database.sessionDao().selectByIdCursor(id)
            }
            else -> throw IllegalArgumentException("Unknown URI: $uri")
        }
        cursor.setNotificationUri(context?.contentResolver, uri)
        return cursor
    }

    override fun insert(uri: Uri, values: ContentValues?): Uri? {
        if (uriMatcher.match(uri) != CODE_DIR) {
            throw IllegalArgumentException("Invalid URI for insert: $uri")
        }
        val context = context ?: return null
        values ?: return null

        val shotAnglesStr = values.getAsString("shotAngles")
        val shotAnglesList: List<Double> = if (!shotAnglesStr.isNullOrEmpty()) {
            try {
                val type = object : TypeToken<List<Double>>() {}.type
                gson.fromJson(shotAnglesStr, type) ?: emptyList()
            } catch (e: Exception) {
                emptyList()
            }
        } else {
            emptyList()
        }

        val shotsResultsStr = values.getAsString("shotsResults")
        val shotsResultsList: List<Int> = if (!shotsResultsStr.isNullOrEmpty()) {
            try {
                val type = object : TypeToken<List<Int>>() {}.type
                gson.fromJson(shotsResultsStr, type) ?: emptyList()
            } catch (e: Exception) {
                emptyList()
            }
        } else {
            emptyList()
        }

        val rawTotal = values.getAsInteger("totalShots") ?: 0
        val makesVal = values.getAsInteger("makes") ?: 0
        val missesVal = values.getAsInteger("misses") ?: 0
        val computedTotal = if (rawTotal > 0) rawTotal else (makesVal + missesVal)

        val entity = SessionEntity(
            id = values.getAsLong("id") ?: 0L,
            totalShots = computedTotal,
            makes = makesVal,
            misses = missesVal,
            fgPercentage = values.getAsDouble("fgPercentage") ?: 0.0,
            longestStreak = values.getAsInteger("longestStreak") ?: 0,
            averageAngle = values.getAsDouble("averageAngle") ?: 0.0,
            averageMakeAngle = values.getAsDouble("averageMakeAngle") ?: 0.0,
            averageMissAngle = values.getAsDouble("averageMissAngle") ?: 0.0,
            shotAngles = shotAnglesList,
            shotsResults = shotsResultsList,
            timestamp = values.getAsLong("timestamp") ?: System.currentTimeMillis()
        )

        val id = database.sessionDao().insertSynchronous(entity)
        if (id > -1) {
            context.contentResolver.notifyChange(uri, null)
            return ContentUris.withAppendedId(uri, id)
        }
        return null
    }

    override fun delete(uri: Uri, selection: String?, selectionArgs: Array<out String>?): Int {
        val count = when (uriMatcher.match(uri)) {
            CODE_ITEM -> {
                val id = ContentUris.parseId(uri)
                database.sessionDao().deleteByIdSynchronous(id)
            }
            else -> throw IllegalArgumentException("Unknown or unsupported deletion URI: $uri")
        }
        if (count > 0) {
            context?.contentResolver?.notifyChange(uri, null)
        }
        return count
    }

    override fun update(uri: Uri, values: ContentValues?, selection: String?, selectionArgs: Array<out String>?): Int {
        // update operation not required for this coursework spec
        return 0
    }

    override fun getType(uri: Uri): String {
        return when (uriMatcher.match(uri)) {
            CODE_DIR -> "vnd.android.cursor.dir/$AUTHORITY.sessions"
            CODE_ITEM -> "vnd.android.cursor.item/$AUTHORITY.sessions"
            else -> throw IllegalArgumentException("Unknown URI type: $uri")
        }
    }
}
