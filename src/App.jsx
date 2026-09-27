import { useEffect, useState } from "react";
import "./App.css";

const themes = [
  {
    id: "ocean",
    label: "Ocean",
    icon: "🌊",
    description: "Calm ocean blue",
  },
  {
    id: "space",
    label: "Space",
    icon: "🌌",
    description: "Explore the universe",
  },
  {
    id: "cafe",
    label: "Cafe",
    icon: "☕",
    description: "Warm coffee shop",
  },
  {
    id: "sky",
    label: "Sky",
    icon: "☁️",
    description: "Soft peaceful sky",
  },
  {
    id: "garden",
    label: "Garden",
    icon: "🌿",
    description: "Fresh green garden",
  },
  {
    id: "library",
    label: "Library",
    icon: "📚",
    description: "Quiet study library",
  },
];

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "⌂" },
  { id: "assignments", label: "Assignments", icon: "✓" },
  { id: "timetable", label: "Timetable", icon: "▣" },
  { id: "focus", label: "Focus Room", icon: "◷" },
  { id: "exam", label: "Exam Prep", icon: "◇" },
  { id: "progress", label: "Progress", icon: "↗" },
];

const initialTasks = [
  {
    id: 1,
    title: "Complete EMFT case study",
    subject: "Electromagnetic Field Theory",
    completed: true,
  },
  {
    id: 2,
    title: "Revise semiconductor concentration",
    subject: "Electronic Devices",
    completed: true,
  },
  {
    id: 3,
    title: "Prepare 8086 addressing modes poster",
    subject: "Microprocessors",
    completed: false,
  },
];

function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage failures so the app remains usable.
    }
  }, [key, value]);

  return [value, setValue];
}

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayKey() {
  return localDateKey(new Date());
}

function getStreak(studyDates) {
  const dates = new Set(studyDates);
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  let streak = 0;

  while (dates.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function formatToday() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [theme, setTheme] = usePersistentState("preppilot-theme", "ocean");
  const [showThemes, setShowThemes] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [tasks, setTasks] = usePersistentState("preppilot-tasks", initialTasks);
  const [assignments, setAssignments] = usePersistentState("preppilot-assignments", [
  {
    id: 1,
    title: "Complete EMFT case study",
    subject: "EMFT",
    deadline: "2026-09-20",
    completed: false,
  },
  {
    id: 2,
    title: "Prepare 8086 addressing modes poster",
    subject: "Microprocessors",
    deadline: "2026-09-22",
    completed: false,
  },
]);
const [assignmentTitle, setAssignmentTitle] = useState("");
const [assignmentSubject, setAssignmentSubject] = useState("");
const [assignmentDeadline, setAssignmentDeadline] = useState("");

  // Timer states
  const [timerMode, setTimerMode] = useState("focus");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
    // Timetable states
  const [timetable, setTimetable] = usePersistentState("preppilot-timetable", [
    {
      id: 1,
      subject: "Electronic Devices",
      time: "09:00",
      type: "Revision session",
    },
    {
      id: 2,
      subject: "Microprocessors",
      time: "11:30",
      type: "8086 addressing modes",
    },
    {
      id: 3,
      subject: "EMFT",
      time: "16:00",
      type: "Case study preparation",
    },
  ]);

  const [scheduleSubject, setScheduleSubject] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleType, setScheduleType] = useState("");

  // Exam preparation states
  const [exams, setExams] = usePersistentState("preppilot-exams", [
    {
      id: 1,
      subject: "Electronic Devices",
      date: "2026-10-05",
      note: "Semiconductor devices and circuits",
    },
    {
      id: 2,
      subject: "Microprocessors",
      date: "2026-10-10",
      note: "8086 architecture and programming",
    },
  ]);

  const [examSubject, setExamSubject] = useState("");
  const [examDate, setExamDate] = useState("");
  const [examNote, setExamNote] = useState("");

  // Study goal states
  const [studyGoal, setStudyGoal] = usePersistentState("preppilot-study-goal", 150);
  const [studyMinutes, setStudyMinutes] = usePersistentState("preppilot-study-minutes", 0);
  const [focusSessions, setFocusSessions] = usePersistentState("preppilot-focus-sessions", 0);
  const [studyDates, setStudyDates] = usePersistentState("preppilot-study-dates", []);
  const [focusDurationMinutes, setFocusDurationMinutes] = useState(25);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);


  // Countdown logic
  useEffect(() => {
    if (!isTimerRunning) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((currentTime) => {
        if (currentTime <= 1) {
          setIsTimerRunning(false);

          if (timerMode === "focus") {
            setFocusSessions((count) => count + 1);
            setStudyMinutes((minutes) => minutes + focusDurationMinutes);
            setStudyDates((dates) =>
              dates.includes(getTodayKey()) ? dates : [...dates, getTodayKey()]
            );
            setTimerMode("break");
            return 5 * 60;
          }

          setTimerMode("focus");
          setFocusDurationMinutes(25);
          return 25 * 60;
        }

        return currentTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerRunning, timerMode]);

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;
  const completedAssignments = assignments.filter(
  (assignment) => assignment.completed
).length;

const assignmentProgress =
  assignments.length === 0
    ? 0
    : (completedAssignments / assignments.length) * 100;

  const progress =
    tasks.length === 0
      ? 0
      : (completedTasks / tasks.length) * 100;

  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0");

  const seconds = (timeLeft % 60)
    .toString()
    .padStart(2, "0");

  const formattedTime = `${minutes}:${seconds}`;
    const studyProgress =
    studyGoal > 0
      ? Math.min(
          100,
          Math.round((studyMinutes / studyGoal) * 100)
        )
      : 0;
      

  function toggleTask(taskId) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
            }
          : task
      )
    );
  }
  function addAssignment(event) {
  event.preventDefault();

  if (
    assignmentTitle.trim() === "" ||
    assignmentSubject.trim() === "" ||
    assignmentDeadline === ""
  ) {
    alert("Please fill in all assignment details.");
    return;
  }

  const newAssignment = {
    id: Date.now(),
    title: assignmentTitle,
    subject: assignmentSubject,
    deadline: assignmentDeadline,
    completed: false,
  };

  setAssignments((currentAssignments) => [
    ...currentAssignments,
    newAssignment,
  ]);

  setAssignmentTitle("");
  setAssignmentSubject("");
  setAssignmentDeadline("");
}

