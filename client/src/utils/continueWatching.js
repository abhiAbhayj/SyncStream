import axios from 'axios';
import { hydrateMediaQualities } from './mediaQuality.js';
import { DEFAULT_SERVER_KEY, normalizeServerKey } from './streamingServers.js';

const STORAGE_KEY = 'syncstream_continue_watching';
const TOMBSTONE_KEY = 'syncstream_cw_deleted_v1';
const RACE_GUARD_MS = 15000;
const PENDING_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// Monotonic mutation epoch prevents stale in-flight fetches/hydrations from overwriting deletions
let cwMutationEpoch = 0;
let flushPromise = null;
const inFlightSaves = new Map();

const getApiUrl = (path) => {
  const base = (axios.defaults.baseURL || '').replace(/\/$/, '');
  return `${base}${path}`;
};

const getItemKey = (mediaType, externalMediaId) => `${mediaType || 'unknown'}_${String(externalMediaId || '')}`;

const extractNumericRowId = (rawId) => {
  if (rawId === null || rawId === undefined) return null;
  const s = String(rawId).trim();
  return /^\d+$/.test(s) ? s : null;
};

const normalizeStoredItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map((item) => (
    item && typeof item === 'object'
      ? { ...item, server_key: normalizeServerKey(item.server_key || DEFAULT_SERVER_KEY) }
      : item
  ));
};

const readTombstones = () => {
  const now = Date.now();
  try {
    const raw = localStorage.getItem(TOMBSTONE_KEY);
    if (!raw) return { items: [], clears: {} };
    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed?.items)
      ? parsed.items.filter((t) => t && (
          (t.pendingSync && (now - (t.deletedAt || 0)) < PENDING_MAX_AGE_MS) ||
          (!t.pendingSync && (now - (t.deletedAt || 0)) < RACE_GUARD_MS)
        ))
      : [];
    const clears = {};
    if (parsed?.clears && typeof parsed.clears === 'object') {
      Object.entries(parsed.clears).forEach(([k, v]) => {
        if (!v) return;
        const keep = v.pendingSync
          ? (now - (v.deletedAt || 0)) < PENDING_MAX_AGE_MS
          : (now - (v.deletedAt || 0)) < RACE_GUARD_MS;
        if (keep) clears[k] = v;
      });
    }
    return { items, clears };
  } catch {
    return { items: [], clears: {} };
  }
};

const writeTombstones = (state) => {
  try {
    const items = Array.isArray(state?.items) ? state.items : [];
    const clears = state?.clears || {};
    if (items.length === 0 && Object.keys(clears).length === 0) {
      localStorage.removeItem(TOMBSTONE_KEY);
    } else {
      localStorage.setItem(TOMBSTONE_KEY, JSON.stringify({ items: items.slice(-60), clears }));
    }
  } catch (e) {
    console.warn('[ContinueWatching] Failed to persist tombstones:', e);
  }
};

const isItemTombstoned = (item, tombstones = readTombstones()) => {
  if (!item) return true;
  const itemExtId = String(item.external_media_id || '');
  const itemRowId = item.id !== undefined && item.id !== null ? String(item.id) : null;
  const itemType = item.media_type || '';
  const watchedTs = item.last_watched_at ? Date.parse(item.last_watched_at) : 0;

  const checkClearEntry = (entry) => {
    if (!entry) return false;
    if (entry.pendingSync) {
      return !watchedTs || watchedTs <= (entry.deletedAt + 2000);
    }
    return !watchedTs || watchedTs <= (entry.deletedAt + 2000);
  };

  if (tombstones.clears?.all && checkClearEntry(tombstones.clears.all)) {
    return true;
  }
  if (itemType && tombstones.clears?.[itemType] && checkClearEntry(tombstones.clears[itemType])) {
    return true;
  }

  return (tombstones.items || []).some((t) => {
    const rowMatch = t.rowId && itemRowId && String(t.rowId) === itemRowId;
    const extMatch = t.externalMediaId && itemExtId === String(t.externalMediaId) && (!t.mediaType || t.mediaType === itemType);
    const idFallbackMatch = !t.externalMediaId && t.targetId && (itemRowId === String(t.targetId) || (itemExtId === String(t.targetId) && (!t.mediaType || t.mediaType === itemType)));
    if (!rowMatch && !extMatch && !idFallbackMatch) return false;
    if (t.pendingSync) return true;
    return !watchedTs || watchedTs <= (t.deletedAt + 2000);
  });
};

