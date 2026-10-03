package com.example.nothingbutnetmobile.domain.repository

import com.example.nothingbutnetmobile.data.remote.models.AnalysisResponse
import java.io.File

interface CVRepository {
    // upload video for shot analysis
    suspend fun analyzeVideo(
        videoFile: File,
        hoopLeft: List<Int>,
        hoopRight: List<Int>,
        showAngle: Boolean = false,
        targetAngle: Float = 55f
    ): Result<AnalysisResponse>
}
