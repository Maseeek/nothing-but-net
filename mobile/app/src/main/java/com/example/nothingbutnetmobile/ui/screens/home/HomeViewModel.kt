package com.example.nothingbutnetmobile.ui.screens.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nothingbutnetmobile.domain.repository.AuthRepository
import com.example.nothingbutnetmobile.domain.repository.StatsRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.Date
import javax.inject.Inject

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val statsRepository: StatsRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        val user = authRepository.getUser()
        _uiState.value = _uiState.value.copy(
            userName = user?.username ?: "User"
        )
        
        observeStats()
        
        viewModelScope.launch {
            statsRepository.syncWithServer()
        }
    }

    private fun observeStats() {
        statsRepository.getAllSessions()
            .onEach { sessions ->
                if (sessions.isNotEmpty()) {
                    val latestSession = sessions.maxByOrNull { it.timestamp }
                    val sortedLast5 = sessions.sortedBy { it.timestamp }.takeLast(5)
                    val history = sortedLast5.map { it.fgPercentage.toFloat() }
                    val sdf = SimpleDateFormat("d MMM", Locale.getDefault())
                    val historyDates = sortedLast5.map { sdf.format(Date(it.timestamp)) }

                    latestSession?.let { it ->
                        _uiState.value = _uiState.value.copy(
                            totalShots = it.totalShots.toString(),
                            longestStreak = it.longestStreak.toString(),
                            avgAngle = "${it.averageAngle}°",
                            fgPercentage = it.fgPercentage.toInt(),
                            fgRatio = "${it.makes}/${it.totalShots}",
                            shotAngles = it.shotAngles,
                            shotsResults = it.shotsResults,
                            averageMakeAngle = it.averageMakeAngle,
                            averageMissAngle = it.averageMissAngle,
                            fgHistory = history,
                            fgHistoryDates = historyDates
                        )
                    }
                } else {
                    _uiState.value = _uiState.value.copy(
                        totalShots = "0",
                        longestStreak = "0",
                        avgAngle = "0.0°",
                        fgPercentage = 0,
                        fgRatio = "0/0",
                        shotAngles = emptyList(),
                        shotsResults = emptyList(),
                        averageMakeAngle = 0.0,
                        averageMissAngle = 0.0,
                        fgHistory = emptyList(),
                        fgHistoryDates = emptyList()
                    )
                }
            }
            .launchIn(viewModelScope)
    }

    fun updateLoading(isLoading: Boolean) {
        _uiState.value = _uiState.value.copy(isLoading = isLoading)
    }
}

data class HomeUiState(
    val isLoading: Boolean = false,
    val title: String = "Welcome to Nothing But Net!",
    val userName: String = "User",
    val totalShots: String = "0",
    val longestStreak: String = "0",
    val avgAngle: String = "0.0°",
    val fgPercentage: Int = 0,
    val fgRatio: String = "0/0",
    val shotAngles: List<Double> = emptyList(),
    val shotsResults: List<Int> = emptyList(),
    val averageMakeAngle: Double = 0.0,
    val averageMissAngle: Double = 0.0,
    val fgHistory: List<Float> = emptyList(),
    val fgHistoryDates: List<String> = emptyList()
)