const filterOutTombstoned = (items) => {
  if (!Array.isArray(items)) return [];
  const tombstones = readTombstones();
  return items.filter((item) => !isItemTombstoned(item, tombstones));
};

const addItemTombstone = ({ rowId, targetId, externalMediaId, mediaType, pendingSync }) => {
  const state = readTombstones();
  const deletedAt = Date.now();
  const key = getItemKey(mediaType, externalMediaId || targetId || rowId);
  const filtered = state.items.filter((t) => !(
    (t.key && t.key === key) ||
    (rowId && t.rowId && String(t.rowId) === String(rowId))
  ));
  filtered.push({
    key,
    rowId: rowId || null,
    targetId: targetId ? String(targetId) : null,
    externalMediaId: externalMediaId ? String(externalMediaId) : null,
    mediaType: mediaType || null,
    deletedAt,
    pendingSync: Boolean(pendingSync)
  });
  writeTombstones({ ...state, items: filtered });
};

const markItemTombstoneSynced = (key, rowId, externalMediaId, mediaType) => {
  const state = readTombstones();
  const items = state.items.map((t) => {
    const matches = (t.key === key) ||
      (rowId && t.rowId && String(t.rowId) === String(rowId)) ||
      (externalMediaId && t.externalMediaId === String(externalMediaId) && (!mediaType || t.mediaType === mediaType));
    return matches ? { ...t, pendingSync: false } : t;
  });
  writeTombstones({ ...state, items });
};

const clearItemTombstone = (externalMediaId, mediaType) => {
  const state = readTombstones();
  const extStr = String(externalMediaId || '');
  const items = state.items.filter((t) => !(
    t.externalMediaId === extStr && (!mediaType || !t.mediaType || t.mediaType === mediaType)
  ));
  const clears = { ...(state.clears || {}) };
  // Clearing/restoring an item supersedes older pending clears ONLY for explicitly re-recorded/restored items:
  // `isItemTombstoned` already checks `watchedTs <= entry.deletedAt`, so updating `last_watched_at = now` wins automatically.
  writeTombstones({ items, clears });
};

const sendKeepaliveDelete = async (path, token) => {
  const response = await fetch(getApiUrl(path), {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Cache-Control': 'no-cache'
    },
    keepalive: true
  });
  return response;
};

const buildDeletePath = ({ targetId, rowId, externalMediaId, mediaType }) => {
  const deleteId = externalMediaId || rowId || targetId;
  const params = new URLSearchParams();
  if (mediaType) params.append('media_type', mediaType);
  if (externalMediaId) params.append('external_id', String(externalMediaId));
  if (rowId) params.append('row_id', String(rowId));
  const queryStr = params.toString() ? `?${params.toString()}` : '';
  return `/api/media/continue-watching/${encodeURIComponent(String(deleteId))}${queryStr}`;
};

const abortAndAwaitInFlightSaves = async (matcherFn) => {
  const matching = [];
  for (const [k, entry] of inFlightSaves.entries()) {
    if (matcherFn(k, entry)) {
      try {
        entry.controller.abort();
      } catch {}
      matching.push(entry.promise.catch(() => {}));
    }
  }
  if (matching.length > 0) {
    await Promise.all(matching);
  }
};

