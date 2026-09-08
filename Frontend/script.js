/**
 * MENTAL HEALTH MONITORING APP - FRONTEND ARCHITECTURE
 * 
 * NOTE FOR BACKEND TEAM:
 * All data definitions in this file are isolated into cleanly structured mock objects.
 * To integrate with your backend APIs, replace the mock objects and helper functions 
 * in the "BACKEND INTEGRATION LAYER" section below with real HTTP requests (fetch/axios/WebSocket).
 */

const API_BASE_URL = "http://127.0.0.1:8000/api";

/* ==========================================================================
   1. MOCK DATA LAYER (Ready for API Replacement)
   ========================================================================== */

const mockUserData = {
    id: "usr_948201",
    name: "Aman",
    email: "aman@university.edu",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    role: "Student / User",
    joinedDate: "August 2025",
    wellbeingScore: 72,
    wellbeingStatus: "Good",
    wellbeingChange: "+6% from last week",
    streakDays: 5,
    preferences: {
        dailyReminder: true,
        emailSummary: false,
        darkTheme: false,
        voiceCallAudio: true,
        anonymousDataSharing: true
    }
};

const mockHealthData = {
    timeframes: {
        "7d": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "30d": ["Week 1", "Week 2", "Week 3", "Week 4"]
    },
    mood: {
        current: "Calm & Focused",
        trend: "Upward (+12%)",
        weeklyData: [6.2, 6.8, 7.0, 6.5, 7.5, 8.0, 7.8],
        monthlyData: [6.1, 6.5, 7.2, 7.8],
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        min: 0,
        max: 10
    },
    stress: {
        current: "Low - Moderate",
        trend: "Decreasing (-8%)",
        weeklyData: [5.5, 6.0, 4.8, 5.0, 3.8, 3.2, 3.5],
        monthlyData: [6.5, 5.8, 4.9, 3.5],
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        min: 0,
        max: 10
    },
    sleep: {
        average: "7h 24m",
        trend: "+18 min from last week",
        weeklyData: [6.8, 7.1, 6.5, 7.4, 8.0, 8.5, 7.4], // hours
        monthlyData: [6.9, 7.1, 7.3, 7.6],
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        min: 0,
        max: 12
    },
    wellbeing: {
        score: 72,
        trend: "+6% from last week",
        weeklyData: [65, 67, 68, 70, 71, 74, 72],
        monthlyData: [62, 66, 70, 72],
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        min: 0,
        max: 100
    }
};

const mockSchedule = [
    { id: 1, time: "08:00", title: "Wake up & Morning Hydration", category: "Routine", status: "completed", note: "Start with 500ml water" },
    { id: 2, time: "09:00", title: "Nutritious Breakfast & Mindful Check-in", category: "Health", status: "completed", note: "Oats & Fresh Fruits" },
    { id: 3, time: "10:00", title: "Classes / Focused Academic Work", category: "Work", status: "completed", note: "Computer Science Lecture" },
    { id: 4, time: "13:00", title: "Balanced Lunch & Short Walk", category: "Routine", status: "completed", note: "15 min sunshine outdoors" },
    { id: 5, time: "16:00", title: "Afternoon Break & Deep Breathing", category: "Mindfulness", status: "upcoming", note: "4-7-8 breathing exercise" },
    { id: 6, time: "18:00", title: "Physical Exercise / Swimming", category: "Health", status: "upcoming", note: "Moderate intensity cardio" },
    { id: 7, time: "20:00", title: "Dinner & Unwind with Friends", category: "Social", status: "upcoming", note: "No study talk" },
    { id: 8, time: "22:30", title: "Digital Wind-down & Evening Journal", category: "Mindfulness", status: "upcoming", note: "Screens off" },
    { id: 9, time: "23:00", title: "Sleep Target", category: "Routine", status: "upcoming", note: "7.5 hrs target sleep" }
];

