package com.example.nothingbutnetmobile.ui.screens.analysis

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nothingbutnetmobile.domain.repository.AuthRepository
import com.example.nothingbutnetmobile.domain.repository.CVRepository
import com.example.nothingbutnetmobile.domain.repository.StatsRepository
import com.example.nothingbutnetmobile.domain.model.Session
import com.example.nothingbutnetmobile.domain.model.calculateLongestStreak
import com.example.nothingbutnetmobile.data.local.PreferenceManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.launch
import java.io.File
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.Date
import javax.inject.Inject

enum class AnalysisStatus {
    IDLE, SELECTING_LEFT, SELECTING_RIGHT, READY, LOADING, SUCCESS, ERROR
}

@HiltViewModel
class AnalysisViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val cvRepository: CVRepository,
    private val statsRepository: StatsRepository,
    private val preferenceManager: PreferenceManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(AnalysisUiState())
    val uiState: StateFlow<AnalysisUiState> = _uiState.asStateFlow()

    init {
        val user = authRepository.getUser()
        _uiState.value = _uiState.value.copy(
            userName = user?.username ?: "User",
            targetAngle = preferenceManager.getTargetAngle()
        )
    }

    fun setHoopLeft(x: Int, y: Int, normX: Float, normY: Float) {
        _uiState.value = _uiState.value.copy(
            hoopLeft = listOf(x, y),
            hoopLeftNormalized = Pair(normX, normY),
            status = AnalysisStatus.SELECTING_RIGHT
        )
    }

    fun setHoopRight(x: Int, y: Int, normX: Float, normY: Float) {
        _uiState.value = _uiState.value.copy(
            hoopRight = listOf(x, y),
            hoopRightNormalized = Pair(normX, normY),
            status = AnalysisStatus.READY
        )
    }

    fun confirmAnalysis(videoFile: File) {
        startAnalysis(videoFile)
    }

    fun startSelection() {
        _uiState.value = _uiState.value.copy(
            status = AnalysisStatus.SELECTING_LEFT,
            hoopLeft = null,
            hoopRight = null,
            hoopLeftNormalized = null,
            hoopRightNormalized = null
        )
    }

    fun startAnalysis(videoFile: File) {
        val currentLeft = _uiState.value.hoopLeft ?: listOf(100, 100)
        val currentRight = _uiState.value.hoopRight ?: listOf(200, 200)

        // check file size (50mb limit)
        val fileSizeMb = videoFile.length() / (1024 * 1024)
        if (fileSizeMb > 50) {
            _uiState.value = _uiState.value.copy(
                status = AnalysisStatus.ERROR,
                errorMessage = "Video is too large ($fileSizeMb MB). Please record a shorter video (under 50MB) for analysis."
            )
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(status = AnalysisStatus.LOADING)
            
            val result = cvRepository.analyzeVideo(
                videoFile = videoFile,
                hoopLeft = currentLeft,
                hoopRight = currentRight,
                showAngle = preferenceManager.getShowShotAngles(),
                targetAngle = preferenceManager.getTargetAngle()
            )

            result.onSuccess { response ->
                val data = response.data
                if (data != null) {
                    val results = data.shotsResults ?: emptyList()
                    val angles = data.shotAngles ?: emptyList()
                    
                    val rawMakeAngle = data.averageMakeAngle ?: 0.0
                    val rawMissAngle = data.averageMissAngle ?: 0.0
                    val computedMakeAngle = if (rawMakeAngle > 0.0) rawMakeAngle else com.example.nothingbutnetmobile.domain.model.calculateAverageMakeAngle(angles, results)
                    val computedMissAngle = if (rawMissAngle > 0.0) rawMissAngle else com.example.nothingbutnetmobile.domain.model.calculateAverageMissAngle(angles, results)

                    val newAnalysis = Session(
                        totalShots = if (data.totalShots > 0) data.totalShots else (data.makes + data.misses),
                        makes = data.makes,
                        misses = data.misses,
                        fgPercentage = data.fgPercentage,
                        longestStreak = if (data.longestStreak > 0) data.longestStreak else calculateLongestStreak(results),
                        averageAngle = data.averageAngle,
                        averageMakeAngle = computedMakeAngle,
                        averageMissAngle = computedMissAngle,
                        shotAngles = angles,
                        shotsResults = results,
                        timestamp = System.currentTimeMillis()
                    )
                    
                    viewModelScope.launch {
                        val allAnalyses = statsRepository.getAllSessions().firstOrNull() ?: emptyList()
                        val sortedLast5 = allAnalyses.sortedBy { it.timestamp }.takeLast(5)
                        val history = sortedLast5.map { it.fgPercentage.toFloat() }
                        val sdf = SimpleDateFormat("d MMM", Locale.getDefault())
                        val historyDates = sortedLast5.map { sdf.format(Date(it.timestamp)) }

                        _uiState.value = _uiState.value.copy(
                            status = AnalysisStatus.SUCCESS,
                            selectedSession = newAnalysis,
                            recentSessions = allAnalyses.take(5),
                            fgHistory = history,
                            fgHistoryDates = historyDates,
                            analysisResult = "Analysis Complete: ${data.makes}/${data.totalShots} Shots Made",
                            shotAngles = angles,
                            shotsResults = results
                        )
                    }
                } else {
                    _uiState.value = _uiState.value.copy(
                        status = AnalysisStatus.ERROR,
                        errorMessage = "Server returned empty analysis data."
                    )
                }
            }.onFailure { error ->
                val errorMsg = error.message ?: "Unknown error occurred"
                val displayMsg = if (errorMsg.contains("502")) {
                    "Server is overloaded or video is too complex. Please try a shorter video."
                } else {
                    errorMsg
                }
                _uiState.value = _uiState.value.copy(
                    status = AnalysisStatus.ERROR,
                    errorMessage = displayMsg
                )
            }
            
            // delete temp file
            try {
                if (videoFile.exists()) {
                    videoFile.delete()
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    fun loadLatestAnalysis() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(status = AnalysisStatus.LOADING)
            
            // load cache first for offline access
            val cachedAnalyses = statsRepository.getAllSessions().firstOrNull() ?: emptyList()
            if (cachedAnalyses.isNotEmpty()) {
                updateLatestState(cachedAnalyses)
            }

            // sync with server
            val syncResult = statsRepository.syncWithServer()
            if (syncResult.isSuccess) {
                val updatedAnalyses = statsRepository.getAllSessions().firstOrNull() ?: emptyList()
                updateLatestState(updatedAnalyses)
            } else if (cachedAnalyses.isEmpty()) {
                // only show error if no cached data
                _uiState.value = _uiState.value.copy(
                    status = AnalysisStatus.ERROR,
                    errorMessage = "Connection Error: Could not reach the server to fetch latest data."
                )
            }
        }
    }

    private fun updateLatestState(allAnalyses: List<Session>) {
        val now = System.currentTimeMillis()
        val todaySessions = allAnalyses.filter { isSameDay(it.timestamp, now) }
        
        val selected = todaySessions.firstOrNull() ?: allAnalyses.firstOrNull()
        
        if (selected != null) {
            val processedSelected = if (selected.longestStreak == 0 && selected.shotsResults.isNotEmpty()) {
                selected.copy(longestStreak = calculateLongestStreak(selected.shotsResults))
            } else {
                selected
            }
            
            val sortedLast5 = allAnalyses.sortedBy { it.timestamp }.takeLast(5)
            val history = sortedLast5.map { it.fgPercentage.toFloat() }
            val sdf = SimpleDateFormat("d MMM", Locale.getDefault())
            val historyDates = sortedLast5.map { sdf.format(Date(it.timestamp)) }

            _uiState.value = _uiState.value.copy(
                status = AnalysisStatus.SUCCESS,
                selectedSession = processedSelected,
                recentSessions = allAnalyses.take(5),
                fgHistory = history,
                fgHistoryDates = historyDates,
                analysisResult = "Latest Session: ${processedSelected.makes}/${processedSelected.totalShots} Shots Made",
                shotAngles = processedSelected.shotAngles,
                shotsResults = processedSelected.shotsResults
            )
        } else {
            _uiState.value = _uiState.value.copy(
                status = AnalysisStatus.IDLE,
                analysisResult = "No sessions found. Start by analyzing a video!"
            )
        }
    }

    fun loadSpecificAnalysis(id: Long) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(status = AnalysisStatus.LOADING)
            
            val selected = statsRepository.getSessionById(id)
            
            if (selected != null) {
                val processedSelected = if (selected.longestStreak == 0 && selected.shotsResults.isNotEmpty()) {
                    selected.copy(longestStreak = calculateLongestStreak(selected.shotsResults))
                } else {
                    selected
                }
                
                // get recent list
                val allAnalyses = statsRepository.getAllSessions().firstOrNull() ?: emptyList()
                val sortedLast5 = allAnalyses.sortedBy { it.timestamp }.takeLast(5)
                val history = sortedLast5.map { it.fgPercentage.toFloat() }
                val sdf = SimpleDateFormat("d MMM", Locale.getDefault())
                val historyDates = sortedLast5.map { sdf.format(Date(it.timestamp)) }

                _uiState.value = _uiState.value.copy(
                    status = AnalysisStatus.SUCCESS,
                    selectedSession = processedSelected,
                    recentSessions = allAnalyses.take(5),
                    fgHistory = history,
                    fgHistoryDates = historyDates,
                    analysisResult = "Viewing Analysis: ${processedSelected.makes}/${processedSelected.totalShots} Shots Made",
                    shotAngles = processedSelected.shotAngles,
                    shotsResults = processedSelected.shotsResults
                )
            } else {
                _uiState.value = _uiState.value.copy(
                    status = AnalysisStatus.ERROR,
                    errorMessage = "Analysis session not found."
                )
            }
        }
    }

    private fun isSameDay(t1: Long, t2: Long): Boolean {
        val cal1 = java.util.Calendar.getInstance().apply { timeInMillis = t1 }
        val cal2 = java.util.Calendar.getInstance().apply { timeInMillis = t2 }
        return cal1.get(java.util.Calendar.YEAR) == cal2.get(java.util.Calendar.YEAR) &&
               cal1.get(java.util.Calendar.DAY_OF_YEAR) == cal2.get(java.util.Calendar.DAY_OF_YEAR)
    }

    fun selectAnalysis(analysis: Session) {
        val processedAnalysis = if (analysis.longestStreak == 0 && analysis.shotsResults.isNotEmpty()) {
            analysis.copy(longestStreak = calculateLongestStreak(analysis.shotsResults))
        } else {
            analysis
        }
        
        _uiState.value = _uiState.value.copy(
            selectedSession = processedAnalysis,
            shotAngles = processedAnalysis.shotAngles,
            shotsResults = processedAnalysis.shotsResults
        )
    }

    fun resetStatus() {
        _uiState.value = _uiState.value.copy(status = AnalysisStatus.IDLE, errorMessage = null)
    }
}

data class AnalysisUiState(
    val userName: String = "User",
    val status: AnalysisStatus = AnalysisStatus.IDLE,
    val analysisResult: String? = null,
    val errorMessage: String? = null,
    val hoopLeft: List<Int>? = null,
    val hoopRight: List<Int>? = null,
    val hoopLeftNormalized: Pair<Float, Float>? = null,
    val hoopRightNormalized: Pair<Float, Float>? = null,
    val shotAngles: List<Double> = emptyList(),
    val shotsResults: List<Int> = emptyList(),
    val targetAngle: Float = 55f,
    val selectedSession: Session? = null,
    val recentSessions: List<Session> = emptyList(),
    val fgHistory: List<Float> = emptyList(),
    val fgHistoryDates: List<String> = emptyList()
)
