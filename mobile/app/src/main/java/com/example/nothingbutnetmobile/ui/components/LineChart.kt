package com.example.nothingbutnetmobile.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun LineChart(
    data: List<Float>,
    labels: List<String> = emptyList(),
    modifier: Modifier = Modifier
) {
    val defaultData = if (data.isEmpty()) listOf(20f, 40f, 30f, 50f, 45f) else data
    val defaultLabels = if (data.isEmpty()) listOf("S1", "S2", "S3", "S4", "S5") else labels
    val maxVal = 100f
    val primaryColor = MaterialTheme.colorScheme.primary
    val backgroundColor = MaterialTheme.colorScheme.background
    val gridColor = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.15f)
    val textColor = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
    
    val textMeasurer = rememberTextMeasurer()
    val labelStyle = MaterialTheme.typography.labelSmall.copy(
        fontSize = 9.sp,
        color = textColor
    )
    
    Canvas(
        modifier = modifier
            .fillMaxSize()
            .padding(8.dp)
    ) {
        val width = size.width
        val height = size.height
        
        val paddingLeft = 40.dp.toPx() // extra space on left for double digit labels like 100%
        val paddingRight = 12.dp.toPx()
        val paddingTop = 12.dp.toPx()
        val paddingBottom = 24.dp.toPx() // padding bottom to clear the date labels
        
        val chartWidth = width - paddingLeft - paddingRight
        val chartHeight = height - paddingTop - paddingBottom
        
        val stepX = chartWidth / (defaultData.size - 1).coerceAtLeast(1)
        
        // draw grid and y-axis labels
        val lines = 5
        val stepY = chartHeight / lines
        for (i in 0..lines) {
            val y = paddingTop + i * stepY
            drawLine(
                color = gridColor,
                start = Offset(paddingLeft, y),
                end = Offset(width - paddingRight, y),
                strokeWidth = 1.dp.toPx()
            )
            
            val percentVal = 100 - i * (100 / lines)
            val labelText = "$percentVal%"
            val textLayoutResult = textMeasurer.measure(
                text = labelText,
                style = labelStyle
            )
            // offset the y-axis labels to the left of the grid line
            val textWidth = textLayoutResult.size.width
            val textHeight = textLayoutResult.size.height
            drawText(
                textMeasurer = textMeasurer,
                text = labelText,
                style = labelStyle,
                topLeft = Offset(
                    x = paddingLeft - textWidth - 6.dp.toPx(),
                    y = y - textHeight / 2
                )
            )
        }
        
        val path = Path()
        defaultData.forEachIndexed { index, value ->
            val x = paddingLeft + index * stepX
            val y = paddingTop + chartHeight - ((value / maxVal) * chartHeight)
            
            if (index == 0) {
                path.moveTo(x, y)
            } else {
                path.lineTo(x, y)
            }
        }
        
        drawPath(
            path = path,
            color = primaryColor,
            style = Stroke(width = 3.dp.toPx(), cap = StrokeCap.Round)
        )
        
        defaultData.forEachIndexed { index, value ->
            val x = paddingLeft + index * stepX
            val y = paddingTop + chartHeight - ((value / maxVal) * chartHeight)
            
            drawCircle(
                color = primaryColor,
                radius = 5.dp.toPx(),
                center = Offset(x, y)
            )
            drawCircle(
                color = backgroundColor,
                radius = 3.dp.toPx(),
                center = Offset(x, y)
            )
            
            if (index < defaultLabels.size) {
                val labelText = defaultLabels[index]
                val textLayoutResult = textMeasurer.measure(
                    text = labelText,
                    style = labelStyle
                )
                val textWidth = textLayoutResult.size.width
                val textHeight = textLayoutResult.size.height
                drawText(
                    textMeasurer = textMeasurer,
                    text = labelText,
                    style = labelStyle,
                    topLeft = Offset(
                        x = x - textWidth / 2,
                        y = paddingTop + chartHeight + 4.dp.toPx()
                    )
                )
            }
        }
    }
}
