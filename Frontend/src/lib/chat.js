// src/lib/chat.js
import { apiFetch } from './api';

/**
 * Try to find (and, if backend supports it, create) a chat room
 * with the seller for a given listing.
 *
 * If your backend does not support creating rooms yet, this will:
 *  - return the existing room if found
 *  - otherwise throw an error explaining the server limitation
 */
export async function ensureRoomWithSeller({ sellerUserId, listingId }) {
  if (!sellerUserId) throw new Error('Missing sellerUserId');

  // 1) Look through existing rooms
  let rooms = [];
  try {
    const res = await apiFetch('/chat/rooms', { cache: 'no-store' });
    if (Array.isArray(res)) rooms = res;
  } catch (e) {
    // If we can't even list rooms, surface that error.
    throw new Error(e?.message || 'Failed to load chat rooms');
  }

  const match = rooms.find((r) => {
    const rListing = String(r.listing_id ?? '');
    const rP1 = String(r.participant1_id ?? '');
    const rP2 = String(r.participant2_id ?? '');
    const sId = String(sellerUserId ?? '');
    const byListing = listingId ? String(listingId) === rListing : true;
    const hasSeller = rP1 === sId || rP2 === sId;
    return byListing && hasSeller;
  });

  if (match) return match;

  // 2) No room found. Try to create (if your backend supports it).
  //    If your server still has only GET /chat/rooms, this will return 405.
  try {
    const created = await apiFetch('/chat/rooms', {
      method: 'POST',
      body: JSON.stringify({
        // Adjust keys to whatever your backend expects
        participant_id: sellerUserId,
        listing_id: listingId,
      }),
    });
    return created;
  } catch (e) {
    const msg = String(e?.message || '');
    if (msg.includes('405') || /Method Not Allowed/i.test(msg) || msg.includes('404')) {
      // Clear explanation for the UI
      throw new Error(
        'Method Not Allowed — your backend does not support creating chat rooms yet. ' +
          'Ask the server to add a POST /api/v1/chat/rooms or a “start chat” endpoint.'
      );
    }
    throw e;
  }
}
