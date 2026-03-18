const state = {
  auth: {
    user: null,
    profile: null,
    ready: false,
  },
  session: {
    active: false,
    id: null,
    code: null,
    startedAt: null,
    durationMs: 5 * 60 * 1000,
  },
  attendance: [
    { rollNo: "22CS001", start: true, end: true, presence: true },
    { rollNo: "22CS002", start: true, end: false, presence: true },
    { rollNo: "22CS003", start: false, end: false, presence: false },
    { rollNo: "22CS004", start: true, end: true, presence: true },
    { rollNo: "22CS005", start: true, end: true, presence: true },
    { rollNo: "22CS006", start: false, end: false, presence: false },
    { rollNo: "22CS007", start: true, end: false, presence: false },
    { rollNo: "22CS008", start: true, end: true, presence: true },
  ],
  teams: [
    { leader: "22CS001", members: ["22CS002", "22CS003"], kitTag: "KIT-101" },
    { leader: "22CS004", members: ["22CS005"], kitTag: "KIT-102" },
    { leader: "22CS006", members: ["22CS007", "22CS008"], kitTag: "KIT-104" },
  ],
  kits: [
    { tagId: "KIT-101", item: "Arduino Starter Kit", leader: "22CS001", team: ["22CS001", "22CS002", "22CS003"], status: "In Use", issueTime: "09:10", returnTime: "--" },
    { tagId: "KIT-102", item: "IoT Sensor Pack", leader: "22CS004", team: ["22CS004", "22CS005"], status: "Available", issueTime: "--", returnTime: "--" },
    { tagId: "KIT-103", item: "Robotics Motor Set", leader: "--", team: [], status: "Returned", issueTime: "08:45", returnTime: "10:12" },
    { tagId: "KIT-104", item: "PCB Debug Toolkit", leader: "22CS006", team: ["22CS006", "22CS007", "22CS008"], status: "In Use", issueTime: "09:22", returnTime: "--" },
  ],
  alerts: [
    {
      id: crypto.randomUUID(),
      level: "warning",
      title: "Partial attendance verification",
      detail: "Student 22CS002 completed start scan but has not completed end scan.",
      time: nowTime(),
      resolved: false,
    },
    {
      id: crypto.randomUUID(),
      level: "critical",
      title: "Kit return pending",
      detail: "KIT-104 is still marked in use beyond the expected lab return window.",
      time: nowTime(),
      resolved: false,
    },
  ],
};

const authShell = document.getElementById("authShell");
const appShell = document.getElementById("appShell");
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const roleInput = document.getElementById("roleInput");
const loginMessage = document.getElementById("loginMessage");
const googleLoginBtn = document.getElementById("googleLoginBtn");

const attendanceTableBody = document.getElementById("attendanceTableBody");
const kitTableBody = document.getElementById("kitTableBody");
const teamGrid = document.getElementById("teamGrid");
const alertsList = document.getElementById("alertsList");
const qrBoard = document.getElementById("qrBoard");
const kitOverview = document.getElementById("kitOverview");

const supabaseConfig = window.SUPABASE_CONFIG || {};
const hasSupabaseConfig = Boolean(
  supabaseConfig.url &&
  supabaseConfig.anonKey &&
  supabaseConfig.url !== "YOUR_SUPABASE_URL" &&
  supabaseConfig.anonKey !== "YOUR_SUPABASE_ANON_KEY"
);

const supabase = hasSupabaseConfig && window.supabase
  ? window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey)
  : null;

loginForm.addEventListener("submit", handleLogin);
googleLoginBtn.addEventListener("click", handleGoogleLogin);
document.getElementById("generateQrBtn").addEventListener("click", generateQrSession);
document.getElementById("toggleSessionBtn").addEventListener("click", toggleSession);
document.getElementById("runVerificationBtn").addEventListener("click", runVerificationRound);
document.getElementById("simulateRfidBtn").addEventListener("click", simulateRfidEvent);
document.getElementById("clearAlertsBtn").addEventListener("click", clearResolvedAlerts);
document.getElementById("exportAttendanceBtn").addEventListener("click", () => exportCsv("attendance-report.csv", attendanceCsvRows()));
document.getElementById("exportKitsBtn").addEventListener("click", () => exportCsv("lab-kit-report.csv", kitCsvRows()));
document.getElementById("exportPdfBtn").addEventListener("click", () => window.print());
document.getElementById("logoutBtn").addEventListener("click", logout);

