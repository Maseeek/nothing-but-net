package com.example.nothingbutnetmobile.data.local

import android.content.Context
import android.content.SharedPreferences
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PreferenceManager @Inject constructor(@ApplicationContext context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_SHOW_SHOT_ANGLES = "show_shot_angles"
        private const val KEY_DARK_THEME = "dark_theme"
        private const val KEY_NOTIFICATIONS = "notifications_enabled"
        private const val KEY_TARGET_ANGLE = "target_angle"
    }

    fun setShowShotAngles(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_SHOW_SHOT_ANGLES, enabled).apply()
    }

    fun getShowShotAngles(): Boolean {
        return prefs.getBoolean(KEY_SHOW_SHOT_ANGLES, true)
    }

    fun setDarkTheme(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_DARK_THEME, enabled).apply()
    }

    fun getDarkTheme(): Boolean {
        return prefs.getBoolean(KEY_DARK_THEME, true)
    }

    fun setNotificationsEnabled(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_NOTIFICATIONS, enabled).apply()
    }

    fun getNotificationsEnabled(): Boolean {
        return prefs.getBoolean(KEY_NOTIFICATIONS, true)
    }

    fun setTargetAngle(angle: Float) {
        prefs.edit().putFloat(KEY_TARGET_ANGLE, angle).apply()
    }

    fun getTargetAngle(): Float {
        return prefs.getFloat(KEY_TARGET_ANGLE, 55f)
    }
}
