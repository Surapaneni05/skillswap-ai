import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { messageAPI, userAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import {
  RiSendPlaneFill, RiSearchLine, RiMessage2Line,
  RiEmotionLine, RiArrowLeftLine
} from 'react-icons/ri'

// Lazy-load EmojiPicker to prevent CJS module crash on startup
const EmojiPicker = lazy(() => import('emoji-picker-react'))

export default function Chat() {
  const { userId } = useParams()
  const { user }   = useAuth()
  const { messages: wsMessages, sendMessage: wsSend, sendTyping, setConversationMessages } = useChat()
  const navigate   = useNavigate()

  const [contacts, setContacts]   = useState([])
  const [selected, setSelected]   = useState(null)
  const [input, setInput]         = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [search, setSearch]       = useState('')
  const [loading, setLoading]     = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    messageAPI.getContacts().then(r => {
      setContacts(r.data)
      if (userId) {
        const found = r.data.find(c => c.id === parseInt(userId))
        if (found) selectContact(found)
        else userAPI.getById(parseInt(userId)).then(res => selectContact(res.data)).catch(() => {})
      }
    })
  }, [userId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [wsMessages, selected?.id])

  const selectContact = async (contact) => {
    setSelected(contact)
    setLoading(true)
    try {
      const { data } = await messageAPI.getConversation(contact.id)
      setConversationMessages(contact.id, data)
    } catch {} finally { setLoading(false) }
    navigate(`/chat/${contact.id}`, { replace: true })
  }

  const handleSend = () => {
    if (!input.trim() || !selected) return
    wsSend(selected.id, input.trim())
    sendTyping(selected.id, false)
    setInput('')
    setShowEmoji(false)
  }

  const messages = selected ? (wsMessages[selected.id] || []) : []
  const filteredContacts = contacts.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4 animate-fade-in">
      {/* Contacts sidebar */}
      <div className={`${selected ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-80 glass-dark border border-white/10`}>
        <div className="p-4 border-b border-white/10">
          <h2 className="font-display font-bold text-white mb-3 flex items-center gap-2">
            <RiMessage2Line className="w-5 h-5 text-primary-400" /> Messages
          </h2>
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input className="input-field pl-9 text-sm" placeholder="Search contacts..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.length === 0
            ? <div className="text-center py-12 text-slate-500 px-4">
                <RiMessage2Line className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs mt-1">Find a match and start chatting</p>
              </div>
            : filteredContacts.map(c => (
              <button key={c.id} onClick={() => selectContact(c)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left ${selected?.id === c.id ? 'bg-primary-500/10 border-r-2 border-primary-500' : ''}`}>
                {c.profileImage
                  ? <img src={`http://localhost:8080${c.profileImage}`} alt="" className="w-10 h-10 avatar flex-shrink-0" />
                  : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold flex-shrink-0">{c.name?.[0]}</div>
                }
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-white truncate">{c.name}</p>
                  <p className="text-xs text-slate-500 truncate">Tap to open chat</p>
                </div>
              </button>
            ))
          }
        </div>
      </div>

      {/* Chat area */}
      {selected ? (
        <div className="flex-1 flex flex-col glass-dark border border-white/10 min-w-0">
          {/* Chat header */}
          <div className="flex items-center gap-3 p-4 border-b border-white/10">
            <button onClick={() => { setSelected(null); navigate('/chat') }}
              className="lg:hidden text-slate-400 hover:text-white p-1">
              <RiArrowLeftLine className="w-5 h-5" />
            </button>
            {selected.profileImage
              ? <img src={`http://localhost:8080${selected.profileImage}`} alt="" className="w-9 h-9 avatar" />
              : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">{selected.name?.[0]}</div>
            }
            <div>
              <p className="font-semibold text-white text-sm">{selected.name}</p>
              <p className="text-xs text-accent-400">● Online</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading
              ? <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
              : messages.length === 0
                ? <div className="text-center py-12 text-slate-500">
                    <p className="text-sm">No messages yet. Say hi! 👋</p>
                  </div>
                : messages.map((msg, i) => {
                    const isMine = msg.senderId === user?.id
                    return (
                      <motion.div key={msg.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div>
                          <div className={isMine ? 'chat-bubble-sent' : 'chat-bubble-received'}>
                            {msg.content}
                          </div>
                          <p className={`text-[10px] text-slate-600 mt-1 ${isMine ? 'text-right' : 'text-left'}`}>
                            {msg.createdAt ? format(new Date(msg.createdAt), 'HH:mm') : 'now'}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })
            }
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10 relative">
            {showEmoji && (
              <div className="absolute bottom-full right-4 mb-2 z-10">
                <Suspense fallback={<div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />}>
                  <EmojiPicker onEmojiClick={e => setInput(p => p + e.emoji)} theme="dark" height={350} />
                </Suspense>
              </div>
            )}
            <div className="flex gap-2 items-end">
              <button onClick={() => setShowEmoji(!showEmoji)}
                className="text-slate-400 hover:text-primary-400 p-2 transition-colors flex-shrink-0">
                <RiEmotionLine className="w-5 h-5" />
              </button>
              <textarea rows={1} className="input-field text-sm flex-1 resize-none min-h-[42px] max-h-28"
                placeholder="Type a message..."
                value={input}
                onChange={e => { setInput(e.target.value); sendTyping(selected.id, e.target.value.length > 0) }}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }} />
              <button onClick={handleSend} disabled={!input.trim()}
                className="btn-primary p-2.5 rounded-xl flex-shrink-0 disabled:opacity-40">
                <RiSendPlaneFill className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center glass-dark border border-white/10">
          <div className="text-center text-slate-500">
            <RiMessage2Line className="w-20 h-20 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Select a conversation</p>
            <p className="text-sm mt-1">Or find a match to start chatting</p>
          </div>
        </div>
      )}
    </div>
  )
}
