package com.example.nothingbutnetmobile.ui.screens.analysis

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.navigation.NavController
import com.example.nothingbutnetmobile.ui.components.BottomNavigationBar
import com.example.nothingbutnetmobile.ui.components.DashboardHeader
import com.example.nothingbutnetmobile.ui.components.FgProgressionGraph
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Cancel

import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.DisposableEffect
import androidx.compose.ui.platform.LocalContext
import androidx.compose.runtime.saveable.rememberSaveable
import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import android.net.Uri
import android.util.Log
import com.example.nothingbutnetmobile.ui.utils.FileUtils
import androidx.compose.foundation.Image
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.shape.RoundedCornerShape

import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import com.example.nothingbutnetmobile.ui.utils.VideoUtils
import androidx.compose.ui.platform.LocalConfiguration
import android.content.res.Configuration
import java.io.File
import java.text.SimpleDateFormat
import java.util.*
import kotlinx.coroutines.withContext
import kotlinx.coroutines.Dispatchers
import androidx.compose.foundation.Canvas
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.Brush
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll

import androidx.compose.material.icons.filled.CloudOff
import com.example.nothingbutnetmobile.ui.theme.*
import com.example.nothingbutnetmobile.domain.model.Session
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.unit.sp

private fun Context.findActivity(): Activity? {
    var currentContext = this
    while (currentContext is ContextWrapper) {
        if (currentContext is Activity) {
            return currentContext
        }
        currentContext = currentContext.baseContext
    }
    return null
}

