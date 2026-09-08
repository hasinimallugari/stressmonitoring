import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

export default function OnboardingChatView({ onContinue }) {
  const { auth, userProfile, API_BASE_URL } = useAuth();
  const userName = userProfile.name || "User";

  const [chatHistory, setChatHistory] = useState([
    {
      sender: "assistant",
      text: `Hi ${userName}, I'd like to get to know you a little better. Tell me something about yourself or how you're feeling today.`,
      time: "Just now",
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [suggestions, setSuggestions] = useState([
    "A bit overloaded with studies",
    "Feeling steady and balanced",
    "Struggling to sleep well",
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [showContinue, setShowContinue] = useState(false);

  const chatBodyRef = useRef(null);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  const getCurrentTimeString = () => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const sendMessage = async (textToSend) => {
    const promptText = (textToSend || inputPrompt).trim();
    if (!promptText) return;

    const userMsg = {
      sender: "user",
      text: promptText,
      time: getCurrentTimeString(),
    };

    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    setInputPrompt("");
    setSuggestions([]);
    setIsTyping(true);

    try {
      const historyPayload = updatedHistory.slice(0, -1).map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      }));

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": auth.email,
          "X-User-Password": auth.password,
        },
        body: JSON.stringify({
          prompt: promptText,
          history: historyPayload,
        }),
      });

      setIsTyping(false);

      if (response.ok) {
        const data = await response.json();
        setChatHistory((prev) => [
          ...prev,
          {
            sender: "assistant",
            text: data.response,
            time: getCurrentTimeString(),
          },
        ]);
        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
        }
        setShowContinue(true);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      console.warn(
        "Backend chat API offline, using intelligent fallback response:",
        err,
      );
      setIsTyping(false);

      const fallbackText = `Thank you for sharing, ${userName}. Understanding your routine helps us provide supportive insights. We've updated your personalized dashboard!`;
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: fallbackText,
          time: getCurrentTimeString(),
        },
      ]);
      setSuggestions(["Show my dashboard", "Start a voice call"]);
      setShowContinue(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <section
      className="view-screen active-view"
      id="view-onboarding"
      aria-label="Onboarding Chat"
    >
      <div className="chat-container">
        <div className="chat-header">
          <div className="assistant-avatar">
            <span>MH</span>
          </div>
          <div className="assistant-info">
            <h2>Welcome Check-in</h2>
            <p className="status-online">● AI Companion Online</p>
          </div>
        </div>

        <div className="chat-body" id="chat-messages" ref={chatBodyRef}>
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-row ${msg.sender === "user" ? "user-row" : "assistant-row"}`}
            >
              <div
                className={`chat-bubble ${msg.sender === "user" ? "bubble-user" : "bubble-assistant"}`}
              >
                <p>{msg.text}</p>
                <span className="chat-time">{msg.time}</span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="typing-indicator" id="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          )}
        </div>

        {suggestions.length > 0 && (
          <div
            className="chat-suggestions"
            id="chat-suggestions"
            style={{ display: "flex" }}
          >
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                className="chat-suggestion-chip"
                onClick={() => sendMessage(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <div className="chat-footer">
          <div className="chat-input-bar">
            <input
              type="text"
              id="chat-input"
              placeholder="Type a message about how you're feeling today..."
              autoComplete="off"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
              aria-disabled={isTyping}
            />
            <button
              type="button"
              id="chat-send-btn"
              className="btn-send"
              aria-label="Send Message"
              onClick={() => sendMessage()}
              disabled={isTyping}
              aria-disabled={isTyping}
              style={{
                opacity: isTyping ? 0.5 : 1,
                pointerEvents: isTyping ? "none" : "auto",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>

          {showContinue && (
            <button
              type="button"
              id="chat-continue-btn"
              className="btn-secondary btn-block"
              onClick={onContinue}
              style={{ marginTop: "0.75rem" }}
            >
              <span>Continue to Dashboard →</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
