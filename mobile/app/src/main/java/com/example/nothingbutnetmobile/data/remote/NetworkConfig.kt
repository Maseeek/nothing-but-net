package com.example.nothingbutnetmobile.data.remote

object NetworkConfig {
    // true for render prod, false for local
    const val IS_PRODUCTION = true

    // auth server
    private const val AUTH_BASE_URL_PROD = "https://nothing-but-net.onrender.com/"
    private const val AUTH_BASE_URL_LOCAL = "http://10.0.2.2:3000/"

    // cv server
    private const val CV_BASE_URL_PROD = "https://nothing-but-net-cv.onrender.com/"
    private const val CV_BASE_URL_LOCAL = "http://10.0.2.2:5001/"

    val AUTH_BASE_URL = if (IS_PRODUCTION) AUTH_BASE_URL_PROD else AUTH_BASE_URL_LOCAL
    val CV_BASE_URL = if (IS_PRODUCTION) CV_BASE_URL_PROD else CV_BASE_URL_LOCAL
}