renderAll();
initializeAuth();
window.setInterval(tickRealtime, 1000);
window.setInterval(simulateBackgroundActivity, 8000);

async function initializeAuth() {
  if (!supabase) {
    setLoginMessage("Add your Supabase project URL and anon key in supabase-config.js to enable login.", "error");
    state.auth.ready = true;
    renderAuthShell();
    return;
  }

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    setLoginMessage(error.message, "error");
  }

  await applySession(session, false);

  supabase.auth.onAuthStateChange(async (_event, sessionState) => {
    await applySession(sessionState, true);
  });
}

async function applySession(session, announce) {
  state.auth.user = session?.user ?? null;
  state.auth.profile = null;
  state.auth.ready = true;

  if (state.auth.user) {
    state.auth.profile = await upsertAndFetchProfile(state.auth.user);
    if (announce) {
      addAlert("info", "Authentication updated", `${state.auth.user.email} is connected through Supabase.`);
    }
  }

  renderAll();
}

async function handleLogin(event) {
  event.preventDefault();

  if (!supabase) {
    setLoginMessage("Supabase is not configured yet.", "error");
    return;
  }

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  sessionStorage.setItem("smartLabPendingRole", roleInput.value);

  setLoginMessage("Signing in with Supabase...", "");

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setLoginMessage(error.message, "error");
    return;
  }

  setLoginMessage("Email sign-in successful.", "success");
  passwordInput.value = "";
}

async function handleGoogleLogin() {
  if (!supabase) {
    setLoginMessage("Supabase is not configured yet.", "error");
    return;
  }

  sessionStorage.setItem("smartLabPendingRole", roleInput.value);
  setLoginMessage("Redirecting to Google...", "");

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: supabaseConfig.redirectTo || window.location.href,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    setLoginMessage(error.message, "error");
  }
}

