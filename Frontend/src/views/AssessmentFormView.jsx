import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

// ── Form definition ────────────────────────────────────────────────────────
const SECTIONS = [
    {
        id: "s1",
        title: "Section 1 — Current Emotional State",
        questions: [
            {
                id: "q1",
                text: "How have you been feeling emotionally in the past 2 weeks?",
                type: "single",
                options: ["Very good", "Good", "Okay / neither good nor bad", "Not good", "Very difficult"],
            },
            {
                id: "q2",
                text: "How often have you felt worried, nervous, or anxious?",
                type: "single",
                options: ["Never", "Rarely", "Sometimes", "Often", "Almost always"],
            },
            {
                id: "q3",
                text: "How often have you felt sad, low, or emotionally overwhelmed?",
                type: "single",
                options: ["Never", "Rarely", "Sometimes", "Often", "Almost always"],
            },
            {
                id: "q4",
                text: "How often have you felt afraid or unsafe because of what has happened?",
                type: "single",
                options: ["Never", "Rarely", "Sometimes", "Often", "Almost always"],
            },
        ],
    },
    {
        id: "s2",
        title: "Section 2 — Thoughts and Memories",
        questions: [
            {
                id: "q5",
                text: "Do unwanted memories or thoughts about what happened come to your mind?",
                type: "single",
                options: ["Never", "Rarely", "Sometimes", "Often", "Very often"],
            },
            {
                id: "q6",
                text: "How difficult is it to stop thinking about what happened when you don't want to think about it?",
                type: "single",
                options: ["Not difficult", "Slightly difficult", "Moderately difficult", "Very difficult", "Extremely difficult"],
            },
            {
                id: "q7",
                text: "Do you try to avoid people, places, conversations, or situations that remind you of what happened?",
                type: "single",
                options: ["Never", "Rarely", "Sometimes", "Often", "Almost always"],
            },
        ],
    },
    {
        id: "s3",
        title: "Section 3 — Sleep and Daily Life",
        questions: [
            {
                id: "q8",
                text: "How has your sleep been recently?",
                type: "single",
                options: ["Sleeping normally", "Slightly disturbed", "Frequently disturbed", "Very poor", "Almost unable to sleep"],
            },
            {
                id: "q9",
                text: "How often do you feel tired or without energy during the day?",
                type: "single",
                options: ["Never", "Rarely", "Sometimes", "Often", "Almost always"],
            },
            {
                id: "q10",
                text: "How much has your emotional state affected your normal daily activities? (e.g. studying, working, eating, travelling)",
                type: "single",
                options: ["Not at all", "A little", "Moderately", "A lot", "Extremely"],
            },
        ],
    },
    {
        id: "s4",
        title: "Section 4 — Social Support",
        questions: [
            {
                id: "q11",
                text: "How supported do you currently feel by your family or people you trust?",
                type: "single",
                options: ["Very supported", "Supported", "Somewhat supported", "Very little support", "No support"],
            },
            {
                id: "q12",
                text: "How often do you feel alone or isolated?",
                type: "single",
                options: ["Never", "Rarely", "Sometimes", "Often", "Almost always"],
            },
        ],
    },
    {
        id: "s5",
        title: "Section 5 — Current Safety",
        questions: [
            {
                id: "q13",
                text: "Do you currently feel that someone may threaten, harm, or intimidate you?",
                type: "single",
                danger: true, // triggers safety pathway on last option
                options: [
                    "No",
                    "Not sure",
                    "Yes, slightly concerned",
                    "Yes, very concerned",
                    "Yes, I feel in immediate danger",
                ],
            },
            {
                id: "q14",
                text: "Have threats or pressure from others affected your willingness to participate in the legal process?",
                type: "single",
                options: ["No", "Not sure", "A little", "Moderately", "A lot"],
            },
        ],
    },
    {
        id: "s6",
        title: "Section 6 — Physical / Emotional Reactions",
        questions: [
            {
                id: "q15",
                text: "Do you experience strong physical reactions when reminded of what happened? (e.g. increased heartbeat, sweating, shaking, difficulty breathing)",
                type: "single",
                options: ["Never", "Rarely", "Sometimes", "Often", "Almost always"],
            },
            {
                id: "q16",
                text: "How difficult is it for you to concentrate on normal activities?",
                type: "single",
                options: ["Not difficult", "Slightly difficult", "Moderately difficult", "Very difficult", "Extremely difficult"],
            },
            {
                id: "q17",
                text: "How often do you feel unusually alert or watchful because you are worried something might happen?",
                type: "single",
                options: ["Never", "Rarely", "Sometimes", "Often", "Almost always"],
            },
        ],
    },
    {
        id: "s7",
        title: "Section 7 — Overall Self-Assessment",
        questions: [
            {
                id: "q18",
                text: "Overall, how would you describe your current emotional condition?",
                type: "single",
                options: [
                    "I am doing well",
                    "I am slightly struggling",
                    "I am moderately struggling",
                    "I am struggling a lot",
                    "I feel that I am unable to cope",
                ],
            },
            {
                id: "q19",
                text: "How much support do you feel you need right now?",
                type: "single",
                options: [
                    "I don't need support currently",
                    "I would like some support",
                    "I need regular support",
                    "I need urgent support",
                    "I'm not sure",
                ],
            },
            {
                id: "q20",
                text: "What type of support would you prefer?",
                type: "multi",
                options: [
                    "Just continue monitoring my well-being",
                    "Talk to a counsellor",
                    "Medical / mental-health professional",
                    "Legal support",
                    "Safety / witness protection support",
                    "Financial / rehabilitation support",
                    "Someone to contact me regularly",
                    "I am not sure",
                ],
            },
        ],
    },
];

