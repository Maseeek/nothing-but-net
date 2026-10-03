package com.example.nothingbutnetmobile.data.remote

import com.example.nothingbutnetmobile.data.remote.models.AnalysisResponse
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part

interface CVApi {
    // upload video and hoop coords for analysis
    @Multipart
    @POST("upload-and-analyze")
    suspend fun uploadAndAnalyze(
        @Part video: MultipartBody.Part,
        @Part("hoopLeft") hoopLeft: RequestBody,
        @Part("hoopRight") hoopRight: RequestBody,
        @Part("showAngle") showAngle: RequestBody,
        @Part("targetAngle") targetAngle: RequestBody
    ): Response<AnalysisResponse>
}