export const flushPendingDeletes = async (token = localStorage.getItem('token')) => {
  if (!token) return;
  if (flushPromise) return flushPromise;

  flushPromise = (async () => {
    const state = readTombstones();
    const nextClears = { ...(state.clears || {}) };
    let changed = false;

    for (const [scope, entry] of Object.entries(nextClears)) {
      if (!entry?.pendingSync) continue;
      try {
        const path = scope !== 'all'
          ? `/api/media/continue-watching/all?media_type=${encodeURIComponent(scope)}`
          : '/api/media/continue-watching/all';
        const res = await sendKeepaliveDelete(path, token);
        if (res.ok || res.status === 404) {
          nextClears[scope] = { ...entry, pendingSync: false };
          changed = true;
        } else if (res.status === 401 || res.status === 403) {
          return;
        }
      } catch {
        // Keep pendingSync: true for retry on next load/online
      }
    }

    const nextItems = [];
    for (const item of (state.items || [])) {
      if (!item?.pendingSync) {
        nextItems.push(item);
        continue;
      }
      try {
        const path = buildDeletePath({
          targetId: item.targetId,
          rowId: item.rowId,
          externalMediaId: item.externalMediaId,
          mediaType: item.mediaType
        });
        const res = await sendKeepaliveDelete(path, token);
        if (res.ok || res.status === 404) {
          nextItems.push({ ...item, pendingSync: false });
          changed = true;
        } else if (res.status === 401 || res.status === 403) {
          nextItems.push(item);
        } else {
          nextItems.push(item);
        }
      } catch {
        nextItems.push(item);
      }
    }

    if (changed) {
      writeTombstones({ items: nextItems, clears: nextClears });
    }
  })().finally(() => {
    flushPromise = null;
  });

  return flushPromise;
};

/**
 * Read locally cached continue-watching items
 */
export const getLocalContinueWatching = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return filterOutTombstoned(normalizeStoredItems(parsed));
  } catch (e) {
    console.warn('[ContinueWatching] Failed to parse local storage cache:', e);
    return [];
  }
};

/**
 * Find saved progress for a specific media item
 */
export const getSavedProgress = (mediaId, mediaType = null) => {
  if (!mediaId) return null;
  const localList = getLocalContinueWatching();
  return localList.find((item) => {
    if (String(item.external_media_id) === String(mediaId)) {
      if (mediaType) return item.media_type === mediaType;
      return true;
    }
    return false;
  }) || null;
};

/**
 * Save items into local storage cache
 */
export const setLocalContinueWatching = (items) => {
  try {
    const safe = filterOutTombstoned(normalizeStoredItems(items));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safe.slice(0, 30)));
  } catch (e) {
    console.warn('[ContinueWatching] Failed to save local storage cache:', e);
  }
};

/**
 * Clear local client cache on logout so accounts never cross-contaminate or re-sync stale history
 */
export const clearContinueWatchingClientState = () => {
  cwMutationEpoch += 1;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOMBSTONE_KEY);
  } catch {}
  notifyContinueWatchingUpdated();
};

/**
 * Notify all mounted components that continue watching list has updated
 */
export const notifyContinueWatchingUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('syncstream:continue-watching-updated'));
  }
};

/**
 * Fetch Continue Watching items:
 * - Flushes any pending deletes first so removed items never come back from MySQL.
 * - Uses no-cache / cache-buster on GET to bypass stale HTTP/proxy caches.
 * - Guards against concurrent hydration or deletion races using cwMutationEpoch + tombstones.
 */
