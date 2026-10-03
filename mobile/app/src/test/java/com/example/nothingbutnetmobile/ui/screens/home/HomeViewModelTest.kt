package com.example.nothingbutnetmobile.ui.screens.home

import com.example.nothingbutnetmobile.MainDispatcherRule
import com.example.nothingbutnetmobile.domain.model.Session
import com.example.nothingbutnetmobile.domain.model.User
import com.example.nothingbutnetmobile.domain.repository.AuthRepository
import com.example.nothingbutnetmobile.domain.repository.StatsRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.map
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class HomeViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val fakeAuthRepository = FakeAuthRepository()
    private val fakeStatsRepository = FakeStatsRepository()

    @Test
    fun `init sets userName from authRepository and calls sync`() {
        // given
        fakeAuthRepository.currentUser = User("lebron_james")

        // when
        val viewModel = HomeViewModel(fakeAuthRepository, fakeStatsRepository)

        // then
        assertEquals("lebron_james", viewModel.uiState.value.userName)
        assertTrue(fakeStatsRepository.syncCalled)
    }

    @Test
    fun `init handles null user gracefully`() {
        // given
        fakeAuthRepository.currentUser = null

        // when
        val viewModel = HomeViewModel(fakeAuthRepository, fakeStatsRepository)

        // then
        assertEquals("User", viewModel.uiState.value.userName)
    }

    @Test
    fun `observeStats maps empty sessions list to default UI state values`() {
        // given
        fakeStatsRepository.emit(emptyList())

        // when
        val viewModel = HomeViewModel(fakeAuthRepository, fakeStatsRepository)

        // then
        val state = viewModel.uiState.value
        assertEquals("0", state.totalShots)
        assertEquals("0", state.longestStreak)
        assertEquals("0.0°", state.avgAngle)
        assertEquals(0, state.fgPercentage)
        assertEquals("0/0", state.fgRatio)
        assertTrue(state.fgHistory.isEmpty())
        assertTrue(state.fgHistoryDates.isEmpty())
    }

    @Test
    fun `observeStats processes sessions and calculates latest stats and history`() {
        // given: 6 sessions to test takelast(5)
        val sessions = listOf(
            Session(id = 1, totalShots = 10, makes = 5, misses = 5, fgPercentage = 50.0, longestStreak = 3, averageAngle = 52.0, averageMakeAngle = 53.0, averageMissAngle = 51.0, shotAngles = listOf(50.0), shotsResults = listOf(1), timestamp = 1000L),
            Session(id = 2, totalShots = 8, makes = 6, misses = 2, fgPercentage = 75.0, longestStreak = 4, averageAngle = 54.0, averageMakeAngle = 55.0, averageMissAngle = 53.0, shotAngles = listOf(50.0), shotsResults = listOf(1), timestamp = 2000L),
            Session(id = 3, totalShots = 12, makes = 9, misses = 3, fgPercentage = 75.0, longestStreak = 5, averageAngle = 55.0, averageMakeAngle = 56.0, averageMissAngle = 54.0, shotAngles = listOf(50.0), shotsResults = listOf(1), timestamp = 3000L),
            Session(id = 4, totalShots = 10, makes = 8, misses = 2, fgPercentage = 80.0, longestStreak = 6, averageAngle = 53.0, averageMakeAngle = 54.0, averageMissAngle = 52.0, shotAngles = listOf(50.0), shotsResults = listOf(1), timestamp = 4000L),
            Session(id = 5, totalShots = 15, makes = 12, misses = 3, fgPercentage = 80.0, longestStreak = 7, averageAngle = 56.0, averageMakeAngle = 57.0, averageMissAngle = 55.0, shotAngles = listOf(50.0), shotsResults = listOf(1), timestamp = 5000L),
            Session(id = 6, totalShots = 10, makes = 9, misses = 1, fgPercentage = 90.0, longestStreak = 8, averageAngle = 58.0, averageMakeAngle = 59.0, averageMissAngle = 57.0, shotAngles = listOf(50.0), shotsResults = listOf(1), timestamp = 6000L) // latest
        )
        fakeStatsRepository.emit(sessions)

        // when
        val viewModel = HomeViewModel(fakeAuthRepository, fakeStatsRepository)

        // then
        val state = viewModel.uiState.value
        assertEquals("10", state.totalShots)
        assertEquals("8", state.longestStreak)
        assertEquals("58.0°", state.avgAngle)
        assertEquals(90, state.fgPercentage)
        assertEquals("9/10", state.fgRatio)
        
        // verify fghistory has last 5 sessions
        assertEquals(5, state.fgHistory.size)
        assertEquals(75.0f, state.fgHistory[0])
        assertEquals(75.0f, state.fgHistory[1])
        assertEquals(80.0f, state.fgHistory[2])
        assertEquals(80.0f, state.fgHistory[3])
        assertEquals(90.0f, state.fgHistory[4])

        // verify dates are parsed successfully
        assertEquals(5, state.fgHistoryDates.size)
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

    private class FakeStatsRepository : StatsRepository {
        private val sessionsFlow = MutableStateFlow<List<Session>>(emptyList())
        var syncCalled = false
        
        fun emit(sessions: List<Session>) {
            sessionsFlow.value = sessions
        }
        
        override fun getLatestSession(): Flow<Session?> = sessionsFlow.map { it.maxByOrNull { s -> s.timestamp } }
        override fun getAllSessions(): Flow<List<Session>> = sessionsFlow
        override suspend fun getSessionById(id: Long): Session? = sessionsFlow.value.find { it.id == id }
        override suspend fun saveSession(session: Session) {
            sessionsFlow.value = sessionsFlow.value + session
        }
        override suspend fun seedDatabase() {}
        override suspend fun clearAll() { sessionsFlow.value = emptyList() }
        override suspend fun syncWithServer(): Result<Unit> {
            syncCalled = true
            return Result.success(Unit)
        }
        override suspend fun pushSessionToServer(session: Session): Result<Unit> = Result.success(Unit)
    }
}
