# Time Manager (Android, Kotlin)

An all-in-one Android app that shows how you actually spend your time. It is built on the
[Time Management App](https://github.com/Soham908/Time_Management_App) idea and covers all six features
from that README, plus its three planned improvements:

| Feature | Where | What it does |
| --- | --- | --- |
| Time tracking | Timer tab | Start/stop a timer per category (Work, Study, Exercise, ...), with today's entries and total |
| To-do list | Tasks tab | Tasks with priority, optional due date, overdue highlighting, and a completed section |
| Habit tracking | Habits tab | Daily habits with check-ins, current streak and best streak |
| Exercise routines | Exercise tab | Routines of exercises (sets x reps), logged workouts with duration |
| Weekly report | Report tab | Time per day and per category, tasks done, habit completion, workouts and XP for any week |
| Gamified habits | Habits tab | Each habit is split into small steps; steps, finished habits, tasks and workouts earn XP and levels |

The UI is written in **Jetpack Compose** (the "Improve UI" item), and data is stored on the device with **Room**,
so the app works offline with no account or setup.

## Requirements

- Android Studio (Meerkat or newer) with JDK 17+
- Android SDK 35
- A device or emulator running Android 8.0 (API 26) or newer

## Run it

1. In Android Studio, choose **File > Open** and select this `time-management-app` folder.
2. Let Gradle sync. It downloads the Android Gradle plugin and AndroidX libraries.
3. Select the `app` run configuration and press **Run**.

From the command line:

```bash
./gradlew :core:test        # unit tests for the report, streak, XP and parsing logic
./gradlew :app:assembleDebug # builds app/build/outputs/apk/debug/app-debug.apk
```

## Project layout

```
time-management-app/
├── core/   Plain Kotlin (no Android): models and the logic worth testing
│   ├── model/          TimeEntry, TaskItem, Habit, HabitStep, Routine, WorkoutSession, ...
│   ├── time/           duration formatting, week start, splitting time entries across days
│   ├── habit/          daily progress, completed days, current and best streaks
│   ├── gamification/   XP rules and levels
│   ├── exercise/       parses "Push-ups 3x12" lines into exercises
│   └── report/         WeeklyReportCalculator
└── app/    Android app
    ├── data/local/     Room entities, DAOs and AppDatabase
    ├── data/           repositories (Flow-based) and clock helpers
    └── ui/             one package per tab: Screen (Compose) + ViewModel (StateFlow)
```

Dependencies are wired by hand in `AppContainer` (no DI framework). Each ViewModel combines repository
`Flow`s into a single UI state, and the weekly report and XP are computed by the `core` module.

## How XP works

| Action | XP |
| --- | --- |
| Check off a habit step | +10 |
| Finish every step of a habit for the day | +20 bonus |
| Complete a task | +15 |
| Log a workout | +30 |

Going from level *n* to *n + 1* takes `100 × n` XP (100 for level 2, 200 more for level 3, ...). XP is
recalculated from your history, so unchecking a step or deleting a habit removes the XP it earned.

## Next steps

- Cloud sync and sign-in with Firebase (add `google-services.json` and the Firebase BoM, then sync the
  Room data to Firestore).
- Reminders for habits and due tasks with WorkManager notifications.
- Editing existing tasks, habits and routines (today they can be added and deleted).