export const fetchContinueWatching = async () => {
  const token = localStorage.getItem('token');
  const localItems = getLocalContinueWatching();

  if (!token) {
    if (localItems.length > 0) {
      const startEpoch = cwMutationEpoch;
      const hydrated = await hydrateMediaQualities(localItems);
      const currentLocal = getLocalContinueWatching();
      if (startEpoch !== cwMutationEpoch) {
        // A deletion/addition occurred while hydrating: apply only metadata onto surviving local items
        const metaByKey = new Map(
          hydrated.map((h) => [getItemKey(h.media_type, h.external_media_id), h])
        );
        const merged = currentLocal.map((item) => {
          const h = metaByKey.get(getItemKey(item.media_type, item.external_media_id));
          return h
            ? {
                ...item,
                quality: h.quality || item.quality,
                release_date: h.release_date || item.release_date
              }
            : item;
        });
        setLocalContinueWatching(merged);
        return getLocalContinueWatching();
      }
      setLocalContinueWatching(hydrated);
      return getLocalContinueWatching();
    }
    return localItems;
  }

  try {
    await flushPendingDeletes(token);
    const startEpoch = cwMutationEpoch;
    const res = await axios.get('/api/media/continue-watching', {
      params: { _t: Date.now() },
      headers: {
        Authorization: `Bearer ${token}`,
        'Cache-Control': 'no-cache'
      }
    });

    if (Array.isArray(res.data)) {
      const serverItems = filterOutTombstoned(normalizeStoredItems(res.data));
      if (startEpoch !== cwMutationEpoch) {
        // Reconcile items modified locally during the GET (keep recent local additions, preserve deletions)
        const currentLocal = getLocalContinueWatching();
        const mergedMap = new Map();
        serverItems.forEach((it) => mergedMap.set(getItemKey(it.media_type, it.external_media_id), it));
        currentLocal.forEach((it) => {
          const k = getItemKey(it.media_type, it.external_media_id);
          const existing = mergedMap.get(k);
          if (!existing || Date.parse(it.last_watched_at || 0) >= Date.parse(existing.last_watched_at || 0)) {
            mergedMap.set(k, it);
          }
        });
        const reconciled = filterOutTombstoned(Array.from(mergedMap.values()));
        setLocalContinueWatching(reconciled);
        return getLocalContinueWatching();
      }
      setLocalContinueWatching(serverItems);
      return getLocalContinueWatching();
    }
    return localItems;
  } catch (err) {
    console.warn('[ContinueWatching] Failed to fetch from MySQL database, falling back to local cache:', err.message);
    return getLocalContinueWatching();
  }
};

/**
 * Record or update a continue-watching item:
 * 1. Clears any deletion tombstone for this media item
 * 2. Updates local storage immediately for zero-latency UI updates
 * 3. If authenticated, persists to MySQL database in continue_watching table
 */
