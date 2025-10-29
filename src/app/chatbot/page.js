"use client";
import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import { Send, Bot, User as UserIcon } from "lucide-react";
import styles from "../../styles/chatboat.css";
export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Hi! I'm your Nutrition Assistant powered by Spoonacular API. Ask me about meal plans, calories, or healthy recipes!"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    "Suggest me a high-protein breakfast",
    "Give me a 2000 calorie meal plan",
    "Find recipes with chicken and broccoli",
    "What can I eat for weight loss?"
  ];

  const handleSuggestion = (question) => setInput(question);

  return (
    <>
      <Header />
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">🥗 AI Nutrition Assistant</h1>
          <p className="page-subtitle">Powered by Spoonacular API</p>
        </div>

        <div className="chat-container">
          <div className="messages-container">
            {messages.map((m, i) => (
              <div key={i} className={`message ${m.role === "user" ? "user-message" : "assistant-message"}`}>
                <div className="message-icon">
                  {m.role === "user" ? <UserIcon size={20} /> : <Bot size={20} />}
                </div>
                <div className="message-content">{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className="message assistant-message">
                <div className="message-icon"><Bot size={20} /></div>
                <div className="message-content">
                  <div className="typing-indicator"><span></span><span></span><span></span></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && (
            <div className="suggestions">
              <p className="suggestions-title">Try asking:</p>
              <div className="suggestions-grid">
                {suggestedQuestions.map((q, i) => (
                  <button key={i} onClick={() => handleSuggestion(q)} className="suggestion-btn">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about meals, recipes, or calories..."
              className="chat-input"
              disabled={loading}
            />
            <button type="submit" className="send-button" disabled={loading || !input.trim()}>
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
