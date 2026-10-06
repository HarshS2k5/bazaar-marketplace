import { createClient as createBrowserSupabase } from '@/lib/supabase/client';
import { isSupabaseConfigured, normalizeListing } from './listings';
import { Conversation, ConversationWithDetails, Message, UserBlock } from '@/types';

// In-memory fallback cache for development/offline testing
let fallbackConversations: ConversationWithDetails[] = [];
let fallbackMessages: { [convId: string]: Message[] } = {};
let fallbackBlocks: UserBlock[] = [];

/**
 * Checks if communication is blocked between two users
 */
export async function isUserBlocked(userA: string, userB: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabase();
      const { data } = await supabase
        .from('user_blocks')
        .select('id')
        .or(`and(blocker_id.eq.${userA},blocked_id.eq.${userB}),and(blocker_id.eq.${userB},blocked_id.eq.${userA})`)
        .limit(1);

      return Boolean(data && data.length > 0);
    } catch {
      return false;
    }
  }

  return fallbackBlocks.some(
    (b) =>
      (b.blocker_id === userA && b.blocked_id === userB) ||
      (b.blocker_id === userB && b.blocked_id === userA)
  );
}

/**
 * Block a user
 */
export async function blockUser(blockerId: string, blockedId: string): Promise<boolean> {
  if (blockerId === blockedId) return false;

  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabase();
      await supabase.from('user_blocks').insert({
        blocker_id: blockerId,
        blocked_id: blockedId,
      });
      return true;
    } catch (e) {
      console.error('Supabase blockUser error:', e);
      return false;
    }
  }

  if (!fallbackBlocks.some((b) => b.blocker_id === blockerId && b.blocked_id === blockedId)) {
    fallbackBlocks.push({
      id: crypto.randomUUID(),
      blocker_id: blockerId,
      blocked_id: blockedId,
      created_at: new Date().toISOString(),
    });
  }
  return true;
}

/**
 * Unblock a user
 */
export async function unblockUser(blockerId: string, blockedId: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabase();
      await supabase
        .from('user_blocks')
        .delete()
        .eq('blocker_id', blockerId)
        .eq('blocked_id', blockedId);
      return true;
    } catch (e) {
      console.error('Supabase unblockUser error:', e);
      return false;
    }
  }

  fallbackBlocks = fallbackBlocks.filter(
    (b) => !(b.blocker_id === blockerId && b.blocked_id === blockedId)
  );
  return true;
}

/**
 * Get or create a conversation between buyer and seller for a listing
 */
export async function getOrCreateConversation(params: {
  listingId?: string | null;
  buyerId: string;
  sellerId: string;
}): Promise<ConversationWithDetails> {
  const { listingId, buyerId, sellerId } = params;

  if (!buyerId || !sellerId) {
    throw new Error('Both buyer and seller IDs are required.');
  }

  if (buyerId === sellerId) {
    throw new Error('You cannot message yourself about your own listing.');
  }

  const blocked = await isUserBlocked(buyerId, sellerId);
  if (blocked) {
    throw new Error('Messaging is not available because one of the users has blocked communications.');
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabase();

      // Check if conversation already exists
      let query = supabase
        .from('conversations')
        .select(`
          *,
          listing:listings(*, images:listing_images(*)),
          buyer:profiles!buyer_id(*),
          seller:profiles!seller_id(*)
        `)
        .eq('buyer_id', buyerId)
        .eq('seller_id', sellerId);

      if (listingId) {
        query = query.eq('listing_id', listingId);
      }

      const { data: existing, error: searchErr } = await query.maybeSingle();

      if (!searchErr && existing) {
        return {
          ...existing,
          listing: existing.listing ? normalizeListing(existing.listing) : null,
          unread_count: 0,
        };
      }

      // Create new conversation
      const newId = crypto.randomUUID();
      const now = new Date().toISOString();

      const { data: created, error: insertErr } = await supabase
        .from('conversations')
        .insert({
          id: newId,
          listing_id: listingId || null,
          buyer_id: buyerId,
          seller_id: sellerId,
          created_at: now,
          updated_at: now,
          last_message_at: now,
        })
        .select(`
          *,
          listing:listings(*, images:listing_images(*)),
          buyer:profiles!buyer_id(*),
          seller:profiles!seller_id(*)
        `)
        .single();

      if (insertErr) throw insertErr;

      return {
        ...created,
        listing: created.listing ? normalizeListing(created.listing) : null,
        unread_count: 0,
      };
    } catch (e: any) {
      console.error('Supabase getOrCreateConversation error:', e);
      throw e;
    }
  }

  // Fallback for dev / tests
  const found = fallbackConversations.find(
    (c) =>
      c.buyer_id === buyerId &&
      c.seller_id === sellerId &&
      (!listingId || c.listing_id === listingId)
  );

  if (found) return found;

  const newConv: ConversationWithDetails = {
    id: crypto.randomUUID(),
    listing_id: listingId || null,
    buyer_id: buyerId,
    seller_id: sellerId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_message_at: new Date().toISOString(),
    unread_count: 0,
  };

  fallbackConversations.unshift(newConv);
  return newConv;
}