export const recordContinueWatching = async ({
  external_media_id,
  media_type,
  title,
  poster_path,
  backdrop_path,
  season_number = null,
  episode_number = null,
  episode_title = null,
  chapter_id = null,
  chapter_number = null,
  chapter_title = null,
  server_key = DEFAULT_SERVER_KEY,
  release_date = null,
  quality = null,
  progress_seconds = 0,
  duration_seconds = 0
}) => {
  if (!external_media_id || !media_type || !title) return;

  cwMutationEpoch += 1;
  clearItemTombstone(external_media_id, media_type);

  const normalizedServer = normalizeServerKey(server_key || DEFAULT_SERVER_KEY);
  const nowIso = new Date().toISOString();

  const newItem = {
    id: `local_${external_media_id}_${media_type}`,
    external_media_id: String(external_media_id),
    media_type,
    title,
    poster_path: poster_path || null,
    backdrop_path: backdrop_path || null,
    season_number: season_number ? parseInt(season_number, 10) : null,
    episode_number: episode_number ? parseInt(episode_number, 10) : null,
    episode_title: episode_title || null,
    chapter_id: chapter_id ? String(chapter_id) : null,
    chapter_number: chapter_number ? String(chapter_number) : null,
    chapter_title: chapter_title || null,
    server_key: normalizedServer,
    release_date: release_date || null,
    quality: (quality === 'HD' || quality === 'CAM') ? quality : null,
    progress_seconds: parseInt(progress_seconds || '0', 10) || 0,
    duration_seconds: parseInt(duration_seconds || '0', 10) || 0,
    last_watched_at: nowIso
  };

  // 1. Update local cache
  const localList = getLocalContinueWatching();
  const existingIdx = localList.findIndex(
    (item) => String(item.external_media_id) === String(external_media_id) && item.media_type === media_type
  );

  let updatedList;
  if (existingIdx !== -1) {
    const existing = localList[existingIdx];
    const merged = {
      ...existing,
      ...newItem,
      season_number: newItem.season_number ?? existing.season_number,
      episode_number: newItem.episode_number ?? existing.episode_number,
      episode_title: newItem.episode_title ?? existing.episode_title,
      chapter_id: newItem.chapter_id ?? existing.chapter_id,
      chapter_number: newItem.chapter_number ?? existing.chapter_number,
      chapter_title: newItem.chapter_title ?? existing.chapter_title,
      server_key: newItem.server_key || existing.server_key || DEFAULT_SERVER_KEY,
      release_date: newItem.release_date || existing.release_date || null,
      quality: newItem.quality || existing.quality || null,
      progress_seconds: (newItem.progress_seconds && newItem.progress_seconds > 0) ? newItem.progress_seconds : existing.progress_seconds,
      duration_seconds: (newItem.duration_seconds && newItem.duration_seconds > 0) ? newItem.duration_seconds : existing.duration_seconds,
      poster_path: newItem.poster_path || existing.poster_path,
      backdrop_path: newItem.backdrop_path || existing.backdrop_path,
      last_watched_at: nowIso
    };
    updatedList = [merged, ...localList.filter((_, idx) => idx !== existingIdx)];
  } else {
    updatedList = [newItem, ...localList];
  }

  setLocalContinueWatching(updatedList);
  notifyContinueWatchingUpdated();

  // 2. Persist to MySQL database if logged in
  const token = localStorage.getItem('token');
  if (token) {
    const key = getItemKey(media_type, external_media_id);
    const prev = inFlightSaves.get(key);
    if (prev) {
      try { prev.controller.abort(); } catch {}
    }

    const controller = new AbortController();
    const savePromise = axios.post(
      '/api/media/continue-watching',
      {
        external_media_id: String(external_media_id),
        media_type,
        title,
        poster_path,
        backdrop_path,
        season_number,
        episode_number,
        episode_title,
        chapter_id,
        chapter_number,
        chapter_title,
        server_key: normalizedServer,
        release_date,
        quality,
        progress_seconds,
        duration_seconds
      },
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal
      }
    ).catch((err) => {
      if (err?.name !== 'CanceledError' && err?.code !== 'ERR_CANCELED') {
        console.warn('[ContinueWatching] Failed to sync with MySQL backend:', err.message);
      }
    }).finally(() => {
      if (inFlightSaves.get(key)?.controller === controller) {
        inFlightSaves.delete(key);
      }
    });

    inFlightSaves.set(key, { controller, promise: savePromise, mediaType: media_type, externalMediaId: String(external_media_id) });
    await savePromise;
  }
};

/**
 * Remove an item from Continue Watching:
 * 1. Records persistent deletion tombstone + removes from local storage immediately
 * 2. Aborts any in-flight save for that item so unmount/heartbeat POSTs cannot resurrect it
 * 3. Executes keepalive DELETE against MySQL (retries on next load if offline/interrupted)
 * 4. Dispatches update event after deletion settles
 */
