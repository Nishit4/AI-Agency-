package com.timetracker.app.ui.common

import androidx.annotation.StringRes
import com.timetracker.app.R
import com.timetracker.app.core.LevelTitle

@StringRes
fun LevelTitle.levelTitleRes(): Int = when (this) {
    LevelTitle.BEGINNER -> R.string.level_title_beginner
    LevelTitle.FOCUSED -> R.string.level_title_focused
    LevelTitle.ACHIEVER -> R.string.level_title_achiever
    LevelTitle.PRO -> R.string.level_title_pro
    LevelTitle.MASTER -> R.string.level_title_master
    LevelTitle.LEGEND -> R.string.level_title_legend
}
