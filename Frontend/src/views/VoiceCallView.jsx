import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import WaveformCanvas from "../components/WaveformCanvas";

export default function VoiceCallView({ onEndCall }) {
  const { auth, userProfile, API_BASE_URL } = useAuth();

  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [statusText, setStatusText] = useState("Tap the mic to speak…");
  const [transcriptText, setTranscriptText] = useState("");
  const [aiResponseText, setAiResponseText] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  // Use a ref for isSpeakerOn so callbacks always read the latest value
  // without needing to be recreated (fixes stale-closure bug).
  const isSpeakerOnRef = useRef(isSpeakerOn);
  useEffect(() => {
    isSpeakerOnRef.current = isSpeakerOn;
  }, [isSpeakerOn]);

  // Timer
  useEffect(() => {
    const timer = setInterval(
      () => setSecondsElapsed((prev) => prev + 1),
      1000,
    );
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // ── Real microphone capture via MediaRecorder ─────────────────────────────
  const startRecording = async () => {
    if (isRecording) return;

    // Request microphone access
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      setStatusText("Microphone access denied.");
      return;
    }

    setIsRecording(true);
    setStatusText("Recording… speak now");
    setTranscriptText("");
    setAiResponseText("");

    const chunks = [];
    const recorder = new MediaRecorder(stream);

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = async () => {
      // Stop all tracks to release the mic
      stream.getTracks().forEach((t) => t.stop());
      setIsRecording(false);
      setStatusText("Transcribing…");

      const audioBlob = new Blob(chunks, {
        type: recorder.mimeType || "audio/webm",
      });
      await sendAudioToBackend(audioBlob, recorder.mimeType);
    };

    // Record for up to 8 seconds, then auto-stop
    recorder.start();
    setTimeout(() => {
      if (recorder.state === "recording") recorder.stop();
    }, 8000);
  };

  const sendAudioToBackend = async (audioBlob, mimeType) => {
    try {
      const extension = mimeType?.includes("ogg")
        ? "ogg"
        : mimeType?.includes("mp4")
          ? "mp4"
          : "webm";

      const formData = new FormData();
      formData.append("file", audioBlob, `voice_input.${extension}`);

      const response = await fetch(`${API_BASE_URL}/voice`, {
        method: "POST",
        headers: {
          "X-User-Email": auth.email,
          "X-User-Password": auth.password,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setTranscriptText(data.transcript);
        setAiResponseText(data.response);
        setStatusText("AI Companion responded");

        // Speak the response if speaker is on — read from ref (no stale closure)
        if (isSpeakerOnRef.current && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(data.response);
          window.speechSynthesis.speak(utterance);
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      console.warn("Voice API error:", err);
      setStatusText("Could not reach AI Companion — try again.");
    }
  };

  const handleEndCall = () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    onEndCall();
  };

  return (
    <section
      className="view-screen active-view"
      id="view-voicecall"
      aria-label="Voice Call Screen"
    >
      <div
        className="voice-call-overlay"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(20, 30, 15, 0.85)",
          padding: "20px",
        }}
      >
        <div
          className="vc-content-card"
          style={{
            maxWidth: "420px",
            width: "100%",
            textAlign: "center",
            background: "#1c2818",
            borderRadius: "24px",
            padding: "36px 24px",
            color: "#fff",
            boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
          }}
        >
          <div
            className="vc-brand-tag"
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.12em",
              color: "#88a675",
              marginBottom: "1.5rem",
              fontWeight: 600,
            }}
          >
            MENTAL HEALTH AI COMPANION
          </div>

          <div
            className="vc-avatar-wrapper"
            style={{
              display: "inline-flex",
              marginBottom: "1.5rem",
              position: "relative",
            }}
          >
            <div
              className="vc-avatar"
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "#3d632c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.6rem",
                fontWeight: 700,
                border: "3px solid #6b9e54",
              }}
            >
              <span>MH</span>
            </div>
          </div>

          <h2
            style={{
              fontSize: "1.35rem",
              fontWeight: 600,
              marginBottom: "0.5rem",
            }}
          >
            Voice Session with AI Companion
          </h2>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: "1.5rem",
              letterSpacing: "0.1em",
              color: "#a3d98b",
              marginBottom: "0.5rem",
            }}
          >
            {formatDuration(secondsElapsed)}
          </p>
          <p
            style={{
              fontSize: "0.9rem",
              color: "#c0cbb8",
              marginBottom: "1rem",
            }}
          >
            {isMuted ? "Muted" : statusText}
          </p>

          {/* Transcript & AI response */}
          {transcriptText && (
            <div
              style={{
                margin: "1rem 0",
                padding: "0.75rem 1rem",
                background: "rgba(255,255,255,0.08)",
                borderRadius: "12px",
                fontSize: "0.85rem",
                textAlign: "left",
              }}
            >
              <p
                style={{
                  fontStyle: "italic",
                  color: "#a0b098",
                  marginBottom: "0.3rem",
                }}
              >
                "{transcriptText}"
              </p>
              {aiResponseText && (
                <p style={{ fontWeight: 500, color: "#e0f5d5" }}>
                  {aiResponseText}
                </p>
              )}
            </div>
          )}

          {/* Waveform */}
          <div
            style={{
              width: "100%",
              height: "60px",
              margin: "15px 0",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <WaveformCanvas isActive={isRecording} isMuted={isMuted} />
          </div>

          {/* Controls */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "24px",
              width: "100%",
              marginTop: "20px",
            }}
          >
            {/* Mute */}
            <button
              type="button"
              className={`vc-btn btn-control ${isMuted ? "btn-active" : ""}`}
              aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
              onClick={() => setIsMuted((prev) => !prev)}
            >
              <svg
                width="46"
                height="46"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  padding: "12px",
                  borderRadius: "50%",
                  background: isMuted
                    ? "rgba(255,255,255,0.3)"
                    : "rgba(255,255,255,0.1)",
                  color: "#fff",
                }}
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
              <span
                style={{
                  fontSize: "0.75rem",
                  marginTop: "4px",
                  color: "#c0cbb8",
                }}
              >
                {isMuted ? "Unmute" : "Mute"}
              </span>
            </button>

            {/* Record / Speak */}
            <button
              type="button"
              className="vc-btn"
              aria-label="Speak to AI Companion"
              onClick={startRecording}
              disabled={isRecording || isMuted}
              style={{ opacity: isRecording || isMuted ? 0.5 : 1 }}
            >
              <svg
                width="54"
                height="54"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  padding: "14px",
                  borderRadius: "50%",
                  background: isRecording ? "#c93b3b" : "#3d632c",
                  color: "#fff",
                  boxShadow: "0 4px 16px rgba(61,99,44,0.4)",
                }}
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
              <span
                style={{
                  fontSize: "0.75rem",
                  marginTop: "4px",
                  color: "#c0cbb8",
                }}
              >
                {isRecording ? "Listening…" : "Speak"}
              </span>
            </button>

            {/* End call */}
            <button
              type="button"
              className="vc-btn btn-endcall"
              aria-label="End Voice Call"
              onClick={handleEndCall}
            >
              <svg
                width="60"
                height="60"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  padding: "16px",
                  borderRadius: "50%",
                  background: "var(--color-danger)",
                  color: "#fff",
                  boxShadow: "0 4px 16px rgba(201, 59, 59, 0.5)",
                }}
              >
                <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
                <line x1="23" y1="1" x2="1" y2="23" />
              </svg>
              <span
                style={{
                  fontSize: "0.75rem",
                  marginTop: "4px",
                  color: "#ffaaaa",
                }}
              >
                End
              </span>
            </button>

            {/* Speaker toggle */}
            <button
              type="button"
              className={`vc-btn btn-control ${isSpeakerOn ? "btn-active" : ""}`}
              aria-label={isSpeakerOn ? "Turn speaker off" : "Turn speaker on"}
              onClick={() => setIsSpeakerOn((prev) => !prev)}
            >
              <svg
                width="46"
                height="46"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  padding: "12px",
                  borderRadius: "50%",
                  background: isSpeakerOn
                    ? "rgba(255,255,255,0.3)"
                    : "rgba(255,255,255,0.1)",
                  color: "#fff",
                }}
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
              <span
                style={{
                  fontSize: "0.75rem",
                  marginTop: "4px",
                  color: "#c0cbb8",
                }}
              >
                {isSpeakerOn ? "Speaker On" : "Speaker Off"}
              </span>
            </button>
          </div>

          <p
            style={{ fontSize: "0.75rem", color: "#5a6a52", marginTop: "16px" }}
          >
            Tap <strong style={{ color: "#88a675" }}>Speak</strong> to record up
            to 8 seconds, then the AI will respond.
          </p>
        </div>
      </div>
    </section>
  );
}