@Composable
fun AnalysisScreen(
    navController: NavController,
    videoUri: String? = null,
    analysisId: String? = null,
    viewModel: AnalysisViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    // todo: profile video rendering performance on physical device
    var videoFile by remember { mutableStateOf<File?>(null) }
    var videoThumbnail by remember { mutableStateOf<ImageBitmap?>(null) }
    var scale by rememberSaveable { mutableFloatStateOf(1f) }
    var offsetX by rememberSaveable { mutableFloatStateOf(0f) }
    var offsetY by rememberSaveable { mutableFloatStateOf(0f) }
 
    LaunchedEffect(videoUri, analysisId) {
        Log.d("AnalysisScreen", "LaunchedEffect: videoUri=$videoUri, analysisId=$analysisId")
        if (videoUri != null) {
            val uri = Uri.parse(videoUri)
            viewModel.startSelection()
            
            withContext(Dispatchers.IO) {
                Log.d("AnalysisScreen", "Loading video file from URI: $uri")
                videoFile = FileUtils.getFileFromUri(context, uri)
                if (videoFile == null) {
                    Log.e("AnalysisScreen", "Failed to get file from URI")
                } else {
                    Log.d("AnalysisScreen", "File loaded successfully: ${videoFile?.absolutePath}")
                }
                
                val bitmap = VideoUtils.getVideoThumbnail(context, uri)
                if (bitmap != null) {
                    videoThumbnail = bitmap.asImageBitmap()
                    Log.d("AnalysisScreen", "Thumbnail loaded successfully")
                } else {
                    Log.e("AnalysisScreen", "Failed to load thumbnail")
                }
            }
        } else if (analysisId != null) {
            Log.d("AnalysisScreen", "Loading analysis by ID: $analysisId")
            viewModel.loadSpecificAnalysis(analysisId.toLong())
        } else {
            Log.d("AnalysisScreen", "Loading latest analysis")
            viewModel.loadLatestAnalysis()
        }
    }

    // clean up video if we exit screen, but keep it if we rotate screen
    DisposableEffect(videoUri) {
        onDispose {
            val activity = context.findActivity()
            val isChangingConfigurations = activity?.isChangingConfigurations == true
            if (!isChangingConfigurations) {
                videoFile?.let {
                    if (it.exists()) {
                        it.delete()
                    }
                }
            }
        }
    }

    Scaffold(
        bottomBar = {
            BottomNavigationBar(navController = navController)
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(MaterialTheme.colorScheme.background)
                .padding(horizontal = 20.dp)
        ) {
            DashboardHeader(userName = uiState.userName)
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Text(
                text = "Shot Analysis",
                style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Black),
                color = MaterialTheme.colorScheme.onBackground
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                when (uiState.status) {
                    AnalysisStatus.IDLE -> {
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            Text(
                                text = if (videoUri == null) "Select a video to begin analysis" else "Preparing video...",
                                style = MaterialTheme.typography.bodyLarge,
                                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                            )
                        }
                    }
                    AnalysisStatus.SELECTING_LEFT, AnalysisStatus.SELECTING_RIGHT, AnalysisStatus.READY -> {
                        val configuration = LocalConfiguration.current
                        val isLandscape = configuration.orientation == Configuration.ORIENTATION_LANDSCAPE
                        val isLeft = uiState.status == AnalysisStatus.SELECTING_LEFT
                        val isRight = uiState.status == AnalysisStatus.SELECTING_RIGHT
                        val isReady = uiState.status == AnalysisStatus.READY

                        if (isLandscape) {
                            // landscape view
                            Row(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(8.dp),
                                horizontalArrangement = Arrangement.spacedBy(16.dp)
                            ) {
                                // image selection
                                Box(
                                    modifier = Modifier
                                        .weight(1.2f)
                                        .fillMaxHeight()
                                        .border(2.dp, MaterialTheme.colorScheme.primary, RoundedCornerShape(12.dp))
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(MaterialTheme.colorScheme.background),
                                    contentAlignment = Alignment.Center
                                ) {
                                    videoThumbnail?.let { bitmap ->
                                        val aspectRatio = bitmap.width.toFloat() / bitmap.height.toFloat()
                                        BoxWithConstraints(
                                            modifier = Modifier.fillMaxSize(),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            val containerWidth = maxWidth
                                            val containerHeight = maxHeight
                                            val containerRatio = containerWidth / containerHeight
                                            
                                            val finalModifier = if (containerRatio > aspectRatio) {
                                                Modifier.fillMaxHeight().aspectRatio(aspectRatio)
                                            } else {
                                                Modifier.fillMaxWidth().aspectRatio(aspectRatio)
                                            }

                                            Box(
                                                modifier = Modifier
                                                    .then(finalModifier)
                                                    .clipToBounds()
                                                    .pointerInput(Unit) {
                                                        detectTransformGestures { _, pan, zoom, _ ->
                                                            scale = (scale * zoom).coerceIn(1f, 5f)
                                                            val maxOffsetX = (size.width * (scale - 1f)) / 2f
                                                            val maxOffsetY = (size.height * (scale - 1f)) / 2f
                                                            offsetX = (offsetX + pan.x).coerceIn(-maxOffsetX, maxOffsetX)
                                                            offsetY = (offsetY + pan.y).coerceIn(-maxOffsetY, maxOffsetY)
                                                        }
                                                    }
                                                    .graphicsLayer {
                                                        scaleX = scale
                                                        scaleY = scale
                                                        translationX = offsetX
                                                        translationY = offsetY
                                                    }
                                            ) {
                                                Image(
                                                    bitmap = bitmap,
                                                    contentDescription = "Video Frame",
                                                    modifier = Modifier
                                                        .fillMaxSize()
                                                        .pointerInput(uiState.status) {
                                                            detectTapGestures { offset ->
                                                                val normX = offset.x / size.width
                                                                val normY = offset.y / size.height
                                                                
                                                                if (normX.isNaN() || normY.isNaN()) return@detectTapGestures

                                                                val x = (normX * bitmap.width).toInt()
                                                                val y = (normY * bitmap.height).toInt()
                                                                
                                                                if (isLeft) {
                                                                    viewModel.setHoopLeft(x, y, normX, normY)
                                                                } else if (isRight) {
                                                                    viewModel.setHoopRight(x, y, normX, normY)
                                                                }
                                                            }
                                                        },
                                                    contentScale = ContentScale.Fit
                                                )
                                                SelectionMarker(uiState.hoopLeftNormalized, "L", scale)
                                                SelectionMarker(uiState.hoopRightNormalized, "R", scale)
                                            }
                                        }
                                    } ?: CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
                                }

                                // controls and details
                                Column(
                                    modifier = Modifier
                                        .weight(0.8f)
                                        .fillMaxHeight(),
                                    verticalArrangement = Arrangement.Center,
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .background(MaterialTheme.colorScheme.primary, RoundedCornerShape(16.dp))
                                            .padding(horizontal = 12.dp, vertical = 6.dp)
                                    ) {
                                        Text(
                                            text = when {
                                                isLeft -> "Step 1 of 2"
                                                isRight -> "Step 2 of 2"
                                                else -> "Ready"
                                            },
                                            color = MaterialTheme.colorScheme.onPrimary,
                                            style = MaterialTheme.typography.labelMedium,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                    Spacer(modifier = Modifier.height(12.dp))
                                    Text(
                                        text = when {
                                            isLeft -> "Select left edge of hoop"
                                            isRight -> "Select right edge of hoop"
                                            else -> "Coordinates confirmed"
                                        },
                                        color = MaterialTheme.colorScheme.onPrimary,
                                        style = MaterialTheme.typography.titleSmall,
                                        fontWeight = FontWeight.Bold,
                                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                                    )
                                    Spacer(modifier = Modifier.height(24.dp))
                                    
                                    Row(
                                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        IconButton(onClick = { 
                                            scale = 1f
                                            offsetX = 0f
                                            offsetY = 0f
                                            viewModel.startSelection() 
                                        }) {
                                            Icon(Icons.Default.Refresh, contentDescription = "Reset", tint = MaterialTheme.colorScheme.onBackground)
                                        }
                                        
                                        if (isReady) {
                                            Button(
                                                onClick = { videoFile?.let { viewModel.confirmAnalysis(it) } },
                                                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                                            ) {
                                                Text("Analyze")
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            // portrait view
                            Column(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(16.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                // step indicator
                                Box(
                                    modifier = Modifier
                                        .background(MaterialTheme.colorScheme.primary, RoundedCornerShape(16.dp))
                                        .padding(horizontal = 12.dp, vertical = 6.dp)
                                ) {
                                    Text(
                                        text = when {
                                            isLeft -> "Step 1 of 2"
                                            isRight -> "Step 2 of 2"
                                            else -> "Ready to Analyze"
                                        },
                                        color = MaterialTheme.colorScheme.onPrimary,
                                        style = MaterialTheme.typography.labelMedium,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                                Spacer(modifier = Modifier.height(16.dp))
                                
                                Text(
                                    text = when {
                                        isLeft -> "Click the left edge of the basketball hoop"
                                        isRight -> "Click the right edge of the basketball hoop"
                                        else -> "Confirm hoop coordinates"
                                    },
                                    color = MaterialTheme.colorScheme.onBackground,
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                                )
                                Spacer(modifier = Modifier.height(20.dp))
                                
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .weight(1f)
                                        .border(2.dp, MaterialTheme.colorScheme.primary, RoundedCornerShape(12.dp))
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(MaterialTheme.colorScheme.background),
                                    contentAlignment = Alignment.Center
                                ) {
                                    videoThumbnail?.let { bitmap ->
                                        val aspectRatio = bitmap.width.toFloat() / bitmap.height.toFloat()
                                        BoxWithConstraints(
                                            modifier = Modifier.fillMaxSize(),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            val containerWidth = maxWidth
                                            val containerHeight = maxHeight
                                            val containerRatio = containerWidth / containerHeight
                                            
                                            val finalModifier = if (containerRatio > aspectRatio) {
                                                Modifier.fillMaxHeight().aspectRatio(aspectRatio)
                                            } else {
                                                Modifier.fillMaxWidth().aspectRatio(aspectRatio)
                                            }

                                            Box(
                                                modifier = Modifier
                                                    .then(finalModifier)
                                                    .clipToBounds()
                                                    .pointerInput(Unit) {
                                                        detectTransformGestures { _, pan, zoom, _ ->
                                                            scale = (scale * zoom).coerceIn(1f, 5f)
                                                            val maxOffsetX = (size.width * (scale - 1f)) / 2f
                                                            val maxOffsetY = (size.height * (scale - 1f)) / 2f
                                                            offsetX = (offsetX + pan.x).coerceIn(-maxOffsetX, maxOffsetX)
                                                            offsetY = (offsetY + pan.y).coerceIn(-maxOffsetY, maxOffsetY)
                                                        }
                                                    }
                                                    .graphicsLayer {
                                                        scaleX = scale
                                                        scaleY = scale
                                                        translationX = offsetX
                                                        translationY = offsetY
                                                    }
                                            ) {
                                                Image(
                                                    bitmap = bitmap,
                                                    contentDescription = "Video Frame",
                                                    modifier = Modifier
                                                        .fillMaxSize()
                                                        .pointerInput(uiState.status) {
                                                            detectTapGestures { offset ->
                                                                val normX = offset.x / size.width
                                                                val normY = offset.y / size.height
                                                                
                                                                if (normX.isNaN() || normY.isNaN()) return@detectTapGestures

                                                                val x = (normX * bitmap.width).toInt()
                                                                val y = (normY * bitmap.height).toInt()
                                                                
                                                                if (isLeft) {
                                                                    viewModel.setHoopLeft(x, y, normX, normY)
                                                                } else if (isRight) {
                                                                    viewModel.setHoopRight(x, y, normX, normY)
                                                                }
                                                            }
                                                        },
                                                    contentScale = ContentScale.Fit
                                                )
                                                SelectionMarker(uiState.hoopLeftNormalized, "L", scale)
                                                SelectionMarker(uiState.hoopRightNormalized, "R", scale)
                                            }
                                        }
                                    } ?: CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
                                }
                                
                                // bottom actions
                                Spacer(modifier = Modifier.height(16.dp))
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        IconButton(onClick = { navController.popBackStack() }) {
                                            Icon(Icons.Filled.ArrowBack, contentDescription = "Back", tint = MaterialTheme.colorScheme.onBackground)
                                        }
                                        
                                        if (isReady) {
                                            Button(
                                                onClick = { videoFile?.let { viewModel.confirmAnalysis(it) } },
                                                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                                                modifier = Modifier.padding(start = 8.dp)
                                            ) {
                                                Text("Analyze Now")
                                            }
                                        }
                                    }
                                    
                                    IconButton(onClick = { 
                                        scale = 1f
                                        offsetX = 0f
                                        offsetY = 0f
                                        viewModel.startSelection() 
                                    }) {
                                        Icon(Icons.Default.Refresh, contentDescription = "Reset Selection", tint = MaterialTheme.colorScheme.onBackground)
                                    }
                                }
                            }
                        }
                    }
                    AnalysisStatus.LOADING -> {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "Analyzing your shots...",
                                style = MaterialTheme.typography.bodyLarge,
                                color = MaterialTheme.colorScheme.onBackground
                            )
                        }
                    }
                    AnalysisStatus.SUCCESS -> {
                        val session = uiState.selectedSession
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .verticalScroll(rememberScrollState())
                                .padding(bottom = 24.dp)
                        ) {
                            if (session != null) {
                                // analytics grid
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                                ) {
                                    EfficiencyCard(
                                        percentage = session.fgPercentage,
                                        makes = session.makes,
                                        totalShots = session.totalShots ?: 0,
                                        modifier = Modifier.weight(1f)
                                    )
                                    
                                    ArcAnalysisCard(
                                        averageAngle = session.averageAngle,
                                        targetAngle = uiState.targetAngle,
                                        modifier = Modifier.weight(1f)
                                    )
                                }
                                
                                Spacer(modifier = Modifier.height(16.dp))
                                
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                                ) {
                                    StatCard(
                                        label = "TOTAL MAKES",
                                        value = session.makes.toString(),
                                        icon = Icons.Default.CheckCircle,
                                        modifier = Modifier.weight(1f)
                                    )
                                    StatCard(
                                        label = "MAX STREAK",
                                        value = session.longestStreak.toString(),
                                        icon = Icons.Default.LocalFireDepartment,
                                        modifier = Modifier.weight(1f)
                                    )
                                }
                                
                                Spacer(modifier = Modifier.height(16.dp))
                                
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                                ) {
                                    StatCard(
                                        label = "MAKE ANGLE",
                                        value = if (session.averageMakeAngle > 0) String.format("%.1f°", session.averageMakeAngle) else "--",
                                        icon = Icons.Default.CheckCircle,
                                        modifier = Modifier.weight(1f)
                                    )
                                    StatCard(
                                        label = "MISS ANGLE",
                                        value = if (session.averageMissAngle > 0) String.format("%.1f°", session.averageMissAngle) else "--",
                                        icon = Icons.Default.Cancel,
                                        modifier = Modifier.weight(1f)
                                    )
                                }
                                
                                Spacer(modifier = Modifier.height(16.dp))
                                
                                 ShotSequenceCard(results = session.shotsResults, angles = session.shotAngles)
                                
                                Spacer(modifier = Modifier.height(16.dp))
                                
                                FgProgressionGraph(
                                    fgHistory = uiState.fgHistory,
                                    fgHistoryDates = uiState.fgHistoryDates
                                )
                                
                                Spacer(modifier = Modifier.height(16.dp))
                                
                                LastSessionsCard(
                                    sessions = uiState.recentSessions,
                                    onSelect = { viewModel.selectAnalysis(it) },
                                    onViewAll = { navController.navigate("history") }
                                )
                                
                                Spacer(modifier = Modifier.height(24.dp))
                                
                                Button(
                                    onClick = { viewModel.resetStatus() },
                                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(12.dp)
                                ) {
                                    Text("Analyze New Video", fontWeight = FontWeight.Bold)
                                }
                            } else {
                                Text("No analysis data available", color = MaterialTheme.colorScheme.onBackground)
                            }
                        }
                    }
                    AnalysisStatus.ERROR -> {
                        Column(
                            modifier = Modifier.padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.CloudOff,
                                contentDescription = "Error",
                                tint = MaterialTheme.colorScheme.error,
                                modifier = Modifier.size(64.dp)
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "Connection Issue",
                                style = MaterialTheme.typography.headlineSmall,
                                color = MaterialTheme.colorScheme.onBackground
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = uiState.errorMessage ?: "Unknown error occurred",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f),
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                                modifier = Modifier.padding(horizontal = 32.dp)
                            )
                            Spacer(modifier = Modifier.height(24.dp))
                            Button(
                                onClick = { viewModel.loadLatestAnalysis() },
                                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                            ) {
                                Text("Retry Sync")
                            }
                            TextButton(onClick = { viewModel.resetStatus() }) {
                                Text("Go Back", color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f))
                            }
                        }
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}
@Composable
fun BoxScope.SelectionMarker(normalizedPos: Pair<Float, Float>?, label: String, currentScale: Float) {
    normalizedPos?.let { (nx, ny) ->
        BoxWithConstraints(modifier = Modifier.fillMaxSize()) {
            val x = maxWidth * nx.coerceIn(0f, 1f)
            val y = maxHeight * ny.coerceIn(0f, 1f)
            
            Box(
                modifier = Modifier
                    .offset(x = x - 12.dp, y = y - 12.dp)
                    .graphicsLayer {
                        // scale marker down by currentScale so it stays the same 24dp size when zoomed
                        scaleX = 1f / currentScale
                        scaleY = 1f / currentScale
                    }
                    .size(24.dp)
                    .background(MaterialTheme.colorScheme.primary, androidx.compose.foundation.shape.CircleShape)
                    .border(2.dp, MaterialTheme.colorScheme.onPrimary, androidx.compose.foundation.shape.CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = label,
                    color = MaterialTheme.colorScheme.onPrimary,
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = FontWeight.ExtraBold
                )
            }
        }
    }
}
@Composable
fun EfficiencyCard(percentage: Double, makes: Int, totalShots: Int, modifier: Modifier = Modifier) {
    val trackColor = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.08f)
    Card(
        modifier = modifier.aspectRatio(1f),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        shape = RoundedCornerShape(24.dp)
    ) {
        Box(modifier = Modifier.fillMaxSize().padding(12.dp), contentAlignment = Alignment.Center) {
            Canvas(modifier = Modifier.fillMaxSize().padding(12.dp)) {
                drawArc(
                    color = trackColor,
                    startAngle = 135f,
                    sweepAngle = 270f,
                    useCenter = false,
                    style = Stroke(width = 10.dp.toPx(), cap = StrokeCap.Round)
                )
                drawArc(
                    brush = Brush.horizontalGradient(EmberGradient),
                    startAngle = 135f,
                    sweepAngle = (270f * (percentage / 100f)).toFloat(),
                    useCenter = false,
                    style = Stroke(width = 10.dp.toPx(), cap = StrokeCap.Round)
                )
            }
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = String.format("%.1f%%", percentage),
                    style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Black),
                    color = MaterialTheme.colorScheme.onBackground
                )
                Text(
                    text = "FIELD GOAL",
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, letterSpacing = 0.5.sp),
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "$makes/$totalShots",
                    style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}

