import { useState, useEffect, useRef } from 'react'
import Message, { RocketIcon } from './Message'
import './App.css'

const API_URL = 'http://127.0.0.1:8000/chat'

function App() {
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('solace-chats')
    return saved ? JSON.parse(saved) : []
  })

  const [activeChat, setActiveChat] = useState(null)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [responseStyle, setResponseStyle] = useState('brief')

  const messagesEndRef = useRef(null)
  const sidebarListRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('solace-chats', JSON.stringify(chats))
  }, [chats])

  const currentChat = chats.find((c) => c.id === activeChat)
  const messages = currentChat ? currentChat.messages : []

  // Autoscroll chat area to bottom whenever messages/typing changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Autoscroll sidebar chat list to top whenever a new chat is added
  useEffect(() => {
    sidebarListRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [chats.length])

  function getTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  function handleNewChat() {
    setActiveChat(null)
    setInput('')
  }

  async function handleSend() {
    const text = input.trim()
    if (text === '') return

    setInput('')

    let chatId = activeChat
    const userMessage = { sender: 'You', text, time: getTime() }

    if (!chatId) {
      chatId = Date.now()
      const newChat = {
        id: chatId,
        title: text.slice(0, 30),
        date: getTime(),
        messages: [userMessage],
      }
      setChats((prev) => [newChat, ...prev])
      setActiveChat(chatId)
    } else {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId ? { ...chat, messages: [...chat.messages, userMessage] } : chat
        )
      )
    }

    setIsTyping(true)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, style: responseStyle }),
      })

      if (!response.ok) throw new Error('Bad response from server')

      const data = await response.json()
      const botReply = { sender: 'Solace', text: data.reply, time: getTime() }

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId ? { ...chat, messages: [...chat.messages, botReply] } : chat
        )
      )
    } catch (err) {
      const errorReply = {
        sender: 'Solace',
        text: "I'm having a little trouble connecting right now. Please try again in a moment.",
        time: getTime(),
      }
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId ? { ...chat, messages: [...chat.messages, errorReply] } : chat
        )
      )
    } finally {
      setIsTyping(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="app-layout">
      {/* Floating background orbs — purely decorative */}
      <div className="background-elements">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="sidebar">
        <div className="sidebar-header">
          <span className="app-name">
            <RocketIcon /> Solace
          </span>
        </div>

        <button className="new-chat-btn" onClick={handleNewChat}>
          + New conversation
        </button>

        <div className="section-label">Recent</div>
        <div className="chat-list" ref={sidebarListRef}>
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${chat.id === activeChat ? 'active' : ''}`}
              onClick={() => setActiveChat(chat.id)}
            >
              <span className="chat-item-icon">💬</span>
              <span className="chat-item-title">{chat.title}</span>
            </div>
          ))}
        </div>

        <div className="section-label">Response Style</div>
        <div className="style-toggle">
          <button
            className={responseStyle === 'brief' ? 'style-btn active' : 'style-btn'}
            onClick={() => setResponseStyle('brief')}
          >
            Brief
            <span>Concise</span>
          </button>
          <button
            className={responseStyle === 'detailed' ? 'style-btn active' : 'style-btn'}
            onClick={() => setResponseStyle('detailed')}
          >
            Detailed
            <span>In-depth</span>
          </button>
        </div>

        <div className="sidebar-footer">
          Solace is a companion, not a substitute for professional care.
        </div>
      </div>

      <div className="main-content">
        <div className="chat-container">
          <div className="chat-header">
            <div className="avatar bot-avatar">
              <RocketIcon />
            </div>
            <div className="header-text">
              <div className="header-title">Solace</div>
              <div className="header-subtitle">
                <span className="status-dot"></span> Your compassionate companion
              </div>
            </div>
            <span className="brief-pill">{responseStyle === 'brief' ? 'Brief' : 'Detailed'}</span>
          </div>

          {messages.length === 0 ? (
            <div className="empty-state">
              <h1>Solace</h1>
              <p>Your personal space to talk through anything on your mind.</p>
            </div>
          ) : (
            <div className="messages">
              {messages.map((msg, index) => (
                <Message key={index} sender={msg.sender} text={msg.text} time={msg.time} />
              ))}
              {isTyping && (
                <div className="message-row bot-row">
                  <div className="avatar bot-avatar">
                    <RocketIcon />
                  </div>
                  <div className="bubble bot-bubble typing-bubble">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          <div className="input-area">
            <div className="input-box">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Share what you're going through or how you're feeling..."
                rows={1}
              />
              <button onClick={handleSend}>➤</button>
            </div>
            <div className="disclaimer">
              Solace provides emotional support, not medical advice.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