/**
 * Fetch all conversations for a user (as buyer or seller)
 */
export async function getConversations(userId: string): Promise<ConversationWithDetails[]> {
  if (!userId) return [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabase();
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          listing:listings(*, images:listing_images(*)),
          buyer:profiles!buyer_id(*),
          seller:profiles!seller_id(*)
        `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('last_message_at', { ascending: false });

      if (!error && data) {
        // Fetch last message & unread count for each conversation
        const results = await Promise.all(
          data.map(async (c: any) => {
            const { data: lastMsgs } = await supabase
              .from('messages')
              .select('*')
              .eq('conversation_id', c.id)
              .order('created_at', { ascending: false })
              .limit(1);

            const { count: unreadCount } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', c.id)
              .eq('is_read', false)
              .neq('sender_id', userId);

            return {
              ...c,
              listing: c.listing ? normalizeListing(c.listing) : null,
              last_message: lastMsgs?.[0] || null,
              unread_count: unreadCount || 0,
            };
          })
        );

        return results;
      }
    } catch (e) {
      console.warn('Supabase getConversations error:', e);
    }
  }

  return fallbackConversations.filter(
    (c) => c.buyer_id === userId || c.seller_id === userId
  );
}

/**
 * Fetch conversation by ID with security verification
 */
export async function getConversationById(
  conversationId: string,
  userId: string
): Promise<ConversationWithDetails | null> {
  if (!conversationId || !userId) return null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabase();
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          listing:listings(*, images:listing_images(*)),
          buyer:profiles!buyer_id(*),
          seller:profiles!seller_id(*)
        `)
        .eq('id', conversationId)
        .maybeSingle();

      if (!error && data) {
        // Security check: Must be buyer or seller
        if (data.buyer_id !== userId && data.seller_id !== userId) {
          throw new Error('Unauthorized to access this conversation.');
        }

        const { data: lastMsgs } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', data.id)
          .order('created_at', { ascending: false })
          .limit(1);

        return {
          ...data,
          listing: data.listing ? normalizeListing(data.listing) : null,
          last_message: lastMsgs?.[0] || null,
          unread_count: 0,
        };
      }
    } catch (e) {
      console.warn('Supabase getConversationById error:', e);
    }
  }

  const found = fallbackConversations.find(
    (c) => c.id === conversationId && (c.buyer_id === userId || c.seller_id === userId)
  );
  return found || null;
}

/**
 * Fetch all messages for a conversation and mark as read
 */