@Composable
fun ArcAnalysisCard(averageAngle: Double, targetAngle: Float, modifier: Modifier = Modifier) {
    val angleDiff = kotlin.math.abs(averageAngle - targetAngle.toDouble())
    val statusText = when {
        averageAngle == 0.0 -> "NO DATA"
        angleDiff <= 2.0 -> "PERFECT"
        angleDiff <= 5.0 -> "GOOD"
        else -> "ADJUST ARC"
    }
    val statusColor = when (statusText) {
        "PERFECT" -> SuccessGreen
        "GOOD" -> SuccessGreen.copy(alpha = 0.8f)
        "NO DATA" -> MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f)
        else -> ErrorRed
    }
    val trackColor = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.08f)

    Card(
        modifier = modifier.aspectRatio(1f),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        shape = RoundedCornerShape(24.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxSize().padding(12.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .padding(4.dp),
                contentAlignment = Alignment.Center
            ) {
                Canvas(modifier = Modifier.fillMaxSize()) {
                    drawLine(
                        color = trackColor,
                        start = Offset(0f, size.height),
                        end = Offset(size.width, size.height),
                        strokeWidth = 2.dp.toPx(),
                        pathEffect = PathEffect.dashPathEffect(floatArrayOf(6f, 6f), 0f)
                    )
                    
                    if (averageAngle > 0.0) {
                        val angleRad = Math.toRadians(averageAngle)
                        val path = Path().apply {
                            moveTo(0f, size.height)
                            val ctrlX = size.width * 0.4f
                            val ctrlY = size.height - (size.width * Math.tan(angleRad) * 0.5f).toFloat()
                            quadraticTo(
                                ctrlX, ctrlY.coerceIn(0f, size.height),
                                size.width, size.height * 0.2f
                            )
                        }
                        drawPath(
                            path = path,
                            color = statusColor,
                            style = Stroke(width = 3.dp.toPx(), cap = StrokeCap.Round)
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = if (averageAngle > 0) String.format("%.1f°", averageAngle) else "--",
                style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Black),
                color = MaterialTheme.colorScheme.onBackground
            )
            Text(
                text = "AVG SHOT ARC",
                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, letterSpacing = 0.5.sp),
                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = "Optimal: ${targetAngle.toInt()}°",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
            )
            Spacer(modifier = Modifier.height(6.dp))
            Surface(
                color = statusColor.copy(alpha = 0.15f),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text(
                    text = statusText,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Black),
                    color = statusColor
                )
            }
        }
    }
}

