package com.timemanager.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.timemanager.app.ui.TimeManagerApp
import com.timemanager.app.ui.theme.TimeManagerTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            TimeManagerTheme {
                TimeManagerApp()
            }
        }
    }
}