function toggleAssignment(assignmentId) {
  setAssignments((currentAssignments) =>
    currentAssignments.map((assignment) =>
      assignment.id === assignmentId
        ? {
            ...assignment,
            completed: !assignment.completed,
          }
        : assignment
    )
  );
}

function deleteAssignment(assignmentId) {
  setAssignments((currentAssignments) =>
    currentAssignments.filter(
      (assignment) => assignment.id !== assignmentId
    )
  );
}
  function addSchedule(event) {
    event.preventDefault();

    if (!scheduleSubject.trim() || !scheduleTime) {
      alert("Please enter the subject and time.");
      return;
    }

    const newSchedule = {
      id: Date.now(),
      subject: scheduleSubject.trim(),
      time: scheduleTime,
      type: scheduleType.trim() || "Study session",
    };

    setTimetable((currentTimetable) => [
      ...currentTimetable,
      newSchedule,
    ]);

    setScheduleSubject("");
    setScheduleTime("");
    setScheduleType("");
  }

  function deleteSchedule(scheduleId) {
    setTimetable((currentTimetable) =>
      currentTimetable.filter((item) => item.id !== scheduleId)
    );
  }

  function addExam(event) {
    event.preventDefault();

    if (!examSubject.trim() || !examDate) {
      alert("Please enter the exam subject and date.");
      return;
    }

    const newExam = {
      id: Date.now(),
      subject: examSubject.trim(),
      date: examDate,
      note: examNote.trim() || "Exam preparation",
    };

    setExams((currentExams) => [
      ...currentExams,
      newExam,
    ]);

    setExamSubject("");
    setExamDate("");
    setExamNote("");
  }

  function deleteExam(examId) {
    setExams((currentExams) =>
      currentExams.filter((exam) => exam.id !== examId)
    );
  }

  function formatDate(dateString) {
    return new Date(`${dateString}T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  function getDaysUntil(dateString) {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(`${dateString}T00:00:00`);

    return Math.ceil(
      (targetDate - today) / 86400000
    );
  }

  function adjustStudyMinutes(amount) {
    setStudyMinutes((currentMinutes) =>
      Math.max(0, currentMinutes + amount)
    );
  }


  const studyStreak = getStreak(studyDates);
  const todayKey = getTodayKey();
  const dueAssignments = assignments.filter((assignment) => {
    if (assignment.completed) return false;
    const days = getDaysUntil(assignment.deadline);
    return days >= 0 && days <= 2;
  });
  const upcomingExams = exams.filter((exam) => getDaysUntil(exam.date) >= 0).length;

  function fallbackAiAnswer(prompt) {
    const text = prompt.toLowerCase();
    if (text.includes("quiz")) return "Sure! Pick a subject and unit, then I can generate a short practice quiz. For now, start with 5 questions: 2 concept questions, 2 application questions, and 1 numerical/problem-solving question.";
    if (text.includes("schedule") || text.includes("timetable")) return "Use your Timetable page to place difficult subjects in your highest-energy hours. Keep one focused session per subject and leave short breaks between sessions.";
    if (text.includes("exam") || text.includes("revision")) return "For exam revision, split the syllabus into small units, revise actively, solve questions without notes, and mark weak topics for a second pass.";
    if (text.includes("focus") || text.includes("study")) return "Start a 25-minute Focus Room session, choose one concrete task, keep your phone away, and take a 5-minute break when the timer ends.";
    return "I can help you plan study sessions, revise topics, create quizzes, and break assignments into smaller tasks. Try asking: 'Make me a revision plan for SSD Unit 1.'";
  }

  async function askAiAssistant(event) {
    event?.preventDefault();
    const prompt = aiPrompt.trim();
    if (!prompt || aiLoading) return;
    setAiLoading(true);
    setAiReply("");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error("AI endpoint unavailable");
      const data = await response.json();
      setAiReply(data.reply || fallbackAiAnswer(prompt));
    } catch {
      setAiReply(fallbackAiAnswer(prompt));
    } finally {
      setAiLoading(false);
    }
  }

  function resetAllData() {
    if (!window.confirm("Reset all PrepPilot data saved on this device?")) return;
    [
      "preppilot-theme", "preppilot-tasks", "preppilot-assignments",
      "preppilot-timetable", "preppilot-exams", "preppilot-study-goal",
      "preppilot-study-minutes", "preppilot-focus-sessions", "preppilot-study-dates"
    ].forEach((key) => localStorage.removeItem(key));
    window.location.reload();
  }

  function renderPageTitle() {
    const currentPage = navItems.find(
      (item) => item.id === activePage
    );

    return currentPage?.label || "Dashboard";
  }

  function selectTimerMode(mode) {
    setTimerMode(mode);
    setIsTimerRunning(false);

    if (mode === "focus") {
      setFocusDurationMinutes(25);
      setTimeLeft(25 * 60);
    } else {
      setTimeLeft(5 * 60);
    }
  }

  function selectCustomDuration(minutes) {
    setTimerMode("focus");
    setFocusDurationMinutes(minutes);
    setTimeLeft(minutes * 60);
    setIsTimerRunning(false);
  }

  function resetTimer() {
    setIsTimerRunning(false);

    if (timerMode === "focus") {
      setTimeLeft(25 * 60);
    } else {
      setTimeLeft(5 * 60);
    }
  }

  return (
    <div className={`app theme-${theme}`}>
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">✦</div>

          <div>
            <h1>PrepPilot</h1>
            <p>Your study space</p>
          </div>
        </div>

        <div className="sidebar-section-title">
          Workspace
        </div>

        <nav className="navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${
                activePage === item.id ? "active" : ""
              }`}
              onClick={() => setActivePage(item.id)}
            >
              <span className="nav-icon">
                {item.icon}
              </span>

              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* THEME SELECTOR */}
        <div className="theme-picker">
          <button
            className="theme-toggle"
            onClick={() =>
              setShowThemes((current) => !current)
            }
          >
            <span className="theme-toggle-icon">
              🎨
            </span>

            <span className="theme-toggle-text">
              Change environment
            </span>

            <span className="theme-arrow">
              {showThemes ? "⌃" : "⌄"}
            </span>
          </button>

          {showThemes && (
            <div className="theme-menu">
              <p className="theme-menu-heading">
                Choose your space
              </p>

              {themes.map((item) => (
                <button
                  key={item.id}
                  className={`theme-option ${
                    theme === item.id ? "selected" : ""
                  }`}
                  onClick={() => {
                    setTheme(item.id);
                    setShowThemes(false);
                  }}
                >
                  <span className="theme-option-icon">
                    {item.icon}
                  </span>

                  <span className="theme-option-content">
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </span>

                  {theme === item.id && (
                    <span className="theme-check">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* PROFILE */}
        <div className="sidebar-profile">
          <div className="profile-avatar">
            D
          </div>

          <div className="profile-details">
            <strong>Dheeksha</strong>
            <span>College student</span>
          </div>

          <button
            className="profile-more"
            onClick={() =>
              setShowProfile((current) => !current)
            }
          >
            ⋯
          </button>
        </div>

        {showProfile && (
          <div className="profile-popup">
            <strong>Dheeksha</strong>
            <p>Your study data is saved on this device.</p><button className="profile-reset" onClick={resetAllData}>Reset local data</button>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>PrepPilot</span>
            <b>/</b>
            <strong>{renderPageTitle()}</strong>
          </div>

          <div className="topbar-actions">
            <button
              className="notification-button"
              title="Notifications"
              onClick={() => setShowNotifications((current) => !current)}
            >
              ♧
              {(dueAssignments.length + upcomingExams) > 0 && <span className="notification-count">{dueAssignments.length + upcomingExams}</span>}
            </button>
            {showNotifications && (
              <div className="notification-panel">
                <strong>Study reminders</strong>
                {dueAssignments.length === 0 && upcomingExams === 0 ? (
                  <p>You're all caught up. 🌿</p>
                ) : (
                  <>
                    {dueAssignments.map((item) => <p key={item.id}>📝 {item.title} is due soon.</p>)}
                    {upcomingExams > 0 && <p>📚 You have {upcomingExams} upcoming exam{upcomingExams === 1 ? "" : "s"}.</p>}
                  </>
                )}
              </div>
            )}

            <button
              className="top-profile"
              onClick={() =>
                setShowProfile((current) => !current)
              }
            >
              <span className="top-avatar">
                D
              </span>

              <span>Dheeksha</span>
              <span>⌄</span>
            </button>
          </div>
        </header>

        <div className="page-content">
          {/* DASHBOARD */}
          {activePage === "dashboard" && (
            <>
              <section className="welcome-card">
                <div className="welcome-content">
                  <p className="eyebrow">
                    {formatToday()}
                  </p>

                  <h2>
                    Hey Dheeksha,
                    <br />
                    ready to focus?
                  </h2>

                  <p className="welcome-description">
                    A little progress every day adds up
                    to something amazing.
                  </p>
                </div>

                <div className="welcome-illustration">
                  <div className="sun">☀</div>
                  <div className="cloud">☁</div>
                  <div className="hill"></div>
                  <div className="sparkle">✦</div>
                </div>
              </section>

              <section className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon blue">
                    ◷
                  </div>

                  <div>
                    <p>Focus time</p>
                    <h3>{String(Math.floor(studyMinutes / 60)).padStart(2, "0")}h {String(studyMinutes % 60).padStart(2, "0")}m</h3>
                    <span>{studyGoal} min goal</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon yellow">
                    ♨
                  </div>

                  <div>
                    <p>Study streak</p>
                    <h3>{studyStreak} day{studyStreak === 1 ? "" : "s"} 🔥</h3>
                    <span>{studyStreak ? "Keep it going!" : "Start today"}</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon purple">
                    ✓
                  </div>

                  <div>
                    <p>Tasks completed</p>

                    <h3>
                      {completedTasks}/{tasks.length}
                    </h3>

                    <span>Today's progress</span>
                  </div>
                </div>
              </section>

              <section className="section-heading">
                <div>
                  <p className="eyebrow">
                    YOUR STUDY DAY
                  </p>

                  <h2>Let's make it productive</h2>
                </div>

                <span className="progress-label">
                  {Math.round(progress)}% complete
                </span>
              </section>

              <section className="dashboard-grid">
                {/* TIMETABLE CARD */}
                <div className="dashboard-card timetable-card">
                  <div className="card-heading">
                    <div>
                      <p className="eyebrow">
                        UP NEXT
                      </p>

                      <h3>Today's timetable</h3>
                    </div>

                    <button
                      className="small-button"
                      onClick={() =>
                        setActivePage("timetable")
                      }
                    >
                      View all →
                    </button>
                  </div>

                  <div className="schedule-list">
                    {timetable
                      .slice()
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .slice(0, 3)
                      .map((item, index) => (
                        <div className="schedule-item" key={item.id}>
                          <span className="schedule-time">
                            {item.time}
                          </span>

                          <div
                            className={`schedule-line ${
                              index % 3 === 0
                                ? "blue-line"
                                : index % 3 === 1
                                ? "purple-line"
                                : "yellow-line"
                            }`}
                          ></div>

                          <div className="schedule-info">
                            <strong>{item.subject}</strong>
                            <span>{item.type}</span>
                          </div>
                        </div>
                      ))}

                    {timetable.length === 0 && (
                      <div className="empty-state">
                        <span>📅</span>
                        <p>No timetable entries yet.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* FOCUS CARD */}
                <div className="dashboard-card focus-card">
                  <div className="card-heading">
                    <div>
                      <p className="eyebrow">
                        FOCUS ROOM
                      </p>

                      <h3>Ready when you are</h3>
                    </div>

                    <span className="focus-status">
                      ● Calm mode
                    </span>
                  </div>

                  <div className="timer-circle">
                    <span className="timer-label">
                      {timerMode === "focus"
                        ? "FOCUS SESSION"
                        : "BREAK SESSION"}
                    </span>

                    <strong>{formattedTime}</strong>

                    <span className="timer-subtitle">
                      Pomodoro
                    </span>
                  </div>

                  <button
                    className="primary-button"
                    onClick={() =>
                      setActivePage("focus")
                    }
                  >
                    Enter focus room →
                  </button>
                </div>
              </section>

              {/* TASKS */}
              <section className="dashboard-card tasks-card">
                <div className="card-heading">
                  <div>
                    <p className="eyebrow">
                      YOUR TASKS
                    </p>

                    <h3>
                      Small steps, big progress
                    </h3>
                  </div>

                  <span className="task-count">
                    {completedTasks} of {tasks.length}
                  </span>
                </div>

                <div className="progress-bar">
                  <div
                    style={{
                      width: `${progress}%`,
                    }}
                  ></div>
                </div>

                <div className="task-list">
                  {tasks.map((task) => (
                    <label
                      key={task.id}
                      className={`task-item ${
                        task.completed ? "completed" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() =>
                          toggleTask(task.id)
                        }
                      />

                      <span className="custom-checkbox">
                        {task.completed ? "✓" : ""}
                      </span>

                      <span className="task-text">
                        <strong>{task.title}</strong>
                        <small>{task.subject}</small>
                      </span>
                    </label>
                  ))}
                </div>
              </section>

              {/* AI BANNER */}
              <section className="ai-banner">
                <div className="ai-banner-icon">
                  ✦
                </div>

                <div>
                  <p className="eyebrow">
                    YOUR AI STUDY COMPANION
                  </p>

                  <h3>
                    Need help with today's learning?
                  </h3>

                  <p>
                    Ask questions, create quizzes,
                    summarize notes, or plan your
                    study session.
                  </p>
                </div>

                <button
                  className="primary-button"
                  onClick={() => setShowAiAssistant(true)}
                >
                  Ask PrepPilot →
                </button>
              </section>
            </>
          )}

          {/* FOCUS ROOM */}
          {activePage === "focus" && (
            <section className="focus-room-page">
              <div className="focus-room-header">
                <div>
                  <p className="eyebrow">
                    YOUR PERSONAL STUDY SPACE
                  </p>

                  <h2>Focus Room</h2>

                  <p>
                    Take a deep breath, start your timer,
                    and focus on one small task.
                  </p>
                </div>

                <button
                  className="small-button"
                  onClick={() =>
                    setActivePage("dashboard")
                  }
                >
                  ← Dashboard
                </button>
              </div>

              <div className="large-timer-card">
                {/* FOCUS AND BREAK BUTTONS */}
                <div className="mode-buttons">
                  <button
                    className={
                      timerMode === "focus"
                        ? "mode-button active"
                        : "mode-button"
                    }
                    onClick={() =>
                      selectTimerMode("focus")
                    }
                  >
                    Focus · 25 min
                  </button>

                  <button
                    className={
                      timerMode === "break"
                        ? "mode-button active"
                        : "mode-button"
                    }
                    onClick={() =>
                      selectTimerMode("break")
                    }
                  >
                    Break · 5 min
                  </button>
                </div>

                {/* CUSTOM DURATION BUTTONS */}
                <div className="duration-buttons">
                  <button
                    onClick={() =>
                      selectCustomDuration(15)
                    }
                  >
                    15 min
                  </button>

                  <button
                    onClick={() =>
                      selectCustomDuration(25)
                    }
                  >
                    25 min
                  </button>

                  <button
                    onClick={() =>
                      selectCustomDuration(50)
                    }
                  >
                    50 min
                  </button>
                </div>

                {/* TIMER CIRCLE */}
                <div className="large-timer-circle">
                  <span>
                    {timerMode === "focus"
                      ? "TIME TO FOCUS"
                      : "TAKE A BREAK"}
                  </span>

                  <strong>{formattedTime}</strong>

                  <small>
                    {timerMode === "focus"
                      ? "You can do this 💙"
                      : "Rest and recharge 🌿"}
                  </small>
                </div>

                {/* CONTROLS */}
                <div className="timer-controls">
                  <button
                    className="primary-button"
                    onClick={() =>
                      setIsTimerRunning(
                        (current) => !current
                      )
                    }
                  >
                    {isTimerRunning
                      ? "❚❚ Pause"
                      : "▶ Start"}
                  </button>

                  <button
                    className="secondary-button"
                    onClick={resetTimer}
                  >
                    ↻ Reset
                  </button>
                </div>

                <p className="timer-note">
                  {isTimerRunning
                    ? "Your session is running. Stay focused!"
                    : "Ready to begin your study session?"}
                </p>
              </div>
            </section>
          )}

          {/* ASSIGNMENTS PAGE */}
{activePage === "assignments" && (
  <section className="workspace-page">
    <div className="workspace-header">
      <div>
        <p className="eyebrow">YOUR WORKSPACE</p>
        <h2>Assignments</h2>
        <p>
          Keep track of your academic tasks and deadlines.
        </p>
      </div>

      <span className="workspace-count">
        {completedAssignments}/{assignments.length} completed
      </span>
    </div>

    <div className="assignment-layout">
      {/* ADD ASSIGNMENT FORM */}
      <form
        className="assignment-form"
        onSubmit={addAssignment}
      >
        <h3>Add new assignment</h3>

        <label>Assignment title</label>

        <input
          type="text"
          placeholder="Example: Complete SSD notes"
          value={assignmentTitle}
          onChange={(event) =>
            setAssignmentTitle(event.target.value)
          }
        />

        <label>Subject</label>

        <input
          type="text"
          placeholder="Example: Solid State Devices"
          value={assignmentSubject}
          onChange={(event) =>
            setAssignmentSubject(event.target.value)
          }
        />

        <label>Deadline</label>

        <input
          type="date"
          value={assignmentDeadline}
          onChange={(event) =>
            setAssignmentDeadline(event.target.value)
          }
        />

        <button className="primary-button" type="submit">
          + Add assignment
        </button>
      </form>

      {/* ASSIGNMENT LIST */}
      <div className="assignment-list-card">
        <div className="assignment-list-header">
          <div>
            <p className="eyebrow">YOUR ASSIGNMENTS</p>
            <h3>Academic checklist</h3>
          </div>

          <span className="task-count">
            {Math.round(assignmentProgress)}%
          </span>
        </div>

        <div className="progress-bar">
          <div
            style={{
              width: `${assignmentProgress}%`,
            }}
          ></div>
        </div>

        {assignments.length === 0 ? (
          <div className="empty-state">
            <span>📚</span>
            <h3>No assignments yet</h3>
            <p>Add your first assignment using the form.</p>
          </div>
        ) : (
          <div className="assignment-items">
            {assignments.map((assignment) => (
              <div
                className={`assignment-item ${
                  assignment.completed ? "completed" : ""
                }`}
                key={assignment.id}
              >
                <label className="assignment-main">
                  <input
                    type="checkbox"
                    checked={assignment.completed}
                    onChange={() =>
                      toggleAssignment(assignment.id)
                    }
                  />

                  <span>
                    <strong>{assignment.title}</strong>
                    <small>{assignment.subject}</small>
                    <small>
                      Deadline: {assignment.deadline}
                    </small>
                  </span>
                </label>

                <button
                  className="delete-button"
                  onClick={() =>
                    deleteAssignment(assignment.id)
                  }
                  type="button"
                  title="Delete assignment"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </section>
)}

{/* OTHER PAGES */}
{activePage === "timetable" && (
  <section className="workspace-page timetable-page">
    <div className="page-heading-row">
      <div>
        <p className="eyebrow">PREPPILOT WORKSPACE</p>
        <h2>My timetable</h2>
        <p className="page-subtitle">
          Plan your study sessions and keep your day organized.
        </p>
      </div>
      <span className="page-badge">{timetable.length} sessions</span>
    </div>

    <div className="timetable-layout">
      <form className="schedule-form" onSubmit={addSchedule}>
        <h3>Add a study session</h3>
        <label>
          Subject
          <input
            type="text"
            value={scheduleSubject}
            onChange={(event) => setScheduleSubject(event.target.value)}
            placeholder="e.g. Solid State Devices"
          />
        </label>
        <label>
          Time
          <input
            type="time"
            value={scheduleTime}
            onChange={(event) => setScheduleTime(event.target.value)}
          />
        </label>
        <label>
          Session type
          <input
            type="text"
            value={scheduleType}
            onChange={(event) => setScheduleType(event.target.value)}
            placeholder="e.g. Revision, assignment, practice"
          />
        </label>
        <button className="primary-button" type="submit">
          + Add to timetable
        </button>
      </form>

      <div className="timetable-list-card">
        <div className="list-card-heading">
          <h3>All study sessions</h3>
          <span>{timetable.length} total</span>
        </div>
        {timetable.length === 0 ? (
          <div className="empty-state">
            <span>📅</span>
            <p>No sessions yet. Add your first study session.</p>
          </div>
        ) : (
          <div className="full-timetable-list">
            {timetable
              .slice()
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((item, index) => (
                <div className="full-timetable-item" key={item.id}>
                  <div className="full-timetable-time">{item.time}</div>
                  <div className={`schedule-line ${index % 3 === 0 ? "blue-line" : index % 3 === 1 ? "purple-line" : "yellow-line"}`}></div>
                  <div className="full-timetable-info">
                    <strong>{item.subject}</strong>
                    <span>{item.type}</span>
                  </div>
                  <button
                    className="delete-button"
                    type="button"
                    title={`Delete ${item.subject}`}
                    onClick={() => deleteSchedule(item.id)}
                  >
                    🗑
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  </section>
)}

{activePage === "exam" && (
  <section className="workspace-page exam-page">
    <div className="page-heading-row">
      <div>
        <p className="eyebrow">PREPPILOT WORKSPACE</p>
        <h2>Exam Preparation</h2>
        <p>Plan your exams, track revision, and stay prepared.</p>
      </div>
      <div className="exam-summary-badge">📚 {exams.length} exams planned</div>
    </div>

    <div className="exam-layout">
      <form className="exam-form-card" onSubmit={addExam}>
        <h3>Add an exam</h3>
        <label>Subject name</label>
        <input value={examSubject} onChange={(event) => setExamSubject(event.target.value)} placeholder="e.g. Solid State Devices" />
        <label>Exam date</label>
        <input type="date" value={examDate} onChange={(event) => setExamDate(event.target.value)} />
        <label>Revision note</label>
        <textarea value={examNote} onChange={(event) => setExamNote(event.target.value)} placeholder="Units, important topics, or preparation goals" rows="4" />
        <button className="primary-button" type="submit">+ Add exam</button>
      </form>

      <div className="exam-list-card">
        <div className="section-title-row">
          <h3>Upcoming exams</h3>
          <span>{exams.length} total</span>
        </div>
        {exams.length === 0 ? (
          <div className="empty-state"><span>📅</span><p>No exams added yet.</p></div>
        ) : (
          <div className="exam-list">
            {exams.slice().sort((a, b) => a.date.localeCompare(b.date)).map((exam) => {
              const days = getDaysUntil(exam.date);
              return (
                <article className="exam-card" key={exam.id}>
                  <div className="exam-date-box"><strong>{new Date(`${exam.date}T00:00:00`).getDate()}</strong><span>{new Date(`${exam.date}T00:00:00`).toLocaleDateString("en-IN", { month: "short" })}</span></div>
                  <div className="exam-card-content"><h4>{exam.subject}</h4><p>{exam.note}</p><small>{formatDate(exam.date)} · {days < 0 ? "Completed date" : days === 0 ? "Today" : `${days} days left`}</small></div>
                  <button className="icon-button danger-icon" type="button" onClick={() => deleteExam(exam.id)} title="Delete exam">🗑</button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  </section>
)}
          {activePage === "progress" && (
            <section className="workspace-page progress-page">
              <div className="page-heading-row">
                <div>
                  <p className="eyebrow">YOUR STUDY ANALYTICS</p>
                  <h2>Progress</h2>
                  <p>See how your daily study habits are building momentum.</p>
                </div>
                <button className="small-button danger-text-button" onClick={resetAllData}>Reset local data</button>
              </div>

              <div className="progress-stat-grid">
                <div className="progress-stat-card"><span>⏱</span><p>Focus minutes</p><strong>{studyMinutes}</strong><small>Goal: {studyGoal} min</small></div>
                <div className="progress-stat-card"><span>🔥</span><p>Current streak</p><strong>{studyStreak} days</strong><small>Focus sessions completed: {focusSessions}</small></div>
                <div className="progress-stat-card"><span>✓</span><p>Task progress</p><strong>{Math.round(progress)}%</strong><small>{completedTasks} of {tasks.length} tasks complete</small></div>
                <div className="progress-stat-card"><span>📚</span><p>Assignment progress</p><strong>{Math.round(assignmentProgress)}%</strong><small>{completedAssignments} of {assignments.length} complete</small></div>
              </div>

              <div className="progress-main-grid">
                <div className="dashboard-card">
                  <div className="card-heading"><div><p className="eyebrow">TODAY'S GOAL</p><h3>Study progress</h3></div><strong>{studyProgress}%</strong></div>
                  <div className="progress-bar large-progress"><div style={{ width: `${studyProgress}%` }}></div></div>
                  <div className="goal-controls">
                    <button className="secondary-button" onClick={() => adjustStudyMinutes(-15)}>-15 min</button>
                    <span>{studyMinutes} / {studyGoal} min</span>
                    <button className="secondary-button" onClick={() => adjustStudyMinutes(15)}>+15 min</button>
                  </div>
                </div>
                <div className="dashboard-card">
                  <div className="card-heading"><div><p className="eyebrow">MOMENTUM</p><h3>Keep your routine alive</h3></div><span className="focus-status">● {studyDates.includes(todayKey) ? "Studied today" : "Not started"}</span></div>
                  <p className="progress-message">Complete one Focus Room session each day to build your streak. Your data is saved locally on this device.</p>
                  <button className="primary-button" onClick={() => setActivePage("focus")}>Start a focus session →</button>
                </div>
              </div>
            </section>
          )}

        </div>
      </main>

      {showAiAssistant && (
        <div className="modal-backdrop" onClick={() => setShowAiAssistant(false)}>
          <div className="ai-modal" onClick={(event) => event.stopPropagation()}>
            <div className="ai-modal-header"><div><p className="eyebrow">PREPPILOT AI</p><h2>Study Assistant</h2></div><button className="modal-close" onClick={() => setShowAiAssistant(false)}>×</button></div>
            <p className="ai-helper">Ask for a revision plan, quiz, study schedule, or help breaking down a difficult task.</p>
            <div className="ai-prompts">
              {["Make a revision plan for my next exam", "Quiz me on Unit 1", "Help me plan today's study session"].map((prompt) => <button key={prompt} onClick={() => setAiPrompt(prompt)}>{prompt}</button>)}
            </div>
            <form onSubmit={askAiAssistant} className="ai-chat-form">
              <textarea value={aiPrompt} onChange={(event) => setAiPrompt(event.target.value)} placeholder="What do you want help with?" rows="4" />
              <button className="primary-button" type="submit">{aiLoading ? "Thinking…" : "Ask PrepPilot →"}</button>
            </form>
            {aiReply && <div className="ai-reply"><strong>PrepPilot</strong><p>{aiReply}</p></div>}
          </div>
        </div>
      )}

      {/* FLOATING AI BUTTON */}
      <button
        className="floating-ai-button"
        onClick={() => setShowAiAssistant(true)}
        title="Open AI assistant"
      >
        ✦
        <span className="notification-dot"></span>
      </button>
    </div>
  );
}

export default App;