const ALL_QUESTIONS = SECTIONS.flatMap((s) => s.questions);
const TOTAL = ALL_QUESTIONS.length;

const DANGER_ANSWER = "Yes, I feel in immediate danger";

// ── Helpers ────────────────────────────────────────────────────────────────
function isAnswered(qid, responses) {
    const v = responses[qid];
    if (!v) return false;
    if (Array.isArray(v)) return v.length > 0;
    return v.trim() !== "";
}

// ── Sub-components ─────────────────────────────────────────────────────────
function SingleChoice({ question, value, onChange }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {question.options.map((opt) => {
                const selected = value === opt;
                const isDanger = question.danger && opt === DANGER_ANSWER;
                return (
                    <label
                        key={opt}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "12px 16px",
                            borderRadius: "var(--radius-md)",
                            border: `1.5px solid ${selected ? (isDanger ? "#c93b3b" : "var(--color-primary)") : "var(--color-border)"}`,
                            background: selected
                                ? isDanger
                                    ? "#fdf2f2"
                                    : "var(--color-primary-light)"
                                : "var(--color-card-bg)",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            fontSize: "0.93rem",
                            color: isDanger && selected ? "#c93b3b" : "var(--color-text-main)",
                            fontWeight: selected ? 600 : 400,
                        }}
                    >
                        <input
                            type="radio"
                            name={question.id}
                            value={opt}
                            checked={selected}
                            onChange={() => onChange(opt)}
                            style={{ accentColor: isDanger ? "#c93b3b" : "var(--color-primary)", width: "16px", height: "16px", flexShrink: 0 }}
                        />
                        {opt}
                        {isDanger && (
                            <span style={{ marginLeft: "auto", fontSize: "0.75rem", fontWeight: 700, color: "#c93b3b" }}>
                                ⚠ Safety alert
                            </span>
                        )}
                    </label>
                );
            })}
        </div>
    );
}

function MultiChoice({ question, value = [], onChange }) {
    const toggle = (opt) => {
        const next = value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt];
        onChange(next);
    };
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {question.options.map((opt) => {
                const selected = value.includes(opt);
                return (
                    <label
                        key={opt}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "12px 16px",
                            borderRadius: "var(--radius-md)",
                            border: `1.5px solid ${selected ? "var(--color-primary)" : "var(--color-border)"}`,
                            background: selected ? "var(--color-primary-light)" : "var(--color-card-bg)",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            fontSize: "0.93rem",
                            fontWeight: selected ? 600 : 400,
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggle(opt)}
                            style={{ accentColor: "var(--color-primary)", width: "16px", height: "16px", flexShrink: 0 }}
                        />
                        {opt}
                    </label>
                );
            })}
        </div>
    );
}