async function upsertAndFetchProfile(user) {
  if (!supabase || !user) {
    return null;
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("user_id, email, role, provider, full_name, last_sign_in_at")
    .eq("user_id", user.id)
    .maybeSingle();

  const provider = user.app_metadata?.provider || "email";
  const metadata = user.user_metadata || {};
  const fullName = metadata.full_name || metadata.name || existingProfile?.full_name || user.email || "Smart Lab User";
  const pendingRole = sessionStorage.getItem("smartLabPendingRole");
  const selectedRole = existingProfile?.role || pendingRole || roleInput.value || "faculty";

  const payload = {
    user_id: user.id,
    email: user.email,
    role: selectedRole,
    provider,
    full_name: fullName,
    last_sign_in_at: new Date().toISOString(),
  };

  const { error: upsertError } = await supabase.from("profiles").upsert(payload, {
    onConflict: "user_id",
  });

  if (upsertError) {
    addAlert("warning", "Profile sync failed", upsertError.message);
    return payload;
  }

  sessionStorage.removeItem("smartLabPendingRole");
  return { ...existingProfile, ...payload };
}

async function logout() {
  if (!supabase) {
    state.auth.user = null;
    state.auth.profile = null;
    renderAll();
    return;
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    addAlert("warning", "Logout failed", error.message);
    return;
  }

  state.auth.user = null;
  state.auth.profile = null;
  loginForm.reset();
  roleInput.value = "faculty";
  setLoginMessage("You have been logged out.", "");
  renderAll();
}

function renderAll() {
  renderAuthShell();
  renderAttendance();
  renderSession();
  renderKits();
  renderTeams();
  renderAlerts();
  renderReports();
}

function renderAuthShell() {
  const isAuthenticated = Boolean(state.auth.user);
  authShell.classList.toggle("hidden", isAuthenticated);
  appShell.classList.toggle("hidden", !isAuthenticated);

  if (!isAuthenticated) {
    googleLoginBtn.disabled = !supabase;
    return;
  }

  const profile = state.auth.profile || {};
  const displayName = profile.full_name || state.auth.user.user_metadata?.full_name || state.auth.user.email || "Smart Lab User";
  const role = profile.role || roleInput.value || "faculty";
  const provider = profile.provider || state.auth.user.app_metadata?.provider || "email";

  document.getElementById("activeUserName").textContent = displayName;
  document.getElementById("activeUserRole").textContent = role;
  document.getElementById("activeUserId").textContent = state.auth.user.id;
  document.getElementById("activeAuthProvider").textContent = provider;
  document.getElementById("exportPdfBtn").textContent = role === "admin" ? "Export Admin PDF View" : "Export PDF View";
}

function renderAttendance() {
  const rows = state.attendance.map((entry) => {
    const status = entry.start && entry.end ? "Verified" : entry.start || entry.end ? "Partial" : "Absent";
    return `
      <tr>
        <td class="mono">${entry.rollNo}</td>
        <td>${statusBadge(status)}</td>
        <td>${scanBadge(entry.start)}</td>
        <td>${scanBadge(entry.end)}</td>
        <td>${presenceBadge(entry.presence, entry.start || entry.end)}</td>
      </tr>
    `;
  }).join("");

  attendanceTableBody.innerHTML = rows;

  const verified = state.attendance.filter((student) => student.start && student.end).length;
  const partial = state.attendance.filter((student) => (student.start || student.end) && !(student.start && student.end)).length;
  const absent = state.attendance.length - verified - partial;

  document.getElementById("presentCount").textContent = verified;
  document.getElementById("verifiedCount").textContent = `${verified} verified`;
  document.getElementById("partialCount").textContent = `${partial} partial`;
  document.getElementById("absentCount").textContent = `${absent} absent`;
}

function renderSession() {
  document.getElementById("sessionState").textContent = state.session.active ? "Live" : "Closed";
  document.getElementById("sessionMeta").textContent = state.session.active
    ? "QR verification running now"
    : "Waiting for faculty action";
  document.getElementById("sessionId").textContent = state.session.id || "Not generated";
  document.getElementById("verificationCode").textContent = state.session.code || "---- ----";
  document.getElementById("liveBadge").textContent = state.session.active ? "Session Live" : "Session Offline";
  document.getElementById("liveBadge").className = `live-pill ${state.session.active ? "live-on" : "live-off"}`;
  document.getElementById("toggleSessionBtn").textContent = state.session.active ? "Stop Session" : "Start Session";
  document.getElementById("sessionTimer").textContent = sessionCountdown();
  renderPseudoQr();
}

function renderPseudoQr() {
  const seed = `${state.session.id || "idle"}-${state.session.code || "0000"}`;
  const cells = [];
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(index);
    hash |= 0;
  }

  for (let cell = 0; cell < 289; cell += 1) {
    hash = (hash * 1664525 + 1013904223) >>> 0;
    const active = cell < 48 || (hash & 1) === 1;
    cells.push(`<span class="qr-cell ${active ? "active" : ""}"></span>`);
  }

  qrBoard.innerHTML = cells.join("");
}

function renderKits() {
  const rows = state.kits.map((kit) => `
    <tr>
      <td>${kit.item}<br><span class="mono">${kit.tagId}</span></td>
      <td class="mono">${kit.leader}</td>
      <td>${kit.team.length ? kit.team.join(", ") : "--"}</td>
      <td>${statusBadge(kit.status)}</td>
      <td class="mono">${kit.issueTime}</td>
      <td class="mono">${kit.returnTime}</td>
    </tr>
  `).join("");

  kitTableBody.innerHTML = rows;

  const counts = {
    Available: state.kits.filter((kit) => kit.status === "Available").length,
    "In Use": state.kits.filter((kit) => kit.status === "In Use").length,
    Returned: state.kits.filter((kit) => kit.status === "Returned").length,
  };

  document.getElementById("kitsInUseCount").textContent = counts["In Use"];
  kitOverview.innerHTML = Object.entries(counts).map(([label, value]) => `
    <div class="overview-pill">
      <span class="summary-dot ${statusDotClass(label)}"></span>
      <span>${label}: ${value}</span>
    </div>
  `).join("");
}

