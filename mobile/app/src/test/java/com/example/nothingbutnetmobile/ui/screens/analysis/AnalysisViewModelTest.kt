package com.example.nothingbutnetmobile.ui.screens.analysis

import com.example.nothingbutnetmobile.MainDispatcherRule
import com.example.nothingbutnetmobile.data.local.PreferenceManager
import com.example.nothingbutnetmobile.data.remote.models.AnalysisResult
import com.example.nothingbutnetmobile.data.remote.models.AnalysisResponse
import com.example.nothingbutnetmobile.domain.model.Session
import com.example.nothingbutnetmobile.domain.model.User
import com.example.nothingbutnetmobile.domain.repository.AuthRepository
import com.example.nothingbutnetmobile.domain.repository.CVRepository
import com.example.nothingbutnetmobile.domain.repository.StatsRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.map
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.mockito.Mockito.mock
import org.mockito.kotlin.whenever
import java.io.File

class AnalysisViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val fakeAuthRepository = FakeAuthRepository()
    private val fakeCVRepository = FakeCVRepository()
    private val fakeStatsRepository = FakeStatsRepository()
    private val mockPreferenceManager = mock<PreferenceManager>().apply {
        whenever(getTargetAngle()).thenReturn(55f)
        whenever(getShowShotAngles()).thenReturn(true)
    }

    @Test
    fun `init sets userName and targetAngle from preferences`() {
        // given
        fakeAuthRepository.currentUser = User("stephen_curry")

        // when
        val viewModel = AnalysisViewModel(
            fakeAuthRepository,
            fakeCVRepository,
            fakeStatsRepository,
            mockPreferenceManager
        )

        // then
        assertEquals("stephen_curry", viewModel.uiState.value.userName)
        assertEquals(55f, viewModel.uiState.value.targetAngle)
        assertEquals(AnalysisStatus.IDLE, viewModel.uiState.value.status)
    }

    @Test
    fun `setHoopLeft updates state and changes status to SELECTING_RIGHT`() {
        val viewModel = AnalysisViewModel(fakeAuthRepository, fakeCVRepository, fakeStatsRepository, mockPreferenceManager)

        // when
        viewModel.setHoopLeft(10, 20, 0.1f, 0.2f)

        // then
        val state = viewModel.uiState.value
        assertEquals(listOf(10, 20), state.hoopLeft)
        assertEquals(Pair(0.1f, 0.2f), state.hoopLeftNormalized)
        assertEquals(AnalysisStatus.SELECTING_RIGHT, state.status)
    }

    @Test
    fun `setHoopRight updates state and changes status to READY`() {
        val viewModel = AnalysisViewModel(fakeAuthRepository, fakeCVRepository, fakeStatsRepository, mockPreferenceManager)

        // when
        viewModel.setHoopRight(40, 50, 0.4f, 0.5f)

        // then
        val state = viewModel.uiState.value
        assertEquals(listOf(40, 50), state.hoopRight)
        assertEquals(Pair(0.4f, 0.5f), state.hoopRightNormalized)
        assertEquals(AnalysisStatus.READY, state.status)
    }

    @Test
    fun `startSelection resets hoop coordinates and sets status to SELECTING_LEFT`() {
        val viewModel = AnalysisViewModel(fakeAuthRepository, fakeCVRepository, fakeStatsRepository, mockPreferenceManager)
        viewModel.setHoopLeft(10, 20, 0.1f, 0.2f)
        viewModel.setHoopRight(40, 50, 0.4f, 0.5f)

        // when
        viewModel.startSelection()

        // then
        val state = viewModel.uiState.value
        assertNull(state.hoopLeft)
        assertNull(state.hoopRight)
        assertNull(state.hoopLeftNormalized)
        assertNull(state.hoopRightNormalized)
        assertEquals(AnalysisStatus.SELECTING_LEFT, state.status)
    }

    @Test
    fun `resetStatus transitions status to IDLE and clears errors`() {
        val viewModel = AnalysisViewModel(fakeAuthRepository, fakeCVRepository, fakeStatsRepository, mockPreferenceManager)
        
        // mock error state or select right to transition
        viewModel.setHoopLeft(10, 20, 0.1f, 0.2f)

        // when
        viewModel.resetStatus()

        // then
        val state = viewModel.uiState.value
        assertEquals(AnalysisStatus.IDLE, state.status)
        assertNull(state.errorMessage)
    }

    @Test
    fun `startAnalysis returns validation error if video file is too large`() {
        val viewModel = AnalysisViewModel(fakeAuthRepository, fakeCVRepository, fakeStatsRepository, mockPreferenceManager)
        
        // given: mocked file > 50mb
        val largeFile = mock<File>().apply {
            whenever(length()).thenReturn(51L * 1024 * 1024)
        }

        // when
        viewModel.startAnalysis(largeFile)

        // then
        val state = viewModel.uiState.value
        assertEquals(AnalysisStatus.ERROR, state.status)
        assertTrue(state.errorMessage?.contains("Video is too large") == true)
        assertFalse(fakeCVRepository.analyzeVideoCalled)
    }

    @Test
    fun `startAnalysis parses successful response and deletes temporary file`() {
        val viewModel = AnalysisViewModel(fakeAuthRepository, fakeCVRepository, fakeStatsRepository, mockPreferenceManager)
        
        // create actual temp file to verify deletion
        val tempFile = File.createTempFile("test_video_upload", ".mp4").apply {
            writeText("dummy content")
        }
        assertTrue(tempFile.exists())

        // mock cv response data
        val analysisResult = AnalysisResult(
            makes = 3,
            misses = 2,
            totalShots = 5,
            fgPercentage = 60.0,
            longestStreak = 2,
            averageAngle = 54.5,
            averageMakeAngle = 55.0,
            averageMissAngle = 53.5,
            shotAngles = listOf(54.0, 56.0, 53.5, 55.0, 54.0),
            shotsResults = listOf(1, 1, 0, 1, 0)
        )
        fakeCVRepository.resultToReturn = Result.success(
            AnalysisResponse(success = true, data = analysisResult, error = null)
        )

        // when
        viewModel.startAnalysis(tempFile)

        // then
        val state = viewModel.uiState.value
        assertEquals(AnalysisStatus.SUCCESS, state.status)
        assertTrue(state.analysisResult?.contains("3/5 Shots Made") == true)
        assertEquals(3, state.selectedSession?.makes)
        assertEquals(2, state.selectedSession?.misses)
        assertEquals(5, state.selectedSession?.totalShots)
        assertEquals(2, state.selectedSession?.longestStreak)

        // verify temp file was deleted
        assertFalse(tempFile.exists())
    }

    @Test
    fun `startAnalysis handles failure response and sets error message`() {
        val viewModel = AnalysisViewModel(fakeAuthRepository, fakeCVRepository, fakeStatsRepository, mockPreferenceManager)
        val tempFile = File.createTempFile("test_video_fail", ".mp4")
        
        fakeCVRepository.resultToReturn = Result.failure(Exception("Upload Failed"))

        // when
        viewModel.startAnalysis(tempFile)

        // then
        val state = viewModel.uiState.value
        assertEquals(AnalysisStatus.ERROR, state.status)
        assertEquals("Upload Failed", state.errorMessage)
        
        // verify temp file is deleted on failure
        assertFalse(tempFile.exists())
    }

    private class FakeAuthRepository : AuthRepository {
        var currentUser: User? = User("test_user")
        var loggedIn = true
        
        override suspend fun login(username: String, password: String) = Result.success(Unit)
        override suspend fun register(username: String, email: String, password: String) = Result.success("123")
        override fun isLoggedIn() = loggedIn
        override fun getUser() = currentUser
        override suspend fun getUserId() = "123"
        override fun logout() { loggedIn = false }
    }

    private class FakeCVRepository : CVRepository {
        var resultToReturn: Result<AnalysisResponse> = Result.failure(Exception("Not initialized"))
        var analyzeVideoCalled = false

        override suspend fun analyzeVideo(
            videoFile: File,
            hoopLeft: List<Int>,
            hoopRight: List<Int>,
            showAngle: Boolean,
            targetAngle: Float
        ): Result<AnalysisResponse> {
            analyzeVideoCalled = true
            return resultToReturn
        }
    }

    private class FakeStatsRepository : StatsRepository {
        private val sessionsFlow = MutableStateFlow<List<Session>>(emptyList())
        var savedSession: Session? = null

        override fun getLatestSession(): Flow<Session?> = sessionsFlow.map { it.maxByOrNull { s -> s.timestamp } }
        override fun getAllSessions(): Flow<List<Session>> = sessionsFlow
        override suspend fun getSessionById(id: Long): Session? = sessionsFlow.value.find { it.id == id }
        override suspend fun saveSession(session: Session) {
            savedSession = session
            sessionsFlow.value = sessionsFlow.value + session
        }
        override suspend fun seedDatabase() {}
        override suspend fun clearAll() { sessionsFlow.value = emptyList() }
        override suspend fun syncWithServer(): Result<Unit> = Result.success(Unit)
        override suspend fun pushSessionToServer(session: Session): Result<Unit> = Result.success(Unit)
    }
}
