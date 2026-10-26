package com.timetracker.app.ui.main

import android.Manifest
import android.content.Intent
import android.os.Build
import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.GravityCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.updatePadding
import androidx.lifecycle.lifecycleScope
import androidx.navigation.NavController
import androidx.navigation.fragment.NavHostFragment
import androidx.navigation.ui.AppBarConfiguration
import androidx.navigation.ui.NavigationUI
import androidx.navigation.ui.navigateUp
import androidx.navigation.ui.setupActionBarWithNavController
import androidx.navigation.ui.setupWithNavController
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.timetracker.app.R
import com.timetracker.app.appContainer
import com.timetracker.app.databinding.ActivityMainBinding
import com.timetracker.app.databinding.NavHeaderBinding
import com.timetracker.app.ui.auth.LoginActivity
import com.timetracker.app.ui.common.collectWhenStarted
import com.timetracker.app.ui.common.levelTitleRes
import kotlinx.coroutines.launch

/**
 * Hosts every page of the app. The bottom bar switches between the stopwatch, tasks and report;
 * the side drawer gives access to all pages plus settings and logout.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var navController: NavController
    private lateinit var appBarConfiguration: AppBarConfiguration

    private val requestNotificationPermission =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val userId = appContainer.preferences.currentUserId
        if (userId == null) {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
            return
        }
        enableEdgeToEdge()
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        setSupportActionBar(binding.toolbar)
        applyWindowInsets()

        val navHost = supportFragmentManager.findFragmentById(R.id.navHostFragment) as NavHostFragment
        navController = navHost.navController
        appBarConfiguration = AppBarConfiguration(TOP_LEVEL_DESTINATIONS, binding.drawerLayout)
        setupActionBarWithNavController(navController, appBarConfiguration)
        binding.bottomNav.setupWithNavController(navController)
        binding.navView.setupWithNavController(navController)
        binding.navView.setNavigationItemSelectedListener { item ->
            if (item.itemId == R.id.action_logout) {
                binding.drawerLayout.closeDrawer(GravityCompat.START)
                confirmLogout()
                true
            } else {
                val handled = NavigationUI.onNavDestinationSelected(item, navController)
                if (handled) binding.drawerLayout.closeDrawer(GravityCompat.START)
                handled
            }
        }

        bindDrawerHeader(userId)
        askForNotificationPermission()
        if (savedInstanceState == null) openDestinationFrom(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        openDestinationFrom(intent)
    }

    override fun onSupportNavigateUp(): Boolean =
        navController.navigateUp(appBarConfiguration) || super.onSupportNavigateUp()

    fun confirmLogout() {
        MaterialAlertDialogBuilder(this)
            .setTitle(R.string.logout_title)
            .setMessage(R.string.logout_message)
            .setPositiveButton(R.string.action_logout) { _, _ -> logout() }
            .setNegativeButton(R.string.action_cancel, null)
            .show()
    }

    private fun logout() {
        val container = appContainer
        val userId = container.preferences.currentUserId
        lifecycleScope.launch {
            if (userId != null) container.taskRepository.cancelReminders(userId)
            container.stopwatch.stop()
            container.preferences.currentUserId = null
            val intent = Intent(this@MainActivity, LoginActivity::class.java)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
            startActivity(intent)
            finish()
        }
    }

    private fun bindDrawerHeader(userId: Long) {
        val header = NavHeaderBinding.bind(binding.navView.getHeaderView(0))
        collectWhenStarted(appContainer.authRepository.observeUser(userId)) { user ->
            header.userName.text = user?.name.orEmpty()
            header.userInitial.text = user?.name?.firstOrNull()?.uppercase().orEmpty()
        }
        collectWhenStarted(appContainer.statsRepository.observeLevel(userId)) { level ->
            header.userLevel.text = getString(
                R.string.drawer_level,
                level.level,
                getString(level.title.levelTitleRes()),
                level.totalXp,
            )
        }
    }

    /** Lets notifications open a specific page, e.g. a task reminder opens the task list. */
    private fun openDestinationFrom(intent: Intent?) {
        val destination = intent?.getIntExtra(EXTRA_DESTINATION, 0) ?: 0
        if (destination != 0 && destination in TOP_LEVEL_DESTINATIONS &&
            navController.currentDestination?.id != destination
        ) {
            val bottomItem = binding.bottomNav.menu.findItem(destination)
            if (bottomItem != null) {
                NavigationUI.onNavDestinationSelected(bottomItem, navController)
            } else {
                navController.navigate(destination)
            }
        }
    }

    private fun askForNotificationPermission() {
        val preferences = appContainer.preferences
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && !preferences.notificationPermissionAsked) {
            preferences.notificationPermissionAsked = true
            requestNotificationPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }

    /** The app draws behind the system bars; pad the toolbar and content so nothing is hidden. */
    private fun applyWindowInsets() {
        ViewCompat.setOnApplyWindowInsetsListener(binding.appBar) { view, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout())
            view.updatePadding(left = bars.left, top = bars.top, right = bars.right)
            insets
        }
        ViewCompat.setOnApplyWindowInsetsListener(binding.navHostFragment) { view, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout())
            view.updatePadding(left = bars.left, right = bars.right)
            insets
        }
    }

    companion object {
        const val EXTRA_DESTINATION = "extra_destination"

        private val TOP_LEVEL_DESTINATIONS = setOf(
            R.id.timeTrackerFragment,
            R.id.taskFragment,
            R.id.reportFragment,
            R.id.habitFragment,
            R.id.exerciseFragment,
            R.id.sleepFragment,
            R.id.settingsFragment,
        )
    }
}
