import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Hi! How can I help you navigate the Surplus Food Network today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text, history: messages })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I am having trouble connecting to the server.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: 'var(--primary)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: isOpen ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)',
          zIndex: 100
        }}
      >
        <MessageSquare size={28} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="glass-panel" style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '350px',
          height: '500px',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--glass-border)'
          }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>AI Assistant</h3>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                maxWidth: '80%',
                wordWrap: 'break-word'
              }}>
                {msg.text}
              </div>
            ))}
            {loading && <div style={{ alignSelf: 'flex-start', color: 'var(--text-muted)' }}>Thinking...</div>}
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="form-control"
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem' }}>Send</button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;