const mockInsights = [
    {
        id: "ins_1",
        category: "Sleep & Recovery",
        tag: "Positive Correlation",
        title: "Consistent Bedtime Impact",
        description: "Going to bed around 23:00 over the past 4 days has correlated with a 14% higher morning energy score.",
        actionText: "View Sleep Analysis",
        icon: "moon"
    },
    {
        id: "ins_2",
        category: "Stress Patterns",
        tag: "Routine Insight",
        title: "Post-Class Break Effect",
        description: "Your recorded stress levels dropped significantly on days you took a 15-minute walk right after afternoon classes.",
        actionText: "Adjust Schedule",
        icon: "sun"
    },
    {
        id: "ins_3",
        category: "Wellbeing Streak",
        tag: "Milestone",
        title: "5 Days of Consistent Tracking",
        description: "You have completed your daily check-in 5 days in a row. Regular logging improves recommendation accuracy.",
        actionText: "Keep it up",
        icon: "sparkles"
    }
];

const mockTherapistData = {
    sessionId: "TH-84920",
    therapistName: "Dr. Sarah Jenkins",
    specialty: "Clinical Psychologist & Youth Counselor",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    progressHeader: "Quarterly Wellbeing Assessment",
    sessionStatus: "Scheduled",
    nextSessionDate: "Thursday, Sep 10",
    nextSessionTime: "4:00 PM",
    notes: "Reviewing stress levels during mid-term exam prep."
};

const mockChatFlow = [
    {
        triggerCount: 0,
        response: "Thank you for sharing that with me, Aman. Understanding your routine helps us provide supportive insights. How have your stress and energy levels felt over the past couple of days?",
        suggestions: ["A bit overloaded with studies", "Feeling steady and balanced", "Struggling to sleep well"]
    },
    {
        triggerCount: 1,
        response: "I hear you. Academic pressure can certainly affect sleep and energy. We've set up your personalized Wellbeing Monitoring dashboard to track patterns and offer simple recommendations.",
        suggestions: ["Show my dashboard", "Tell me more about voice calls"]
    },
    {
        triggerCount: 2,
        response: "You're all set! Let me bring you directly to your Home Dashboard so you can see your current wellbeing overview.",
        suggestions: [],
        autoNavigate: true
    }
];

/* ==========================================================================
   2. APPLICATION STATE MANAGEMENT
   ========================================================================== */

const appState = {
    auth: {
        email: "aman@university.edu",
        password: "password123"
    },
    currentView: "login",
    activeTimeframe: "7d",
    chatHistory: [
        {
            sender: "assistant",
            text: "Hi Aman, I'd like to get to know you a little better. Tell me something about yourself or how you're feeling today.",
            time: "Just now"
        }
    ],
    chatStep: 0,
    voiceCall: {
        isActive: false,
        isMuted: false,
        isSpeakerOn: true,
        secondsElapsed: 0,
        timerInterval: null,
        animFrame: null
    }
};

/* ==========================================================================
   3. DOM ELEMENT REFERENCES
   ========================================================================== */

const elements = {};