@Composable
fun StatCard(label: String, value: String, icon: androidx.compose.ui.graphics.vector.ImageVector, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(imageVector = icon, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f), modifier = Modifier.size(16.dp))
            Spacer(modifier = Modifier.height(8.dp))
            Text(text = label.uppercase(), style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, letterSpacing = 0.5.sp), color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f))
            Text(text = value, style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Black), color = MaterialTheme.colorScheme.onBackground)
        }
    }
}

@Composable
fun ShotSequenceCard(results: List<Int>, angles: List<Double>) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
            Text(
                text = "SHOT-BY-SHOT BREAKDOWN",
                modifier = Modifier.align(Alignment.CenterHorizontally),
                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, letterSpacing = 0.5.sp),
                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
            )
            Spacer(modifier = Modifier.height(12.dp))
            LazyRow(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp, Alignment.CenterHorizontally)
            ) {
                items(results.size) { index ->
                    val result = results[index]
                    val isMake = result == 1
                    val angle = angles.getOrNull(index)
                    val statusColor = if (isMake) SuccessGreen else ErrorRed
                    val cardBg = statusColor.copy(alpha = 0.08f)
                    val borderBg = statusColor.copy(alpha = 0.25f)
                    
                    Box(
                        modifier = Modifier
                            .width(80.dp)
                            .background(cardBg, RoundedCornerShape(12.dp))
                            .border(1.dp, borderBg, RoundedCornerShape(12.dp))
                            .padding(vertical = 8.dp, horizontal = 6.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = "SHOT #${index + 1}",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 10.sp
                                ),
                                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = if (isMake) "MAKE" else "MISS",
                                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Black),
                                color = statusColor
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = if (angle != null && angle > 0) String.format("%.1f°", angle) else "--",
                                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.onBackground
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun LastSessionsCard(
    sessions: List<Session>,
    onSelect: (Session) -> Unit,
    onViewAll: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.History, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f), modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "LAST SESSIONS",
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                    )
                }
                Text(
                    text = "VIEW PAST ANALYSES",
                    modifier = Modifier.clickable { onViewAll() },
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Black),
                    color = MaterialTheme.colorScheme.primary
                )
            }
            Spacer(modifier = Modifier.height(12.dp))
            sessions.forEach { session ->
                val sdf = SimpleDateFormat("d MMM", Locale.US)
                val dateStr = sdf.format(Date(session.timestamp))
                
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onSelect(session) }
                        .padding(vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = dateStr, color = MaterialTheme.colorScheme.onBackground, style = MaterialTheme.typography.bodyMedium)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = String.format("%.1f%% FG", session.fgPercentage),
                            color = MaterialTheme.colorScheme.onBackground,
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f), modifier = Modifier.size(14.dp))
                    }
                }
                HorizontalDivider(color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.05f))
            }
        }
    }
}