function renderTeams() {
  teamGrid.innerHTML = state.teams.map((team) => `
    <article class="team-card">
      <p class="panel-kicker">Leader ${team.leader}</p>
      <h3 class="mono">${team.kitTag}</h3>
      <p>Linked kit usage updates follow this team mapping automatically.</p>
      <div class="team-members">
        <span class="member-chip mono">${team.leader}</span>
        ${team.members.map((member) => `<span class="member-chip mono">${member}</span>`).join("")}
      </div>
    </article>
  `).join("");
}

function renderAlerts() {
  const activeAlerts = state.alerts.filter((alert) => !alert.resolved).slice(0, 8);

  if (!activeAlerts.length) {
    alertsList.innerHTML = `
      <article class="alert-card alert-info">
        <header>
          <strong>No active alerts</strong>
          <span class="alert-level">clear</span>
        </header>
        <p>Attendance, session activity, and kit tracking are currently stable.</p>
      </article>
    `;
    return;
  }

  alertsList.innerHTML = activeAlerts.map((alert) => `
    <article class="alert-card alert-${alert.level}">
      <header>
        <strong>${alert.title}</strong>
        <span class="alert-level">${alert.level}</span>
      </header>
      <p>${alert.detail}</p>
      <span class="mono">${alert.time}</span>
    </article>
  `).join("");
}

function renderReports() {
  const verified = state.attendance.filter((entry) => entry.start && entry.end).length;
  const partial = state.attendance.filter((entry) => (entry.start || entry.end) && !(entry.start && entry.end)).length;
  const inUse = state.kits.filter((kit) => kit.status === "In Use").length;
  const returned = state.kits.filter((kit) => kit.status === "Returned").length;

  document.getElementById("attendanceReportText").textContent =
    `${verified} students fully verified, ${partial} need follow-up, and ${state.alerts.filter((alert) => alert.level === "critical" && !alert.resolved).length} critical exceptions are currently open.`;

  document.getElementById("kitReportText").textContent =
    `${inUse} kits are checked out right now, ${returned} have been returned, and all records are export-ready for PDF or CSV workflows.`;
}