function cacheDOMElements() {
    // Navigation
    elements.topNav = document.getElementById("top-nav");
    elements.bottomNav = document.getElementById("bottom-nav");
    elements.navLinks = document.querySelectorAll("[data-nav]");
    
    // Views
    elements.views = {
        login: document.getElementById("view-login"),
        onboarding: document.getElementById("view-onboarding"),
        dashboard: document.getElementById("view-dashboard"),
        monitoring: document.getElementById("view-monitoring"),
        profile: document.getElementById("view-profile"),
        voicecall: document.getElementById("view-voicecall")
    };

    // Login Form
    elements.loginForm = document.getElementById("login-form");
    elements.loginEmail = document.getElementById("login-email");
    elements.loginPassword = document.getElementById("login-password");

    // Chat Elements
    elements.chatMessages = document.getElementById("chat-messages");
    elements.chatInput = document.getElementById("chat-input");
    elements.chatSendBtn = document.getElementById("chat-send-btn");
    elements.chatSuggestions = document.getElementById("chat-suggestions");
    elements.chatContinueBtn = document.getElementById("chat-continue-btn");
    elements.typingIndicator = document.getElementById("typing-indicator");

    // Voice Call Elements
    elements.vcTimer = document.getElementById("vc-timer");
    elements.vcStatus = document.getElementById("vc-status");
    elements.vcAvatar = document.getElementById("vc-avatar");
    elements.vcMuteBtn = document.getElementById("vc-mute-btn");
    elements.vcSpeakerBtn = document.getElementById("vc-speaker-btn");
    elements.vcEndBtn = document.getElementById("vc-end-btn");
    elements.vcCanvas = document.getElementById("vc-waveform");

    // Monitoring Charts & Timetable
    elements.chartMood = document.getElementById("chart-mood");
    elements.chartStress = document.getElementById("chart-stress");
    elements.chartSleep = document.getElementById("chart-sleep");
    elements.chartWellbeing = document.getElementById("chart-wellbeing");
    elements.scheduleContainer = document.getElementById("schedule-container");
    elements.insightsContainer = document.getElementById("insights-container");
    elements.timeframeTabs = document.querySelectorAll("[data-timeframe]");

    // User Profile Data elements
    elements.profileName = document.getElementById("profile-name");
    elements.profileEmail = document.getElementById("profile-email");
    elements.logoutBtn = document.getElementById("logout-btn");
}

/* ==========================================================================
   4. NAVIGATION & VIEW ROUTER
   ========================================================================== */

function navigateTo(viewName) {
    if (!elements.views[viewName]) return;

    // Save previous state if leaving voice call
    if (appState.currentView === "voicecall" && viewName !== "voicecall") {
        stopVoiceCallSimulation();
    }

    appState.currentView = viewName;

    // Toggle active view
    Object.keys(elements.views).forEach(key => {
        const viewEl = elements.views[key];
        if (viewEl) {
            if (key === viewName) {
                viewEl.classList.add("active-view");
                viewEl.setAttribute("aria-hidden", "false");
            } else {
                viewEl.classList.remove("active-view");
                viewEl.setAttribute("aria-hidden", "true");
            }
        }
    });

    // Update active nav links
    elements.navLinks.forEach(link => {
        const targetNav = link.getAttribute("data-nav");
        if (targetNav === viewName) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });

    // Control header & navigation bar visibility
    if (viewName === "login" || viewName === "onboarding" || viewName === "voicecall") {
        if (elements.topNav) elements.topNav.classList.add("hidden");
        if (elements.bottomNav) elements.bottomNav.classList.add("hidden");
    } else {
        if (elements.topNav) elements.topNav.classList.remove("hidden");
        if (elements.bottomNav) elements.bottomNav.classList.remove("hidden");
    }

    // Initialize specific view requirements
    if (viewName === "monitoring") {
        renderAllCharts();
        renderSchedule();
        renderInsights();
    } else if (viewName === "voicecall") {
        startVoiceCallSimulation();
    }

    // Scroll to top of window
    window.scrollTo(0, 0);
}

/* ==========================================================================
   5. INITIAL CHAT / ONBOARDING LOGIC
   ========================================================================== */

