# Time Tracker

An all-in-one Android app for tracking **time, tasks, habits, exercise and sleep**, with a weekly report
and gamified habit progress. Built with **Kotlin** and **XML layouts** for the BCA project
"Time Tracker – An All-in-One Android Application for Tracking Time, Tasks, Habits and Exercise".

## Open and run in Android Studio

1. Open Android Studio and choose **File → Open**, then select this `TimeTracker` folder (the one that
   contains `settings.gradle.kts`).
2. Wait for the Gradle sync to finish. Android Studio downloads Gradle 8.10.2 and the libraries
   automatically, so you need an internet connection the first time.
3. Pick an emulator or a phone running Android 8.0 (API 26) or newer and press **Run ▶**.

No account, API key or `google-services.json` is needed: all data is stored on the device in a Room
(SQLite) database.

**Requirements:** Android Studio Ladybug (2024.2) or newer, using the bundled JDK 17 or 21
(*Settings → Build, Execution, Deployment → Build Tools → Gradle → Gradle JDK*). If Android Studio
offers to upgrade the Android Gradle Plugin, you can accept it.

**Tip for demos:** create an account, then open **Settings → Load sample data**. This fills the past
week with example tasks, time records, habits, workouts and sleep, so the charts are not empty.

## Features

| Report section | What the app does |
|---|---|
| 6.1 Time tracking | Stopwatch with **Start/Stop**, **Lap** and **Reset**. Each lap or stop saves a time record for the activity you typed (or picked from your tasks). Runs as a foreground service with a live notification and keeps counting if the app is closed. Records can also be added manually. |
| 6.2 To-do list and alarms | Tasks with description, priority (low/medium/high) and an optional reminder alarm. Add/edit in a bottom sheet, tick off, filter (all/pending/done), delete with undo. Alarms survive a phone restart. |
| 6.3 Habit tracking | Your own habits, each split into small parts per day (e.g. "Drink water" × 8). Progress bar per part, daily streaks. Stored in the database. |
| 6.4 Exercise and sleep | Log workouts (duration, sets, reps) with a weekly summary. Log sleep (bedtime, wake-up time, quality 1–5) with last-night and 7-day averages. |
| 6.5 Weekly report | Day or week view with ◀ ▶ navigation, summary tiles, **pie chart / bar chart switch** of time per activity, and an hours-per-day bar chart. |
| 6.6 Gamification | XP for every habit part (10), finished habit (50 bonus), completed task (20) and workout (15). XP raises your level (Beginner → Legend), shown on the habit page, drawer and settings. |
| 6.7 Accounts and settings | Sign up / login with username and password (passwords are salted and hashed with PBKDF2). Navigation drawer, bottom navigation, settings for name, password, theme (light/dark/system), notification and exact-alarm permissions, logout. |

## Technology

| Layer | Used |
|---|---|
| Language | Kotlin |
| UI | XML layouts, ViewBinding, Material Components 3, Navigation component (drawer + bottom bar) |
| Architecture | MVVM: Activities/Fragments → ViewModels (StateFlow) → Repositories → Room DAOs |
| Database | Room (SQLite) with Kotlin coroutines and Flow |
| Charts | Custom `PieChartView` and `BarChartView` drawn with Canvas |
| Background work | `StopwatchService` (foreground service), `TaskAlarmScheduler` + `TaskAlarmBroadcastReceiver` (AlarmManager), `BootReceiver` |
| Tests | JUnit unit tests for time, report, gamification, sleep and login logic; Room instrumented tests |

## Project structure

```
app/src/main/java/com/timetracker/app/
├── TimeTrackerApp.kt          Application class + AppContainer (creates the shared objects)
├── core/                      Pure Kotlin logic (unit tested): report maths, XP/levels, formatting, validation, password hashing
├── data/
│   ├── entity/Entities.kt     Room entities: User, Task, TimeLog, Habit, HabitLog, Exercise, SleepLog
│   ├── dao/Daos.kt            Database queries
│   ├── repository/            Repositories used by the ViewModels (incl. WeeklyReport)
│   ├── AppDatabase.kt         Room database
│   ├── AppPreferences.kt      Signed-in user, theme, stopwatch state
│   └── SampleDataSeeder.kt    "Load sample data" option
├── service/                   StopwatchService + StopwatchController
├── alarm/                     Task alarms and reboot handling
├── notification/              Notification channels and builders
└── ui/
    ├── auth/                  LoginActivity, SignUpActivity
    ├── main/                  MainActivity (drawer, bottom navigation)
    ├── tracker/               Stopwatch / time tracking
    ├── tasks/                 To-do list + BottomSheetToDo
    ├── habits/                Habit tracker + gamification
    ├── exercise/              Exercise log
    ├── sleep/                 Sleep log
    ├── report/                Daily / weekly report
    ├── settings/              Settings
    ├── chart/                 Pie, bar and segmented progress views
    └── common/                Shared helpers (formatting, pickers, dialogs)
```

The database follows the report's ER diagram: a user has many tasks, time logs, habits, exercises
and sleep logs; a task can have many time logs; the weekly report is calculated from the stored
records.

## Running the tests

- Unit tests: right-click `app/src/test` → **Run 'Tests in test'**, or run `./gradlew test`.
- Database tests (need an emulator or device): right-click `app/src/androidTest` → **Run**, or run
  `./gradlew connectedAndroidTest`.

## Differences from the original report

- **Room instead of Firebase.** The report lists Room for offline storage as future scope. Using it
  means the project runs immediately, with no Firebase project or `google-services.json` to set up.
- **Charts are drawn with Canvas** instead of MPAndroidChart, which is only published on JitPack.
  The pie/bar switch from the report is kept.
- The habit tracker, exercise and sleep screens and the gamification, described in the report as
  prototypes or future scope, are fully implemented and stored in the database.
