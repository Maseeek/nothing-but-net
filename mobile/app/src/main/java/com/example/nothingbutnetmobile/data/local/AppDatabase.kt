package com.example.nothingbutnetmobile.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.example.nothingbutnetmobile.data.local.dao.SessionDao
import com.example.nothingbutnetmobile.data.local.entity.SessionEntity

@Database(entities = [SessionEntity::class], version = 3, exportSchema = false)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun sessionDao(): SessionDao
}
