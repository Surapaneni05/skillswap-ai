import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import { useAuth } from './AuthContext'

const ChatContext = createContext(null)
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080'

export function ChatProvider({ children }) {
  const { user } = useAuth()
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState({})
  const [typingUsers, setTypingUsers] = useState({})
  const clientRef = useRef(null)

  useEffect(() => {
    if (!user) return

    let client
    // Dynamic import to avoid Vite ESM/CJS crash with sockjs-client
    import('sockjs-client').then(({ default: SockJS }) => {
      const token = localStorage.getItem('accessToken')
      client = new Client({
        webSocketFactory: () => new SockJS(`${WS_URL}/ws`),
        connectHeaders: { Authorization: `Bearer ${token}` },
        onConnect: () => {
          setConnected(true)
          client.subscribe('/user/queue/messages', (frame) => {
            const msg = JSON.parse(frame.body)
            setMessages(prev => {
              const otherId = msg.senderId === user.id ? msg.receiverId : msg.senderId
              return { ...prev, [otherId]: [...(prev[otherId] || []), msg] }
            })
          })
          client.subscribe('/user/queue/typing', (frame) => {
            const { userId, isTyping } = JSON.parse(frame.body)
            setTypingUsers(prev => ({ ...prev, [userId]: isTyping }))
          })
        },
        onDisconnect: () => setConnected(false),
        onStompError: () => setConnected(false),
        reconnectDelay: 5000,
      })
      client.activate()
      clientRef.current = client
    }).catch(err => {
      console.warn('WebSocket not available:', err)
    })

    return () => {
      if (clientRef.current) clientRef.current.deactivate()
    }
  }, [user])

  const sendMessage = (receiverId, content) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({ receiverId, content }),
      })
    }
  }

  const sendTyping = (receiverId, isTyping) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: '/app/chat.typing',
        body: JSON.stringify({ receiverId, isTyping }),
      })
    }
  }

  const setConversationMessages = (userId, msgs) => {
    setMessages(prev => ({ ...prev, [userId]: msgs }))
  }

  return (
    <ChatContext.Provider value={{ connected, messages, typingUsers, sendMessage, sendTyping, setConversationMessages }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => useContext(ChatContext)