function renderChatHistory() {
    if (!elements.chatMessages) return;

    elements.chatMessages.innerHTML = "";
    appState.chatHistory.forEach(msg => {
        const messageRow = document.createElement("div");
        messageRow.className = `chat-row ${msg.sender === "user" ? "user-row" : "assistant-row"}`;
        
        const bubble = document.createElement("div");
        bubble.className = `chat-bubble ${msg.sender === "user" ? "bubble-user" : "bubble-assistant"}`;
        bubble.innerHTML = `<p>${escapeHTML(msg.text)}</p><span class="chat-time">${msg.time}</span>`;

        messageRow.appendChild(bubble);
        elements.chatMessages.appendChild(messageRow);
    });

    // Auto scroll chat to bottom
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

async function sendChatMessage(text) {
    if (!text || text.trim() === "") return;

    const promptText = text.trim();
    const userMsg = {
        sender: "user",
        text: promptText,
        time: getCurrentTimeString()
    };

    appState.chatHistory.push(userMsg);
    renderChatHistory();

    if (elements.chatInput) elements.chatInput.value = "";
    if (elements.chatSuggestions) elements.chatSuggestions.style.display = "none";
    if (elements.typingIndicator) elements.typingIndicator.classList.remove("hidden");

    try {
        const historyPayload = appState.chatHistory.slice(0, -1).map(msg => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.text
        }));

        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-User-Email": appState.auth.email,
                "X-User-Password": appState.auth.password
            },
            body: JSON.stringify({
                prompt: promptText,
                history: historyPayload
            })
        });

        if (elements.typingIndicator) elements.typingIndicator.classList.add("hidden");

        if (response.ok) {
            const data = await response.json();
            const assistantMsg = {
                sender: "assistant",
                text: data.response,
                time: getCurrentTimeString()
            };
            appState.chatHistory.push(assistantMsg);
            renderChatHistory();

            if (data.suggestions && data.suggestions.length > 0) {
                renderChatSuggestions(data.suggestions);
                if (elements.chatSuggestions) elements.chatSuggestions.style.display = "flex";
            }
            if (elements.chatContinueBtn) elements.chatContinueBtn.classList.remove("hidden");
            appState.chatStep++;
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (err) {
        console.warn("Backend API call failed, using fallback mode:", err);
        if (elements.typingIndicator) elements.typingIndicator.classList.add("hidden");

        const currentFlowStep = mockChatFlow[appState.chatStep] || {
            response: "Thank you for sharing. Everything you tell us helps tailor your daily schedule and monitoring metrics. Ready to check out your Home Dashboard?",
            suggestions: [],
            autoNavigate: true
        };

        const assistantMsg = {
            sender: "assistant",
            text: currentFlowStep.response,
            time: getCurrentTimeString()
        };

        appState.chatHistory.push(assistantMsg);
        renderChatHistory();

        if (currentFlowStep.suggestions && currentFlowStep.suggestions.length > 0) {
            renderChatSuggestions(currentFlowStep.suggestions);
            if (elements.chatSuggestions) elements.chatSuggestions.style.display = "flex";
        }

        if (elements.chatContinueBtn) elements.chatContinueBtn.classList.remove("hidden");
        appState.chatStep++;
    }
}

function renderChatSuggestions(suggestions) {
    if (!elements.chatSuggestions) return;
    elements.chatSuggestions.innerHTML = "";

    suggestions.forEach(suggestion => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "chat-suggestion-chip";
        chip.textContent = suggestion;
        chip.addEventListener("click", () => sendChatMessage(suggestion));
        elements.chatSuggestions.appendChild(chip);
    });
}

/* ==========================================================================
   6. VOICE CALL SIMULATION (UI READY FOR BACKEND WEBSOCKET/RTC INTEGRATION)
   ========================================================================== */

function startVoiceCallSimulation() {
    appState.voiceCall.isActive = true;
    appState.voiceCall.secondsElapsed = 0;
    appState.voiceCall.isMuted = false;

    updateVoiceCallUI();

    // Start timer interval
    if (appState.voiceCall.timerInterval) clearInterval(appState.voiceCall.timerInterval);
    appState.voiceCall.timerInterval = setInterval(() => {
        appState.voiceCall.secondsElapsed++;
        if (elements.vcTimer) {
            elements.vcTimer.textContent = formatDuration(appState.voiceCall.secondsElapsed);
        }
    }, 1000);

    // Trigger API voice assistant call automatically after 2 seconds
    setTimeout(() => {
        if (appState.voiceCall.isActive) {
            sendVoiceAudioToBackend();
        }
    }, 2000);

    // Start waveform animation on canvas
    startWaveformCanvas();
}

