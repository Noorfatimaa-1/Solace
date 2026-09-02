function RocketIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 21C12 21 4 14.5 4 9.2C4 6.3 6.3 4 9.1 4C10.8 4 12 5 12 5C12 5 13.2 4 14.9 4C17.7 4 20 6.3 20 9.2C20 14.5 12 21 12 21Z"
        fill="currentColor"
      />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="7" r="4" fill="white" opacity="0.92" />
      <path
        d="M2 19c0-4.4 3.6-7.5 8-7.5s8 3.1 8 7.5"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.88"
      />
    </svg>
  )
}

function Message({ sender, text, time }) {
  const isUser = sender === 'You'

  return (
    <div className={`message-row ${isUser ? 'user-row' : 'bot-row'}`}>
      {!isUser && (
        <div className="avatar bot-avatar">
          <RocketIcon />
        </div>
      )}
      <div className="message-block">
        <div className={`bubble ${isUser ? 'user-bubble' : 'bot-bubble'}`}>
          <span className="bubble-text">{text}</span>
          <span className="timestamp">{time}</span>
        </div>
      </div>
      {isUser && (
        <div className="avatar user-avatar">
          <UserIcon />
        </div>
      )}
    </div>
  )
}

export { RocketIcon, UserIcon }
export default Message
