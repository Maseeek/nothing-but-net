package com.example.nothingbutnetmobile.di

import com.example.nothingbutnetmobile.data.repository.AuthRepositoryImpl
import com.example.nothingbutnetmobile.data.repository.CVRepositoryImpl
import com.example.nothingbutnetmobile.data.repository.StatsRepositoryImpl
import com.example.nothingbutnetmobile.domain.repository.AuthRepository
import com.example.nothingbutnetmobile.domain.repository.CVRepository
import com.example.nothingbutnetmobile.domain.repository.StatsRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {

    @Binds
    @Singleton
    abstract fun bindAuthRepository(
        authRepositoryImpl: AuthRepositoryImpl
    ): AuthRepository

    @Binds
    @Singleton
    abstract fun bindCVRepository(
        cvRepositoryImpl: CVRepositoryImpl
    ): CVRepository

    @Binds
    @Singleton
    abstract fun bindStatsRepository(
        statsRepositoryImpl: StatsRepositoryImpl
    ): StatsRepository
}