async function sendVoiceAudioToBackend(audioBlob) {
    try {
        if (elements.vcStatus) elements.vcStatus.textContent = "Transcribing audio via STT...";

        // Create audio container payload (dummy PCM/MP3 buffer if no live mic blob)
        const blob = audioBlob || new Blob([new Uint8Array([0x49, 0x44, 0x33])], { type: "audio/mp3" });
        const formData = new FormData();
        formData.append("file", blob, "voice_input.mp3");

        const response = await fetch(`${API_BASE_URL}/voice`, {
            method: "POST",
            headers: {
                "X-User-Email": appState.auth.email,
                "X-User-Password": appState.auth.password
            },
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            if (elements.vcStatus) elements.vcStatus.textContent = `AI: "${data.response.slice(0, 35)}..."`;
            
            // Push transcript and response to chat history
            appState.chatHistory.push({
                sender: "user",
                text: `[Voice Call]: ${data.transcript}`,
                time: getCurrentTimeString()
            });
            appState.chatHistory.push({
                sender: "assistant",
                text: data.response,
                time: getCurrentTimeString()
            });

            if (appState.voiceCall.isSpeakerOn && 'speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(data.response);
                window.speechSynthesis.speak(utterance);
            }
        }
    } catch (err) {
        console.warn("Voice assistant backend error:", err);
        if (elements.vcStatus) elements.vcStatus.textContent = "Voice Assistant Connected";
    }
}

function stopVoiceCallSimulation() {
    appState.voiceCall.isActive = false;
    if (appState.voiceCall.timerInterval) {
        clearInterval(appState.voiceCall.timerInterval);
        appState.voiceCall.timerInterval = null;
    }
    if (appState.voiceCall.animFrame) {
        cancelAnimationFrame(appState.voiceCall.animFrame);
        appState.voiceCall.animFrame = null;
    }
}

function updateVoiceCallUI() {
    if (elements.vcStatus) {
        elements.vcStatus.textContent = appState.voiceCall.isMuted ? "Muted" : "Listening...";
    }
    if (elements.vcMuteBtn) {
        elements.vcMuteBtn.classList.toggle("btn-active", appState.voiceCall.isMuted);
    }
    if (elements.vcSpeakerBtn) {
        elements.vcSpeakerBtn.classList.toggle("btn-active", appState.voiceCall.isSpeakerOn);
    }
}

function startWaveformCanvas() {
    if (!elements.vcCanvas) return;
    const canvas = elements.vcCanvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let phase = 0;

    function animate() {
        if (!appState.voiceCall.isActive) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const width = canvas.width;
        const height = canvas.height;
        const centerY = height / 2;

        if (appState.voiceCall.isMuted) {
            // Straight line when muted
            ctx.beginPath();
            ctx.moveTo(0, centerY);
            ctx.lineTo(width, centerY);
            ctx.strokeStyle = "rgba(100, 115, 90, 0.3)";
            ctx.lineWidth = 2;
            ctx.stroke();
        } else {
            // Render smooth organic sine wave
            ctx.beginPath();
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = "#486e2e";

            for (let x = 0; x < width; x++) {
                const angle = (x / width) * Math.PI * 4 + phase;
                const amplitude = Math.sin(x * 0.02 + phase) * 20 + 5;
                const y = centerY + Math.sin(angle) * amplitude;

                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();

            phase += 0.06;
        }

        appState.voiceCall.animFrame = requestAnimationFrame(animate);
    }

    animate();
}

/* ==========================================================================
   7. CUSTOM SVG CHARTS RENDERER (Clean, Crisp, Muted Aesthetic)
   ========================================================================== */

function renderAllCharts() {
    const timeframe = appState.activeTimeframe;
    const labels = mockHealthData.timeframes[timeframe];

    // Mood Chart (Line Graph)
    const moodData = timeframe === "7d" ? mockHealthData.mood.weeklyData : mockHealthData.mood.monthlyData;
    renderSVGLineChart(elements.chartMood, {
        labels: labels,
        values: moodData,
        min: 0,
        max: 10,
        lineColor: "#486e2e",
        fillColor: "rgba(72, 110, 46, 0.08)",
        unit: "/10"
    });

    // Stress Chart (Line Graph)
    const stressData = timeframe === "7d" ? mockHealthData.stress.weeklyData : mockHealthData.stress.monthlyData;
    renderSVGLineChart(elements.chartStress, {
        labels: labels,
        values: stressData,
        min: 0,
        max: 10,
        lineColor: "#c86d3b",
        fillColor: "rgba(200, 109, 59, 0.08)",
        unit: "/10"
    });

    // Sleep Chart (Bar Chart)
    const sleepData = timeframe === "7d" ? mockHealthData.sleep.weeklyData : mockHealthData.sleep.monthlyData;
    renderSVGBarChart(elements.chartSleep, {
        labels: labels,
        values: sleepData,
        min: 0,
        max: 12,
        barColor: "#4a6984",
        unit: "h"
    });

    // Overall Wellbeing Chart (Area Graph)
    const wellbeingData = timeframe === "7d" ? mockHealthData.wellbeing.weeklyData : mockHealthData.wellbeing.monthlyData;
    renderSVGLineChart(elements.chartWellbeing, {
        labels: labels,
        values: wellbeingData,
        min: 0,
        max: 100,
        lineColor: "#2b5c53",
        fillColor: "rgba(43, 92, 83, 0.12)",
        unit: "%"
    });
}

function renderSVGLineChart(container, options) {
    if (!container) return;
    container.innerHTML = "";

    const width = 500;
    const height = 200;
    const padding = { top: 20, right: 25, bottom: 35, left: 40 };

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const values = options.values;
    const labels = options.labels;
    const count = values.length;

    // Point calculations
    const points = values.map((val, idx) => {
        const x = padding.left + (idx / (count - 1)) * chartW;
        const normalizedVal = (val - options.min) / (options.max - options.min);
        const y = padding.top + chartH - normalizedVal * chartH;
        return { x, y, val };
    });

    // Smooth Bezier path calculation
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
        const curr = points[i];
        const next = points[i + 1];
        const cpX = (curr.x + next.x) / 2;
        pathD += ` C ${cpX} ${curr.y}, ${cpX} ${next.y}, ${next.x} ${next.y}`;
    }

    const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

    // SVG elements build
    let svgHTML = `
        <svg viewBox="0 0 ${width} ${height}" class="custom-svg-chart" aria-label="Line graph visualization">
            <!-- Grid Lines -->
            <line x1="${padding.left}" y1="${padding.top}" x2="${width - padding.right}" y2="${padding.top}" stroke="#eee" stroke-dasharray="3 3" />
            <line x1="${padding.left}" y1="${padding.top + chartH / 2}" x2="${width - padding.right}" y2="${padding.top + chartH / 2}" stroke="#eee" stroke-dasharray="3 3" />
            <line x1="${padding.left}" y1="${padding.top + chartH}" x2="${width - padding.right}" y2="${padding.top + chartH}" stroke="#e0ded7" />
            
            <!-- Area Fill -->
            <path d="${areaD}" fill="${options.fillColor}" />
            
            <!-- Curve Line -->
            <path d="${pathD}" fill="none" stroke="${options.lineColor}" stroke-width="2.5" stroke-linecap="round" />
    `;

    // Points and Labels
    points.forEach((pt, i) => {
        svgHTML += `
            <circle cx="${pt.x}" cy="${pt.y}" r="4" fill="${options.lineColor}" stroke="#fff" stroke-width="2" class="chart-point" data-tooltip="${labels[i]}: ${pt.val}${options.unit}">
                <title>${labels[i]}: ${pt.val}${options.unit}</title>
            </circle>
            <text x="${pt.x}" y="${height - 10}" text-anchor="middle" font-size="11" fill="#757c70" font-family="var(--font-sans)">${labels[i]}</text>
        `;
    });

    svgHTML += `</svg>`;
    container.innerHTML = svgHTML;
}

function renderSVGBarChart(container, options) {
    if (!container) return;
    container.innerHTML = "";

    const width = 500;
    const height = 200;
    const padding = { top: 20, right: 25, bottom: 35, left: 40 };

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const values = options.values;
    const labels = options.labels;
    const count = values.length;
    const barWidth = Math.min(32, (chartW / count) * 0.55);

    let svgHTML = `
        <svg viewBox="0 0 ${width} ${height}" class="custom-svg-chart" aria-label="Bar chart visualization">
            <!-- Grid Lines -->
            <line x1="${padding.left}" y1="${padding.top}" x2="${width - padding.right}" y2="${padding.top}" stroke="#eee" stroke-dasharray="3 3" />
            <line x1="${padding.left}" y1="${padding.top + chartH / 2}" x2="${width - padding.right}" y2="${padding.top + chartH / 2}" stroke="#eee" stroke-dasharray="3 3" />
            <line x1="${padding.left}" y1="${padding.top + chartH}" x2="${width - padding.right}" y2="${padding.top + chartH}" stroke="#e0ded7" />
    `;

    values.forEach((val, i) => {
        const xCenter = padding.left + (i + 0.5) * (chartW / count);
        const barX = xCenter - barWidth / 2;
        const normalizedVal = (val - options.min) / (options.max - options.min);
        const barH = normalizedVal * chartH;
        const barY = padding.top + chartH - barH;

        svgHTML += `
            <rect x="${barX}" y="${barY}" width="${barWidth}" height="${barH}" rx="4" fill="${options.barColor}" opacity="0.85" class="chart-bar">
                <title>${labels[i]}: ${val}${options.unit}</title>
            </rect>
            <text x="${xCenter}" y="${height - 10}" text-anchor="middle" font-size="11" fill="#757c70" font-family="var(--font-sans)">${labels[i]}</text>
        `;
    });

    svgHTML += `</svg>`;
    container.innerHTML = svgHTML;
}

/* ==========================================================================
   8. TIMETABLE / DAILY SCHEDULE RENDERER
   ========================================================================== */

function renderSchedule() {
    if (!elements.scheduleContainer) return;
    elements.scheduleContainer.innerHTML = "";

    mockSchedule.forEach(item => {
        const card = document.createElement("div");
        card.className = `timetable-row ${item.status === "completed" ? "completed" : ""}`;
        
        card.innerHTML = `
            <div class="time-col">${item.time}</div>
            <div class="timeline-indicator">
                <span class="timeline-dot ${item.status}"></span>
                <span class="timeline-line"></span>
            </div>
            <div class="content-col">
                <div class="item-header">
                    <h4 class="item-title">${escapeHTML(item.title)}</h4>
                    <span class="category-badge tag-${item.category.toLowerCase()}">${item.category}</span>
                </div>
                <p class="item-note">${escapeHTML(item.note)}</p>
            </div>
            <div class="action-col">
                <button type="button" class="status-toggle-btn" aria-label="Toggle completed state" data-id="${item.id}">
                    ${item.status === "completed" ? "✓ Done" : "Mark Done"}
                </button>
            </div>
        `;

        // Toggle item completed state
        const toggleBtn = card.querySelector(".status-toggle-btn");
        if (toggleBtn) {
            toggleBtn.addEventListener("click", () => {
                item.status = item.status === "completed" ? "upcoming" : "completed";
                renderSchedule();
            });
        }

        elements.scheduleContainer.appendChild(card);
    });
}

/* ==========================================================================
   9. ADVICE & INSIGHTS RENDERER
   ========================================================================== */

function renderInsights() {
    if (!elements.insightsContainer) return;
    elements.insightsContainer.innerHTML = "";

    mockInsights.forEach(insight => {
        const card = document.createElement("div");
        card.className = "insight-card";
        
        card.innerHTML = `
            <div class="insight-header">
                <span class="insight-category">${escapeHTML(insight.category)}</span>
                <span class="insight-tag">${escapeHTML(insight.tag)}</span>
            </div>
            <h4 class="insight-title">${escapeHTML(insight.title)}</h4>
            <p class="insight-description">${escapeHTML(insight.description)}</p>
            <div class="insight-footer">
                <button type="button" class="insight-action-btn" data-id="${insight.id}">
                    ${escapeHTML(insight.actionText)} &rarr;
                </button>
            </div>
        `;

        elements.insightsContainer.appendChild(card);
    });
}

/* ==========================================================================
   10. EVENT LISTENERS & BACKEND INITIALIZATION
   ========================================================================== */

function initEventListeners() {
    // Nav links click handler
    elements.navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetView = link.getAttribute("data-nav");
            navigateTo(targetView);
        });
    });

    // Login form submit
    if (elements.loginForm) {
        elements.loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const emailVal = elements.loginEmail ? elements.loginEmail.value.trim() : "aman@university.edu";
            const passVal = elements.loginPassword ? elements.loginPassword.value.trim() : "password123";

            appState.auth.email = emailVal;
            appState.auth.password = passVal;

            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: emailVal, password: passVal })
                });

                if (response.ok) {
                    const userData = await response.json();
                    mockUserData.name = userData.name;
                    mockUserData.email = userData.email;
                    mockUserData.role = userData.role;
                    mockUserData.wellbeingScore = userData.wellbeing_score;
                }
            } catch (err) {
                console.warn("Backend auth offline, continuing with credentials:", err);
            }

            navigateTo("onboarding");
            renderChatHistory();
        });
    }

    // Chat submit & suggested chips
    if (elements.chatSendBtn) {
        elements.chatSendBtn.addEventListener("click", () => {
            sendChatMessage(elements.chatInput.value);
        });
    }

    if (elements.chatInput) {
        elements.chatInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                sendChatMessage(elements.chatInput.value);
            }
        });
    }

    if (elements.chatContinueBtn) {
        elements.chatContinueBtn.addEventListener("click", () => {
            navigateTo("dashboard");
        });
    }

    // Voice Call Controls
    if (elements.vcMuteBtn) {
        elements.vcMuteBtn.addEventListener("click", () => {
            appState.voiceCall.isMuted = !appState.voiceCall.isMuted;
            updateVoiceCallUI();
        });
    }

    if (elements.vcSpeakerBtn) {
        elements.vcSpeakerBtn.addEventListener("click", () => {
            appState.voiceCall.isSpeakerOn = !appState.voiceCall.isSpeakerOn;
            updateVoiceCallUI();
        });
    }

    if (elements.vcEndBtn) {
        elements.vcEndBtn.addEventListener("click", () => {
            stopVoiceCallSimulation();
            navigateTo("dashboard");
        });
    }

    // Timeframe selector tabs in Monitoring
    elements.timeframeTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            elements.timeframeTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            appState.activeTimeframe = tab.getAttribute("data-timeframe");
            renderAllCharts();
        });
    });

    // Logout button
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener("click", () => {
            navigateTo("login");
        });
    }

    // Quick Voice Call Buttons across dashboard/nav
    const vcLaunchers = document.querySelectorAll("[data-action='start-voicecall']");
    vcLaunchers.forEach(btn => {
        btn.addEventListener("click", () => {
            navigateTo("voicecall");
        });
    });
}

/* ==========================================================================
   11. HELPER UTILITIES
   ========================================================================== */

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function getCurrentTimeString() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHTML(str) {
    if (!str) return "";
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

/* ==========================================================================
   12. APPLICATION ENTRY POINT
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    cacheDOMElements();
    initEventListeners();
    
    // Set initial view
    navigateTo("login");
});