export const removeContinueWatching = async (idOrTarget, mediaType = null, externalMediaId = null) => {
  if (!idOrTarget) return;

  let targetId = idOrTarget;
  let targetType = mediaType;
  let targetExternalId = externalMediaId;

  if (typeof idOrTarget === 'object' && idOrTarget !== null) {
    targetId = idOrTarget.id;
    targetType = idOrTarget.media_type || mediaType;
    targetExternalId = idOrTarget.external_media_id || externalMediaId;
  }

  const rowId = extractNumericRowId(targetId);
  const resolvedExtId = targetExternalId
    ? String(targetExternalId)
    : (targetId && !String(targetId).startsWith('local_') && !rowId ? String(targetId) : null);
  const key = getItemKey(targetType, resolvedExtId || targetId);

  cwMutationEpoch += 1;

  const token = localStorage.getItem('token');

  // Record persistent tombstone BEFORE removing locally so concurrent GET/hydration never resurrects it
  addItemTombstone({
    rowId,
    targetId,
    externalMediaId: resolvedExtId,
    mediaType: targetType,
    pendingSync: Boolean(token)
  });

  // 1. Remove from local storage immediately
  const localList = getLocalContinueWatching();
  const updatedList = localList.filter((item) => {
    if (targetId && String(item.id) === String(targetId)) return false;
    if (resolvedExtId && String(item.external_media_id) === resolvedExtId) {
      if (targetType) return item.media_type !== targetType;
      return false;
    }
    if (targetId && String(item.external_media_id) === String(targetId)) {
      if (targetType) return item.media_type !== targetType;
      return false;
    }
    return true;
  });

  setLocalContinueWatching(updatedList);

  // Abort any in-flight save for this exact item before deleting in MySQL
  await abortAndAwaitInFlightSaves((k, entry) => (
    k === key ||
    (resolvedExtId && entry.externalMediaId === resolvedExtId && (!targetType || entry.mediaType === targetType))
  ));

  // 2. Remove from MySQL database using keepalive fetch so page reload/navigation won't abort it
  if (token) {
    try {
      const path = buildDeletePath({
        targetId,
        rowId,
        externalMediaId: resolvedExtId,
        mediaType: targetType
      });
      const res = await sendKeepaliveDelete(path, token);
      if (res.ok || res.status === 404) {
        markItemTombstoneSynced(key, rowId, resolvedExtId, targetType);
      } else {
        console.warn('[ContinueWatching] Server delete returned status:', res.status);
      }
    } catch (err) {
      console.warn('[ContinueWatching] Failed to delete from MySQL backend (queued for retry):', err.message);
    }
  }

  // 3. Notify components AFTER database delete attempt completes
  notifyContinueWatchingUpdated();
};

/**
 * Clear all continue-watching items or clear by media type ('movie' | 'tv' | 'anime' | 'manga')
 */
export const clearContinueWatching = async (mediaType = null) => {
  cwMutationEpoch += 1;
  const scope = mediaType && mediaType !== 'all' ? mediaType : 'all';
  const token = localStorage.getItem('token');

  // Record persistent clear tombstone immediately
  const state = readTombstones();
  const clears = { ...(state.clears || {}), [scope]: { deletedAt: Date.now(), pendingSync: Boolean(token) } };
  writeTombstones({ ...state, clears });

  // 1. Update local storage immediately
  const localList = getLocalContinueWatching();
  let updatedList;
  if (scope !== 'all') {
    updatedList = localList.filter((item) => item.media_type !== scope);
  } else {
    updatedList = [];
  }

  setLocalContinueWatching(updatedList);

  // Abort any in-flight saves in this scope
  await abortAndAwaitInFlightSaves((_, entry) => scope === 'all' || entry.mediaType === scope);

  // 2. Call backend with keepalive DELETE if authenticated
  if (token) {
    try {
      const path = scope !== 'all'
        ? `/api/media/continue-watching/all?media_type=${encodeURIComponent(scope)}`
        : '/api/media/continue-watching/all';
      const res = await sendKeepaliveDelete(path, token);
      if (res.ok || res.status === 404) {
        const latest = readTombstones();
        if (latest.clears?.[scope]) {
          latest.clears[scope] = { ...latest.clears[scope], pendingSync: false };
          writeTombstones(latest);
        }
      } else {
        console.warn('[ContinueWatching] Server clear returned status:', res.status);
      }
    } catch (err) {
      console.warn('[ContinueWatching] Failed to clear items in MySQL backend (queued for retry):', err.message);
    }
  }

  // 3. Notify components AFTER database clear attempt completes
  notifyContinueWatchingUpdated();

  return updatedList;
};