export async function getMessages(conversationId: string, userId: string): Promise<Message[]> {
  if (!conversationId || !userId) return [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabase();

      // Verify participant
      const { data: conv } = await supabase
        .from('conversations')
        .select('buyer_id, seller_id')
        .eq('id', conversationId)
        .single();

      if (!conv || (conv.buyer_id !== userId && conv.seller_id !== userId)) {
        throw new Error('Unauthorized.');
      }

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(*)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        // Mark unread messages sent by the other party as read
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('conversation_id', conversationId)
          .neq('sender_id', userId)
          .eq('is_read', false);

        return data as Message[];
      }
    } catch (e) {
      console.warn('Supabase getMessages error:', e);
    }
  }

  const msgs = fallbackMessages[conversationId] || [];
  msgs.forEach((m) => {
    if (m.sender_id !== userId) m.is_read = true;
  });
  return msgs;
}

/**
 * Send a message within a conversation
 */
export async function sendMessage(params: {
  conversationId: string;
  senderId: string;
  content: string;
}): Promise<Message> {
  const { conversationId, senderId, content } = params;

  if (!content || !content.trim()) {
    throw new Error('Message content cannot be empty.');
  }

  const cleanContent = content.trim();
  const newId = crypto.randomUUID();
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabase();

      // Verify sender is a conversation participant
      const { data: conv, error: convErr } = await supabase
        .from('conversations')
        .select('id, buyer_id, seller_id, listing_id')
        .eq('id', conversationId)
        .single();

      if (convErr || !conv || (conv.buyer_id !== senderId && conv.seller_id !== senderId)) {
        throw new Error('Unauthorized: You are not a participant in this conversation.');
      }

      const recipientId = conv.buyer_id === senderId ? conv.seller_id : conv.buyer_id;

      // Check if blocked
      const blocked = await isUserBlocked(senderId, recipientId);
      if (blocked) {
        throw new Error('Cannot send message. Communication is restricted.');
      }

      // Insert message
      const { data: msg, error: msgErr } = await supabase
        .from('messages')
        .insert({
          id: newId,
          conversation_id: conversationId,
          sender_id: senderId,
          content: cleanContent,
          is_read: false,
          created_at: now,
        })
        .select(`
          *,
          sender:profiles!sender_id(*)
        `)
        .single();

      if (msgErr) throw msgErr;

      // Update conversation timestamps
      await supabase
        .from('conversations')
        .update({
          last_message_at: now,
          updated_at: now,
        })
        .eq('id', conversationId);

      // Create notification for recipient
      try {
        await supabase.from('notifications').insert({
          user_id: recipientId,
          type: 'new_message',
          title: 'New message on Bazaar',
          message: cleanContent.slice(0, 100),
          link: `/messages/${conversationId}`,
        });
      } catch {}

      return msg as Message;
    } catch (e: any) {
      console.error('Supabase sendMessage error:', e);
      throw e;
    }
  }

  // Fallback for dev
  const newMsg: Message = {
    id: newId,
    conversation_id: conversationId,
    sender_id: senderId,
    content: cleanContent,
    is_read: false,
    created_at: now,
  };

  if (!fallbackMessages[conversationId]) {
    fallbackMessages[conversationId] = [];
  }
  fallbackMessages[conversationId].push(newMsg);

  // Update conversation last_message_at
  const conv = fallbackConversations.find((c) => c.id === conversationId);
  if (conv) {
    conv.last_message_at = now;
    conv.last_message = newMsg;
  }

  return newMsg;
}

/**
 * Get total unread message count for a user across all conversations
 */
export async function getUnreadMessageCount(userId: string): Promise<number> {
  if (!userId) return 0;

  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabase();
      // Find conversations where user is a participant
      const { data: convs } = await supabase
        .from('conversations')
        .select('id')
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

      if (!convs || convs.length === 0) return 0;

      const convIds = convs.map((c) => c.id);

      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', convIds)
        .neq('sender_id', userId)
        .eq('is_read', false);

      return count || 0;
    } catch {
      return 0;
    }
  }

  let totalUnread = 0;
  for (const convId in fallbackMessages) {
    const msgs = fallbackMessages[convId] || [];
    totalUnread += msgs.filter((m) => m.sender_id !== userId && !m.is_read).length;
  }
  return totalUnread;
}
