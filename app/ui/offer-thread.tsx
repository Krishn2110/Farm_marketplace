"use client";

import { useEffect, useEffectEvent, useState, useRef } from "react";
import { 
  MessageSquare, 
  User, 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  Send,
  Loader2,
  MoreVertical,
  Reply,
  Copy,
  Check,
  AlertCircle
} from "lucide-react";
import type { OfferThreadView } from "@/lib/types";

export function OfferThread({
  offerId,
  initialThread,
}: {
  offerId: string;
  initialThread: OfferThreadView;
}) {
  const [thread, setThread] = useState(initialThread);
  const [isPolling, setIsPolling] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const syncThread = useEffectEvent(async () => {
    try {
      const response = await fetch(`/api/offers/${offerId}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const nextThread = (await response.json()) as OfferThreadView;
      setThread(nextThread);
    } catch (error) {
      console.error("Failed to sync thread:", error);
    }
  });

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setIsSending(true);
    try {
      const response = await fetch(`/api/offers/${offerId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: newMessage }),
      });

      if (response.ok) {
        setNewMessage("");
        await syncThread();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const copyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.messages]);

  // Polling with cleanup
  useEffect(() => {
    if (!isPolling) return;
    
    const timer = window.setInterval(() => {
      void syncThread();
    }, 5000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isPolling]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-emerald-100 p-2.5">
              <MessageSquare className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Live Negotiation</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Real-time conversation with {thread.counterpartyLabel}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Polling Status */}
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isPolling ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
              <span className="text-xs text-gray-500">
                {isPolling ? 'Live updates' : 'Paused'}
              </span>
            </div>
            
            {/* Message Count Badge */}
            <div className="rounded-full bg-gray-100 px-3 py-1.5">
              <span className="text-xs font-semibold text-gray-700">
                {thread.messages.length} message{thread.messages.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {/* Toggle Polling Button */}
            <button
              onClick={() => setIsPolling(!isPolling)}
              className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
              title={isPolling ? "Pause updates" : "Resume updates"}
            >
              <RefreshCw className={`h-4 w-4 text-gray-500 ${isPolling ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="h-[500px] overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white p-6 space-y-4"
      >
        {thread.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="rounded-full bg-gray-100 p-4 mb-3">
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">No messages yet</h3>
            <p className="text-sm text-gray-500">
              Start the conversation by sending a message
            </p>
          </div>
        ) : (
          thread.messages.map((message) => {
            const isCurrentUser = message.isCurrentUser;
            const timeAgo = formatTimestamp(message.createdAt);
            
            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`max-w-[80%] ${isCurrentUser ? 'lg:max-w-[70%]' : 'lg:max-w-[70%]'}`}>
                  {/* Message Bubble */}
                  <div className="relative group">
                    <div
                      className={`rounded-2xl px-4 py-3 shadow-sm ${
                        isCurrentUser
                          ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white"
                          : "bg-white border border-gray-200 text-gray-900"
                      }`}
                    >
                      {/* Sender Name (only for non-current user) */}
                      {!isCurrentUser && (
                        <div className="flex items-center gap-2 mb-2 pb-1 border-b border-gray-100">
                          <div className="rounded-full bg-gray-100 p-1">
                            <User className="h-3 w-3 text-gray-600" />
                          </div>
                          <p className="text-xs font-semibold text-gray-700">
                            {message.senderName}
                          </p>
                        </div>
                      )}
                      
                      {/* Message Text */}
                      <p className="text-sm leading-relaxed break-words">
                        {message.text}
                      </p>
                      
                      {/* Timestamp */}
                      <div className={`flex items-center gap-1.5 mt-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                        <Clock className="h-3 w-3 opacity-60" />
                        <span className={`text-xs opacity-70 ${isCurrentUser ? 'text-white' : 'text-gray-500'}`}>
                          {timeAgo}
                        </span>
                        {isCurrentUser && (
                          <CheckCircle2 className="h-3 w-3 opacity-70" />
                        )}
                      </div>
                    </div>
                    
                    {/* Message Actions (copy) */}
                    <button
                      onClick={() => copyMessage(message.text, message.id)}
                      className={`absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                        isCurrentUser ? '-left-8' : '-right-8'
                      }`}
                    >
                      <div className="rounded-full bg-white shadow-md border border-gray-200 p-1.5 hover:bg-gray-50">
                        {copiedId === message.id ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3 text-gray-500" />
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-100 bg-white p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type your message..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all resize-none"
              rows={2}
              disabled={isSending}
            />
            {isSending && (
              <div className="absolute bottom-3 right-3">
                <Loader2 className="h-4 w-4 text-emerald-600 animate-spin" />
              </div>
            )}
          </div>
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending}
            className="self-end rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-3 text-white font-semibold text-sm hover:shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        
        {/* Info Note */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-3 w-3 text-gray-400" />
            <p className="text-xs text-gray-500">
              Messages update every 5 seconds
            </p>
          </div>
          <p className="text-xs text-gray-400">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Add styles for animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
}