function SafetyBanner({ onAcknowledge }) {
    return (
        <div style={{
            background: "#fff5f5",
            border: "2px solid #c93b3b",
            borderRadius: "var(--radius-lg)",
            padding: "28px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            marginTop: "8px",
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "1.8rem" }}>🚨</span>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#c93b3b" }}>
                    Immediate Safety Concern Detected
                </h3>
            </div>
            <p style={{ fontSize: "0.93rem", color: "#7a1f1f", lineHeight: 1.6 }}>
                You indicated that you feel in <strong>immediate danger</strong>. Your safety is the top
                priority. Please reach out to a trusted person or authority right away.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{
                    background: "#fff",
                    border: "1px solid #f0c0c0",
                    borderRadius: "var(--radius-md)",
                    padding: "14px 16px",
                    fontSize: "0.9rem",
                    color: "#5a1a1a",
                    lineHeight: 1.6,
                }}>
                    <strong>Emergency contacts:</strong><br />
                    • National Emergency: <strong>112</strong><br />
                    • Women Helpline: <strong>1091</strong><br />
                    • Police: <strong>100</strong><br />
                    • iCall (Mental Health): <strong>9152987821</strong>
                </div>
                <p style={{ fontSize: "0.85rem", color: "#7a1f1f" }}>
                    A support coordinator will also be notified based on your response.
                    You are not alone — help is available.
                </p>
            </div>
            <button
                type="button"
                onClick={onAcknowledge}
                style={{
                    background: "#c93b3b",
                    color: "#fff",
                    border: "none",
                    borderRadius: "var(--radius-md)",
                    padding: "12px 20px",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    cursor: "pointer",
                    alignSelf: "flex-start",
                }}
            >
                I understand — continue the assessment
            </button>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function AssessmentFormView({ onComplete }) {
    const { auth, API_BASE_URL, markFormSubmitted } = useAuth();

    const [responses, setResponses] = useState({});
    const [currentSection, setCurrentSection] = useState(0);
    const [showDangerBanner, setShowDangerBanner] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const section = SECTIONS[currentSection];
    const isLastSection = currentSection === SECTIONS.length - 1;

    // Count answered across ALL questions for progress bar
    const answeredCount = ALL_QUESTIONS.filter((q) => isAnswered(q.id, responses)).length;
    const progressPct = Math.round((answeredCount / TOTAL) * 100);

    // All questions in current section answered?
    const sectionComplete = section.questions.every((q) => isAnswered(q.id, responses));

    const setResponse = (qid, value) => {
        setResponses((prev) => ({ ...prev, [qid]: value }));
        // Check Q13 danger trigger
        if (qid === "q13" && value === DANGER_ANSWER) {
            setShowDangerBanner(true);
        } else if (qid === "q13" && value !== DANGER_ANSWER) {
            setShowDangerBanner(false);
        }
    };

    const handleNext = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setCurrentSection((prev) => prev + 1);
    };

    const handleBack = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setCurrentSection((prev) => prev - 1);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/submit-form`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Email": auth.email,
                    "X-User-Password": auth.password,
                },
                body: JSON.stringify({ responses }),
            });

            if (res.ok) {
                const data = await res.json();
                markFormSubmitted(data); // update AuthContext state
                onComplete();           // navigate to dashboard
            } else {
                const err = await res.json().catch(() => ({}));
                setSubmitError(err.detail || "Submission failed. Please try again.");
            }
        } catch {
            setSubmitError("Could not reach the server. Please check your connection.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section
            className="view-screen active-view"
            id="view-assessment"
            aria-label="Initial Assessment Form"
            style={{ background: "var(--color-bg)", minHeight: "100vh" }}
        >
            <div style={{
                maxWidth: "720px",
                width: "100%",
                margin: "0 auto",
                padding: "32px 20px 80px",
                display: "flex",
                flexDirection: "column",
                gap: "28px",
            }}>

                {/* ── Header ──────────────────────────────────────────────── */}
                <div>
                    <p style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.1em", color: "var(--color-primary)", marginBottom: "6px", textTransform: "uppercase" }}>
                        Initial Wellbeing Assessment
                    </p>
                    <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.9rem", fontWeight: 600, color: "var(--color-text-main)", marginBottom: "8px", lineHeight: 1.3 }}>
                        How are you doing?
                    </h1>
                    <p style={{ fontSize: "0.93rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                        This short assessment helps us understand your current wellbeing so we can
                        provide the right support. Your answers are private and stored securely.
                    </p>
                </div>

                {/* ── Progress bar ─────────────────────────────────────────── */}
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
                        <span>Section {currentSection + 1} of {SECTIONS.length}</span>
                        <span>{progressPct}% complete ({answeredCount}/{TOTAL} answered)</span>
                    </div>
                    <div style={{ height: "6px", background: "var(--color-border)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                        <div style={{
                            height: "100%",
                            width: `${progressPct}%`,
                            background: "var(--color-primary)",
                            borderRadius: "var(--radius-full)",
                            transition: "width 0.4s ease",
                        }} />
                    </div>
                </div>

                {/* ── Current section ──────────────────────────────────────── */}
                <div style={{
                    background: "var(--color-card-bg)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                    padding: "28px",
                    boxShadow: "var(--shadow-card)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "32px",
                }}>
                    <h2 style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "1.15rem",
                        fontWeight: 600,
                        color: "var(--color-primary)",
                        paddingBottom: "12px",
                        borderBottom: "1px solid var(--color-border-subtle)",
                    }}>
                        {section.title}
                    </h2>

                    {section.questions.map((q, qi) => (
                        <div key={q.id} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            <label style={{ fontSize: "0.97rem", fontWeight: 600, color: "var(--color-text-main)", lineHeight: 1.5 }}>
                                <span style={{ color: "var(--color-primary)", marginRight: "6px" }}>
                                    Q{ALL_QUESTIONS.findIndex((x) => x.id === q.id) + 1}.
                                </span>
                                {q.text}
                            </label>

                            {q.type === "single" ? (
                                <SingleChoice
                                    question={q}
                                    value={responses[q.id] || ""}
                                    onChange={(v) => setResponse(q.id, v)}
                                />
                            ) : (
                                <MultiChoice
                                    question={q}
                                    value={responses[q.id] || []}
                                    onChange={(v) => setResponse(q.id, v)}
                                />
                            )}

                            {/* Q13 danger banner */}
                            {q.id === "q13" && showDangerBanner && (
                                <SafetyBanner onAcknowledge={() => setShowDangerBanner(false)} />
                            )}
                        </div>
                    ))}
                </div>

                {/* ── Submit error ─────────────────────────────────────────── */}
                {submitError && (
                    <div style={{
                        background: "#fdf2f2",
                        border: "1px solid #f0c0c0",
                        borderRadius: "var(--radius-md)",
                        padding: "12px 16px",
                        fontSize: "0.88rem",
                        color: "var(--color-danger)",
                    }}>
                        {submitError}
                    </div>
                )}

                {/* ── Navigation buttons ───────────────────────────────────── */}
                <div style={{ display: "flex", gap: "12px", justifyContent: "space-between" }}>
                    {currentSection > 0 ? (
                        <button
                            type="button"
                            onClick={handleBack}
                            style={{
                                padding: "12px 24px",
                                fontSize: "0.93rem",
                                fontWeight: 600,
                                border: "1px solid var(--color-border)",
                                borderRadius: "var(--radius-md)",
                                background: "var(--color-card-bg)",
                                color: "var(--color-text-muted)",
                                cursor: "pointer",
                            }}
                        >
                            ← Back
                        </button>
                    ) : (
                        <div />
                    )}

                    {!isLastSection ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={!sectionComplete}
                            style={{
                                padding: "12px 28px",
                                fontSize: "0.93rem",
                                fontWeight: 600,
                                borderRadius: "var(--radius-md)",
                                background: sectionComplete ? "var(--color-primary)" : "var(--color-border)",
                                color: sectionComplete ? "#fff" : "var(--color-text-subtle)",
                                border: "none",
                                cursor: sectionComplete ? "pointer" : "not-allowed",
                                transition: "background 0.2s ease",
                            }}
                        >
                            Next →
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!sectionComplete || isSubmitting}
                            style={{
                                padding: "12px 28px",
                                fontSize: "0.93rem",
                                fontWeight: 600,
                                borderRadius: "var(--radius-md)",
                                background: sectionComplete && !isSubmitting ? "var(--color-primary)" : "var(--color-border)",
                                color: sectionComplete && !isSubmitting ? "#fff" : "var(--color-text-subtle)",
                                border: "none",
                                cursor: sectionComplete && !isSubmitting ? "pointer" : "not-allowed",
                                transition: "background 0.2s ease",
                            }}
                        >
                            {isSubmitting ? "Submitting…" : "Submit Assessment ✓"}
                        </button>
                    )}
                </div>

                <p style={{ fontSize: "0.78rem", color: "var(--color-text-subtle)", textAlign: "center" }}>
                    All responses are encrypted and used solely to personalise your support experience.
                </p>
            </div>
        </section>
    );
}
