'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  MessageSquare,
  Send,
  Phone,
  ArrowLeft,
  Search,
  ExternalLink,
  ShieldAlert,
  Check,
  CheckCheck,
  Clock,
  User,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  getConversations,
  getConversationById,
  getMessages,
  sendMessage,
  getOrCreateConversation,
  blockUser,
} from '@/lib/data/messaging';
import { ConversationWithDetails, Message } from '@/types';
import { formatPrice } from '@/lib/utils';

const QUICK_INQUIRIES = [
  'Hi! Is this still available?',
  'What is your best price?',
  'Is the price negotiable?',
  'Where can we meet for pickup?',
  'Can you share more details or photos?',
];

function MessagesContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [activeConv, setActiveConv] = useState<ConversationWithDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [loadingConvList, setLoadingConvList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBlocking, setIsBlocking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const targetConvId = searchParams.get('conv');
  const targetListingId = searchParams.get('listing');
  const targetSellerId = searchParams.get('seller');

  // 1. Initial Load of conversations & query param resolution
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoadingConvList(false);
      return;
    }

    async function loadData() {
      setLoadingConvList(true);
      setErrorMessage(null);
      try {
        // If query specifies a new inquiry with listing and seller
        if (targetListingId && targetSellerId) {
          if (user?.id === targetSellerId) {
            setErrorMessage('You cannot message yourself about your own listing.');
          } else {
            try {
              const newOrExisting = await getOrCreateConversation({
                listingId: targetListingId,
                buyerId: user!.id,
                sellerId: targetSellerId,
              });
              setSelectedConvId(newOrExisting.id);
            } catch (err: any) {
              setErrorMessage(err.message || 'Could not start conversation.');
            }
          }
        } else if (targetConvId) {
          setSelectedConvId(targetConvId);
        }

        const convs = await getConversations(user!.id);
        setConversations(convs);

        // If no conv selected yet but user has conversations, select the first one on desktop
        if (!targetListingId && !targetConvId && convs.length > 0 && window.innerWidth >= 768) {
          setSelectedConvId(convs[0].id);
        }
      } catch (err: any) {
        console.error('Failed to load conversations:', err);
      } finally {
        setLoadingConvList(false);
      }
    }

    loadData();
  }, [user, authLoading, targetConvId, targetListingId, targetSellerId]);

  // 2. Load active conversation details & messages when selectedConvId changes
  useEffect(() => {
    if (!user || !selectedConvId) {
      setActiveConv(null);
      setMessages([]);
      return;
    }

    let isMounted = true;

    async function fetchActiveThread() {
      setLoadingMessages(true);
      try {
        const convDetails = await getConversationById(selectedConvId!, user!.id);
        if (isMounted) {
          setActiveConv(convDetails);
        }

        const msgs = await getMessages(selectedConvId!, user!.id);
        if (isMounted) {
          setMessages(msgs);
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to load conversation.');
        }
      } finally {
        if (isMounted) {
          setLoadingMessages(false);
        }
      }
    }

    fetchActiveThread();

    // 3. Polling for new messages every 4 seconds
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    pollTimerRef.current = setInterval(async () => {
      if (!selectedConvId || !user) return;
      try {
        const freshMsgs = await getMessages(selectedConvId, user.id);
        setMessages((prev) => {
          if (freshMsgs.length !== prev.length || freshMsgs.some((m, idx) => m.id !== prev[idx]?.id)) {
            return freshMsgs;
          }
          return prev;
        });
      } catch {}
    }, 4000);

    return () => {
      isMounted = false;
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [selectedConvId, user]);

  // 4. Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Send Message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || !selectedConvId || !user || isSending) return;

    setIsSending(true);
    setErrorMessage(null);

    try {
      const newMsg = await sendMessage({
        conversationId: selectedConvId,
        senderId: user.id,
        content: textToSend,
      });

      setMessages((prev) => [...prev, newMsg]);
      setInputText('');

      // Refresh conversations list to update snippet & last_message_at
      const updatedConvs = await getConversations(user.id);
      setConversations(updatedConvs);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  // Handle Block User
  const handleBlockUser = async () => {
    if (!activeConv || !user) return;
    const otherPerson = activeConv.buyer_id === user.id ? activeConv.seller : activeConv.buyer;
    if (!otherPerson) return;

    if (!confirm(`Are you sure you want to block ${otherPerson.name}? You will no longer be able to message each other.`)) {
      return;
    }

    setIsBlocking(true);
    try {
      await blockUser(user.id, otherPerson.id);
      alert(`${otherPerson.name} has been blocked.`);
      setSelectedConvId(null);
      const convs = await getConversations(user.id);
      setConversations(convs);
    } catch {
      alert('Failed to block user. Please try again.');
    } finally {
      setIsBlocking(false);
    }
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter((c) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    const otherUser = c.buyer_id === user?.id ? c.seller : c.buyer;
    const userName = otherUser?.name?.toLowerCase() || '';
    const listingTitle = c.listing?.title?.toLowerCase() || '';
    const lastMsg = c.last_message?.content?.toLowerCase() || '';
    return userName.includes(q) || listingTitle.includes(q) || lastMsg.includes(q);
  });

  // Not logged in state
  if (!authLoading && !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Marketplace Messages</h1>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">
          Sign in or create an account to start chatting with verified buyers and sellers on Bazaar.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/login"
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/20 transition-all"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-all"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {errorMessage && (
        <div className="mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-rose-200 font-bold ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Chat Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl h-[calc(100vh-140px)] min-h-[550px] flex">
        
        {/* Left Column: Conversations List */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-slate-800 flex flex-col bg-slate-900/95 ${
            selectedConvId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              Messages
            </h1>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-medium border border-slate-700">
              {conversations.length} {conversations.length === 1 ? 'chat' : 'chats'}
            </span>
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b border-slate-800/80">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-all"
              />
            </div>
          </div>

          {/* Conversations Thread List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
            {loadingConvList ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                <p className="font-medium text-slate-400 mb-1">No conversations yet</p>
                <p className="text-xs text-slate-500 mb-4">
                  Browse items and message sellers to ask questions or make offers.
                </p>
                <Link
                  href="/search"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium hover:bg-indigo-600/30 transition-all"
                >
                  Explore Marketplace
                </Link>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const otherParty = conv.buyer_id === user?.id ? conv.seller : conv.buyer;
                const isSelected = conv.id === selectedConvId;
                const isBuyer = conv.buyer_id === user?.id;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`w-full text-left p-3.5 transition-all flex items-start gap-3 relative ${
                      isSelected
                        ? 'bg-indigo-600/15 border-l-4 border-indigo-500'
                        : 'hover:bg-slate-800/50'
                    }`}
                  >
                    {/* User Avatar */}
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-semibold text-sm shrink-0 overflow-hidden relative border border-slate-700">
                      {otherParty?.avatar_url ? (
                        <Image
                          src={otherParty.avatar_url}
                          alt={otherParty.name || 'User'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span>{otherParty?.name ? otherParty.name[0].toUpperCase() : 'U'}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-slate-200 truncate">
                          {otherParty?.name || 'Verified User'}
                        </span>
                        <span className="text-[11px] text-slate-500 shrink-0">
                          {conv.last_message_at
                            ? new Date(conv.last_message_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>

                      {/* Listing Reference Tag */}
                      {conv.listing && (
                        <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium mb-1 truncate">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                            {isBuyer ? 'Seller' : 'Buyer'}
                          </span>
                          <span className="truncate">{conv.listing.title}</span>
                        </div>
                      )}

                      {/* Message Preview Snippet */}
                      <p className="text-xs text-slate-400 truncate">
                        {conv.last_message ? conv.last_message.content : 'No messages yet'}
                      </p>
                    </div>

                    {conv.unread_count > 0 && (
                      <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[11px] font-bold flex items-center justify-center shrink-0 self-center">
                        {conv.unread_count}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation Pane */}
        <div
          className={`flex-1 flex flex-col bg-slate-950/50 ${
            !selectedConvId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeConv ? (
            <>
              {/* Chat Header */}
              {(() => {
                const otherParty = activeConv.buyer_id === user?.id ? activeConv.seller : activeConv.buyer;
                const phoneToCall = activeConv.listing?.phone || otherParty?.phone;

                return (
                  <div className="p-3.5 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Back button on mobile */}
                      <button
                        onClick={() => setSelectedConvId(null)}
                        className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                        title="Back to all conversations"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>

                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden relative border border-slate-700">
                        {otherParty?.avatar_url ? (
                          <Image
                            src={otherParty.avatar_url}
                            alt={otherParty.name || 'User'}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span>{otherParty?.name ? otherParty.name[0].toUpperCase() : 'U'}</span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={otherParty?.id ? `/seller/${otherParty.id}` : '#'}
                            className="text-sm font-bold text-slate-100 hover:text-indigo-400 transition-colors flex items-center gap-1"
                          >
                            {otherParty?.name || 'Verified User'}
                          </Link>
                          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active" />
                        </div>
                        <p className="text-xs text-slate-400">
                          {otherParty?.location || 'Verified Marketplace Member'}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {phoneToCall && (
                        <a
                          href={`tel:${phoneToCall}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-semibold transition-all"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Call</span>
                        </a>
                      )}

                      <button
                        onClick={handleBlockUser}
                        disabled={isBlocking}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Block user"
                      >
                        <ShieldAlert className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Attached Listing Info Card */}
              {activeConv.listing && (
                <div className="p-3 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden relative shrink-0 border border-slate-700">
                      {activeConv.listing.images && activeConv.listing.images.length > 0 ? (
                        <Image
                          src={activeConv.listing.images[0].image_url}
                          alt={activeConv.listing.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">
                        {activeConv.listing.title}
                      </p>
                      <p className="text-xs font-bold text-emerald-400">
                        {formatPrice(activeConv.listing.price)}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/listing/${activeConv.listing.id}`}
                    target="_blank"
                    className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
                  >
                    View Listing
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Security Advisory */}
                <div className="text-center my-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Bazaar Safety: Inspect item in person before making any payment.
                  </div>
                </div>

                {loadingMessages ? (
                  <div className="py-12 text-center text-slate-500 text-sm">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading conversation...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-slate-400 text-sm mb-4">
                      No messages yet. Send a quick inquiry to start the conversation!
                    </p>
                    {/* Quick inquiry chips */}
                    <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                      {QUICK_INQUIRIES.map((inquiry, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(inquiry)}
                          className="px-3 py-1.5 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-all"
                        >
                          {inquiry}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === user?.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                            isMe
                              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-none'
                              : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-none'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words leading-relaxed">
                            {msg.content}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 px-1">
                          <span className="text-[10px] text-slate-500">
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isMe && (
                            <span className="text-slate-500">
                              {msg.is_read ? (
                                <CheckCheck className="w-3 h-3 text-indigo-400" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Bar */}
              <div className="p-3 bg-slate-900 border-t border-slate-800">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isSending}
                    className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 transition-all disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isSending}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* Empty state when no conversation is selected */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-slate-600">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-base font-semibold text-slate-300 mb-1">
                Select a conversation
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Choose a chat from the left or open any marketplace listing and click &ldquo;Message Seller&rdquo; to start discussing an item.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          Loading messages...
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