function generateQrSession() {
  const stamp = Date.now().toString(36).toUpperCase();
  state.session.id = `LAB-${stamp.slice(-6)}`;
  state.session.code = `${stamp.slice(-4)} ${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  state.session.startedAt = Date.now();
  addAlert("info", "QR regenerated", `New session ${state.session.id} is ready for faculty use.`);
  renderSession();
}

function toggleSession() {
  if (!state.session.id) {
    generateQrSession();
  }

  state.session.active = !state.session.active;
  state.session.startedAt = state.session.active ? Date.now() : null;

  addAlert(
    state.session.active ? "info" : "warning",
    state.session.active ? "Attendance session started" : "Attendance session stopped",
    state.session.active
      ? `Verification is active with session ${state.session.id}.`
      : "Faculty closed the current verification window."
  );

  renderSession();
}

function runVerificationRound() {
  const pending = state.attendance.find((entry) => entry.start && !entry.end);

  if (pending) {
    pending.end = true;
    pending.presence = true;
    addAlert("info", "Verification round completed", `${pending.rollNo} successfully completed the end scan.`);
  } else {
    addAlert("warning", "Verification round triggered", "No partial records were available, so a fresh round was announced.");
  }

  renderAttendance();
  renderReports();
  renderAlerts();
}

function simulateRfidEvent() {
  const candidate = state.kits.find((kit) => kit.status !== "In Use") || state.kits[0];
  const taking = candidate.status !== "In Use";

  if (taking) {
    const team = state.teams[Math.floor(Math.random() * state.teams.length)];
    candidate.status = "In Use";
    candidate.leader = team.leader;
    candidate.team = [team.leader, ...team.members];
    candidate.issueTime = nowTime();
    candidate.returnTime = "--";
    addAlert("info", "Kit issued", `${candidate.tagId} was assigned to leader ${team.leader}.`);
  } else {
    candidate.status = "Returned";
    candidate.returnTime = nowTime();
    addAlert("warning", "Kit returned", `${candidate.tagId} was scanned back into storage.`);
  }

  renderKits();
  renderReports();
  renderAlerts();
}

function clearResolvedAlerts() {
  state.alerts = state.alerts.filter((alert) => alert.level === "critical" && !alert.resolved);
  renderAlerts();
}

function tickRealtime() {
  if (!state.auth.user) {
    return;
  }

  if (state.session.active && state.session.startedAt) {
    const expired = Date.now() - state.session.startedAt >= state.session.durationMs;
    if (expired) {
      state.session.active = false;
      state.session.startedAt = null;
      addAlert("critical", "Session expired", "The QR verification window expired and was closed automatically.");
      renderSession();
      renderAlerts();
    } else {
      document.getElementById("sessionTimer").textContent = sessionCountdown();
    }
  }
}

function simulateBackgroundActivity() {
  if (!state.auth.user) {
    return;
  }

  const rollIndex = Math.floor(Math.random() * state.attendance.length);
  const record = state.attendance[rollIndex];

  if (state.session.active && !record.start) {
    record.start = true;
    record.presence = true;
    addAlert("info", "Start scan received", `${record.rollNo} completed the first verification scan.`);
  } else if (state.session.active && record.start && !record.end) {
    record.end = Math.random() > 0.35;
    if (!record.end) {
      record.presence = false;
      addAlert("warning", "Failed attendance attempt", `${record.rollNo} did not complete end verification successfully.`);
    }
  }

  if (Math.random() > 0.65) {
    const kit = state.kits[Math.floor(Math.random() * state.kits.length)];
    if (kit.status === "In Use" && Math.random() > 0.5) {
      addAlert("critical", "Unauthorized kit movement", `${kit.tagId} reported movement outside the expected return flow.`);
    }
  }

  state.alerts = state.alerts.slice(0, 8);
  renderAttendance();
  renderReports();
  renderAlerts();
}

function attendanceCsvRows() {
  return [
    ["Roll No", "Status", "Start Scan", "End Scan", "Presence"],
    ...state.attendance.map((entry) => [
      entry.rollNo,
      entry.start && entry.end ? "Verified" : entry.start || entry.end ? "Partial" : "Absent",
      entry.start,
      entry.end,
      entry.presence,
    ]),
  ];
}

function kitCsvRows() {
  return [
    ["Tag ID", "Item", "Leader", "Team", "Status", "Issue Time", "Return Time"],
    ...state.kits.map((kit) => [
      kit.tagId,
      kit.item,
      kit.leader,
      kit.team.join(" | "),
      kit.status,
      kit.issueTime,
      kit.returnTime,
    ]),
  ];
}

function exportCsv(filename, rows) {
  const csv = rows.map((row) => row.map(csvValue).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function csvValue(value) {
  const stringValue = String(value ?? "");
  return `"${stringValue.replace(/"/g, "\"\"")}"`;
}

function sessionCountdown() {
  if (!state.session.active || !state.session.startedAt) {
    return "00:00";
  }

  const remaining = Math.max(state.session.durationMs - (Date.now() - state.session.startedAt), 0);
  const minutes = String(Math.floor(remaining / 60000)).padStart(2, "0");
  const seconds = String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function addAlert(level, title, detail) {
  state.alerts.unshift({
    id: crypto.randomUUID(),
    level,
    title,
    detail,
    time: nowTime(),
    resolved: false,
  });
}

function statusBadge(label) {
  const normalized = label.toLowerCase().replace(/\s+/g, "-");
  return `<span class="status-badge status-${normalized}">${label}</span>`;
}

function scanBadge(value) {
  return `<span class="scan-badge ${value ? "scan-true" : "scan-false"}">${value ? "TRUE" : "FALSE"}</span>`;
}

function presenceBadge(value, hasAttempt) {
  if (value) {
    return '<span class="presence-pill presence-true">ESP32 TRUE</span>';
  }

  if (hasAttempt) {
    return '<span class="presence-pill presence-warning">Validation mismatch</span>';
  }

  return '<span class="presence-pill presence-false">ESP32 FALSE</span>';
}

function statusDotClass(label) {
  if (label === "Available" || label === "Returned") {
    return "ok";
  }

  if (label === "In Use") {
    return "warn";
  }

  return "neutral";
}

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function setLoginMessage(message, stateClass) {
  loginMessage.textContent = message;
  loginMessage.className = `login-message${stateClass ? ` ${stateClass}` : ""}`;
}
