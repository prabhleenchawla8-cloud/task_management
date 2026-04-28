const TIME_SLOTS = [
  "Morning   (6AM-12PM)",
  "Afternoon (12PM-5PM)",
  "Evening   (5PM-9PM)",
  "Night     (9PM-12AM)"
];

const FAILURE_REASONS = [
  "Distraction (phone / social media)",
  "Felt tired / low energy",
  "Task was too hard or unclear",
  "Ran out of time",
  "External interruption"
];

let logs = {}; 
let dateOrder = []; 

function showSection(name) {
  const sections = ['log', 'view', 'schedule', 'knapsack', 'insights'];
  sections.forEach(s => {
    document.getElementById('section-' + s).style.display = 'none';
  });
  document.getElementById('section-' + name).style.display = 'block';

  if (name === 'view') renderLogs();
}

function isDateValid(dateStr) {
  if (!/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return false;
  const parts = dateStr.split('-');
  const d = parseInt(parts[0]);
  const m = parseInt(parts[1]);
  const y = parseInt(parts[2]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const input = new Date(y, m - 1, d);

  return input >= today;
}


function generateTaskForms() {
  const count = parseInt(document.getElementById('task-count').value);
  if (isNaN(count) || count < 1 || count > 10) {
    alert("Please enter a number between 1 and 10.");
    return;
  }

  let html = '';
  for (let i = 0; i < count; i++) {
    html += `
      <div class="task-block">
        <h4>Task ${i + 1}</h4>

        <label>Task Name:</label><br/>
        <input type="text" id="task-name-${i}" placeholder="e.g. Study DSA" /><br/><br/>

        <label>Difficulty (1-5):</label><br/>
        <input type="number" id="task-diff-${i}" min="1" max="5" value="3" /><br/><br/>

        <label>Importance (1-5):</label><br/>
        <input type="number" id="task-imp-${i}" min="1" max="5" value="3" /><br/><br/>

        <label>Minutes Required (1-480):</label><br/>
        <input type="number" id="task-mins-${i}" min="1" max="480" value="60" /><br/><br/>

        <label>Time Slot:</label><br/>
        <select id="task-slot-${i}">
          ${TIME_SLOTS.map((s, idx) => `<option value="${idx}">${s}</option>`).join('')}
        </select><br/><br/>

        <label>Status:</label><br/>
        <select id="task-status-${i}" onchange="toggleReason(${i})">
          <option value="0">Pending</option>
          <option value="1">Completed</option>
          <option value="2">Skipped</option>
        </select><br/><br/>

        <div id="reason-block-${i}" style="display:none;">
          <label>Failure Reason:</label><br/>
          <select id="task-reason-${i}">
            ${FAILURE_REASONS.map((r, idx) => `<option value="${idx}">${r}</option>`).join('')}
          </select><br/><br/>
        </div>
      </div>
    `;
  }

  document.getElementById('task-forms').innerHTML = html;
}

function toggleReason(i) {
  const status = document.getElementById('task-status-' + i).value;
  document.getElementById('reason-block-' + i).style.display =
    status === '2' ? 'block' : 'none';
}

function submitLog() {
  const dateStr = document.getElementById('log-date').value.trim();
  const msg = document.getElementById('log-msg');

  if (!isDateValid(dateStr)) {
    msg.className = 'msg error';
    msg.textContent = '[!] Invalid or past date. Use format DD-MM-YYYY.';
    return;
  }

  if (logs[dateStr]) {
    msg.className = 'msg error';
    msg.textContent = '[!] Date already logged.';
    return;
  }

  const taskCount = parseInt(document.getElementById('task-count').value);
  if (!document.getElementById('task-name-0')) {
    msg.className = 'msg error';
    msg.textContent = '[!] Please click "Set Tasks" first.';
    return;
  }

  let tasks = [];
  let completed = 0, pending = 0, skipped = 0;

  for (let i = 0; i < taskCount; i++) {
    const name = document.getElementById('task-name-' + i).value.trim();
    if (!name) {
      msg.className = 'msg error';
      msg.textContent = `[!] Task ${i + 1} has no name.`;
      return;
    }

    const diff = clamp(parseInt(document.getElementById('task-diff-' + i).value), 1, 5);
    const imp  = clamp(parseInt(document.getElementById('task-imp-' + i).value), 1, 5);
    const mins = clamp(parseInt(document.getElementById('task-mins-' + i).value), 1, 480);
    const slot = parseInt(document.getElementById('task-slot-' + i).value);
    const status = parseInt(document.getElementById('task-status-' + i).value);
    let reason = -1;
    if (status === 2) {
      reason = parseInt(document.getElementById('task-reason-' + i).value);
    }

    if (status === 1) completed++;
    else if (status === 0) pending++;
    else skipped++;

    tasks.push({ name, difficulty: diff, importance: imp, minutesRequired: mins,
                 timeSlot: slot, status, failureReason: reason });
  }

  const dayLog = {
    date: dateStr,
    tasks,
    taskCount: tasks.length,
    completedCount: completed,
    pendingCount: pending,
    skippedCount: skipped
  };

  logs[dateStr] = dayLog;
  dateOrder.push(dateStr);

  msg.className = 'msg';
  msg.textContent = '[OK] Day logged successfully!';

  // Reset form
  document.getElementById('log-date').value = '';
  document.getElementById('task-count').value = 1;
  document.getElementById('task-forms').innerHTML = '';
}

function renderLogs() {
  const container = document.getElementById('logs-output');
  if (dateOrder.length === 0) {
    container.innerHTML = '<p class="error">[!] No data logged yet.</p>';
    return;
  }

  let html = '';
  for (const date of dateOrder) {
    const day = logs[date];
    html += `
      <div class="log-card">
        <h3>Date: ${day.date}</h3>
        <small>Completed: <b>${day.completedCount}</b> &nbsp;|&nbsp;
               Pending: <b>${day.pendingCount}</b> &nbsp;|&nbsp;
               Skipped: <b>${day.skippedCount}</b></small>
        <br/><br/>
    `;
    for (const t of day.tasks) {
      const statusLabel = t.status === 1 ? 'COMPLETED' : t.status === 0 ? 'PENDING' : 'SKIPPED';
      let extra = '';
      if (t.status === 2 && t.failureReason >= 0) {
        extra = ` | Reason: ${FAILURE_REASONS[t.failureReason]}`;
      }
      html += `
        <div class="task-row">
          <span class="${statusLabel}">[${statusLabel}]</span>
          <b>${t.name}</b> &nbsp;|&nbsp;
          Diff: ${t.difficulty} &nbsp;|&nbsp;
          Imp: ${t.importance} &nbsp;|&nbsp;
          Mins: ${t.minutesRequired} &nbsp;|&nbsp;
          Slot: ${TIME_SLOTS[t.timeSlot]}
          ${extra}
        </div>
      `;
    }
    html += '</div>';
  }

  container.innerHTML = html;
}

function generateSchedule() {
  const dateStr = document.getElementById('sched-date').value.trim();
  const output = document.getElementById('sched-output');

  const day = getLog(dateStr, output);
  if (!day) return;

  const pending = day.tasks.filter(t => t.status === 0);
  if (pending.length === 0) {
    output.innerHTML = '<div class="output-box">No pending tasks to schedule.</div>';
    return;
  }

  pending.sort((a, b) => b.difficulty - a.difficulty);

  const bestSlot = getBestTimeSlot(day);
  const bestSlotName = bestSlot !== -1 ? TIME_SLOTS[bestSlot] : 'Not determined';

  const split = Math.ceil(pending.length / 2);
  const hardTasks = pending.slice(0, split);
  const restTasks = pending.slice(split);

  let html = `<div class="output-box">
    <b>=== SMART SCHEDULE FOR: ${day.date} ===</b><br/>
    Best Time Slot: <b>${bestSlotName}</b><br/>
    Pending Tasks: ${pending.length}<br/><br/>
    <b>Hard Tasks → Best Slot:</b>
    <ul>${hardTasks.map(t => `<li>${t.name} (${t.minutesRequired} min)</li>`).join('')}</ul>
    <b>Remaining Tasks:</b>
    <ul>${restTasks.length > 0
          ? restTasks.map(t => `<li>${t.name} (${t.minutesRequired} min)</li>`).join('')
          : '<li>None</li>'}</ul>
  </div>`;

  output.innerHTML = html;
}

function getBestTimeSlot(day) {
  const slotScore = [0, 0, 0, 0];
  for (const t of day.tasks) {
    if (t.status === 1) slotScore[t.timeSlot]++;
  }
  let best = -1, maxScore = -1;
  for (let i = 0; i < 4; i++) {
    if (slotScore[i] > maxScore) {
      maxScore = slotScore[i];
      best = i;
    }
  }
  return maxScore > 0 ? best : -1;
}


function runKnapsack() {
  const dateStr = document.getElementById('knap-date').value.trim();
  const capacity = clamp(parseInt(document.getElementById('knap-minutes').value), 1, 480);
  const output = document.getElementById('knap-output');

  const day = getLog(dateStr, output);
  if (!day) return;

  const pending = day.tasks.filter(t => t.status === 0);
  if (pending.length === 0) {
    output.innerHTML = '<div class="output-box">No pending tasks.</div>';
    return;
  }

  const n = pending.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const w = pending[i - 1].minutesRequired;
    const v = pending[i - 1].importance;
    for (let c = 0; c <= capacity; c++) {
      dp[i][c] = dp[i - 1][c];
      if (w <= c && dp[i - 1][c - w] + v > dp[i][c]) {
        dp[i][c] = dp[i - 1][c - w] + v;
      }
    }
  }

  const chosen = [];
  let c = capacity;
  for (let i = n; i >= 1; i--) {
    if (dp[i][c] !== dp[i - 1][c]) {
      chosen.push(pending[i - 1]);
      c -= pending[i - 1].minutesRequired;
    }
  }

  let html = `<div class="output-box">
    <b>=== OPTIMAL TASK SELECTION: ${day.date} ===</b><br/>
    Available: <b>${capacity} minutes</b> &nbsp;|&nbsp; Max Importance Score: <b>${dp[n][capacity]}</b><br/><br/>
    <b>Recommended Tasks:</b>
    <ul>${chosen.map(t => `<li>${t.name} (${t.minutesRequired} min, Imp: ${t.importance})</li>`).join('')}</ul>
  </div>`;

  output.innerHTML = html;
}

function generateInsights() {
  const dateStr = document.getElementById('ins-date').value.trim();
  const output = document.getElementById('ins-output');

  const day = getLog(dateStr, output);
  if (!day) return;

  let html = `<div class="output-box"><b>=== PRODUCTIVITY INSIGHTS: ${day.date} ===</b><br/><br/>`;

  if (day.taskCount > 0 && day.completedCount === day.taskCount) {
    html += 'All tasks completed successfully! Excellent work. 🎉';
    output.innerHTML = html + '</div>';
    return;
  }

  const best = getBestTimeSlot(day);
  if (best !== -1) {
    html += `[TIP 1] Best time slot: <b>${TIME_SLOTS[best]}</b> → Schedule hard tasks here.<br/>`;
  }

  const reason = getMostCommonFailureReason(day);
  if (reason !== -1) {
    html += `[TIP 2] Main issue: <b>${FAILURE_REASONS[reason]}</b><br/>`;
    if (reason === 0) html += '&nbsp;&nbsp;&nbsp;&nbsp;→ Reduce phone distractions.<br/>';
    else if (reason === 1) html += '&nbsp;&nbsp;&nbsp;&nbsp;→ Improve sleep/energy management.<br/>';
  }

  const rate = day.taskCount === 0 ? 0 : (day.completedCount / day.taskCount * 100).toFixed(1);
  html += `[TIP 3] Completion Rate: <b>${rate}%</b>`;

  output.innerHTML = html + '</div>';
}

function getMostCommonFailureReason(day) {
  const counts = [0, 0, 0, 0, 0];
  for (const t of day.tasks) {
    if (t.status === 2 && t.failureReason >= 0) counts[t.failureReason]++;
  }
  let top = -1, maxC = -1;
  for (let i = 0; i < 5; i++) {
    if (counts[i] > maxC) { maxC = counts[i]; top = i; }
  }
  return maxC > 0 ? top : -1;
}

function saveToFile() {
  if (dateOrder.length === 0) {
    alert('[!] No data logged yet.');
    return;
  }

  let content = '====== PRODUCTIVITY LOG ======\n';
  content += `Total Days: ${dateOrder.length}\n\n`;

  for (const date of dateOrder) {
    const day = logs[date];
    content += `Date: ${day.date} | Completed:${day.completedCount} Pending:${day.pendingCount} Skipped:${day.skippedCount}\n`;
    for (const t of day.tasks) {
      const stat = t.status === 1 ? 'COMPLETED' : t.status === 0 ? 'PENDING' : 'SKIPPED';
      content += `  [${stat}] ${t.name} | Diff:${t.difficulty} | Imp:${t.importance} | Mins:${t.minutesRequired} | Slot:${TIME_SLOTS[t.timeSlot]}`;
      if (t.status === 2 && t.failureReason >= 0) {
        content += ` | Reason:${FAILURE_REASONS[t.failureReason]}`;
      }
      content += '\n';
    }
    content += '\n';
  }

  const blob = new Blob([content], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'productivity_log.txt';
  a.click();
}

function clamp(val, min, max) {
  if (isNaN(val)) return min;
  return Math.max(min, Math.min(max, val));
}

function getLog(dateStr, outputEl) {
  if (!dateStr || !/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    outputEl.innerHTML = '<p class="error">[!] Enter a valid date in DD-MM-YYYY format.</p>';
    return null;
  }
  const day = logs[dateStr];
  if (!day) {
    outputEl.innerHTML = `<p class="error">[!] No data found for date: ${dateStr}. Please log this date first (Option 1).</p>`;
    return null;
  }
  return day;
}