/**
 * Bulk restore multiple continue-watching items (e.g. for Undo of Clear All / Clear Category)
 */
export const restoreContinueWatchingBatch = async (items) => {
  if (!Array.isArray(items) || items.length === 0) return;

  cwMutationEpoch += 1;
  const nowIso = new Date().toISOString();
  const stampedItems = normalizeStoredItems(items).map((it) => {
    clearItemTombstone(it.external_media_id, it.media_type);
    return { ...it, last_watched_at: nowIso };
  });

  // Clear matching category/all tombstones so restored items aren't suppressed
  const tState = readTombstones();
  if (tState.clears?.all) delete tState.clears.all;
  stampedItems.forEach((it) => {
    if (it.media_type && tState.clears?.[it.media_type]) {
      delete tState.clears[it.media_type];
    }
  });
  writeTombstones(tState);

  const localList = getLocalContinueWatching();
  const existingMap = new Map();
  localList.forEach((it) => existingMap.set(getItemKey(it.media_type, it.external_media_id), it));
  stampedItems.forEach((it) => existingMap.set(getItemKey(it.media_type, it.external_media_id), it));

  const merged = Array.from(existingMap.values());
  setLocalContinueWatching(merged);
  notifyContinueWatchingUpdated();

  const token = localStorage.getItem('token');
  if (token) {
    try {
      await axios.post(
        '/api/media/continue-watching/sync',
        { items: stampedItems },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.warn('[ContinueWatching] Failed to bulk restore items to MySQL:', err.message);
    }
  }
};

/**
 * Sync local guest items to MySQL database when logging in
 */
export const syncLocalContinueWatchingToServer = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  await flushPendingDeletes(token);
  const localItems = getLocalContinueWatching();
  if (localItems.length === 0) return;

  try {
    await axios.post(
      '/api/media/continue-watching/sync',
      { items: localItems },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    // Refresh to get server ids
    await fetchContinueWatching();
  } catch (err) {
    console.warn('[ContinueWatching] Failed to bulk-sync to MySQL server:', err.message);
  }
};

/**
 * Helper to build resume URL for any continue-watching item
 * Preserves the exact server and timestamp where the user stopped.
 */
export const getResumeUrl = (item) => {
  if (!item || !item.external_media_id || !item.media_type) return '/';
  const id = item.external_media_id;
  const resolvedServer = normalizeServerKey(item.server_key || DEFAULT_SERVER_KEY);
  const srv = resolvedServer ? `&server=${encodeURIComponent(resolvedServer)}` : '';
  const time = (item.progress_seconds && Number(item.progress_seconds) > 5)
    ? `&time=${Math.floor(Number(item.progress_seconds))}`
    : '';

  if (item.media_type === 'movie') {
    return `/media/movie/${id}?play=true${srv}${time}`;
  }
  if (item.media_type === 'tv' || item.media_type === 'anime') {
    const s = item.season_number || 1;
    const ep = item.episode_number || 1;
    return `/media/${item.media_type}/${id}?season=${s}&episode=${ep}&play=true${srv}${time}`;
  }
  if (item.media_type === 'manga') {
    if (item.chapter_id) {
      return `/media/manga/${id}?chapter=${encodeURIComponent(item.chapter_id)}&play=true`;
    }
    return `/media/manga/${id}?play=true`;
  }
  return `/media/${item.media_type}/${id}`;
};

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    const token = localStorage.getItem('token');
    if (token) {
      flushPendingDeletes(token).then(() => notifyContinueWatchingUpdated()).catch(() => {});
    }
  });
}
