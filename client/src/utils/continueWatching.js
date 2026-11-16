import axios from 'axios';

const STORAGE_KEY = 'syncstream_continue_watching';

/**
 * Read locally cached continue-watching items
 */
export const getLocalContinueWatching = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 30)));
  } catch (e) {
    console.warn('[ContinueWatching] Failed to save local storage cache:', e);
  }
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
 * If authenticated, fetches from MySQL database and updates local storage.
 * If guest or offline, returns local storage items.
 */
export const fetchContinueWatching = async () => {
  const token = localStorage.getItem('token');
  const localItems = getLocalContinueWatching();

  if (!token) {
    return localItems;
  }

  try {
    const res = await axios.get('/api/media/continue-watching', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (Array.isArray(res.data)) {
      // Merge remote MySQL items with any fresh local items
      const serverItems = res.data;
      setLocalContinueWatching(serverItems);
      return serverItems;
    }
    return localItems;
  } catch (err) {
    console.warn('[ContinueWatching] Failed to fetch from MySQL database, falling back to local cache:', err.message);
    return localItems;
  }
};

/**
 * Record or update a continue-watching item:
 * 1. Updates local storage immediately for zero-latency UI updates
 * 2. If authenticated, persists to MySQL database in continue_watching table
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
  server_key = 'vidsrcto',
  progress_seconds = 0,
  duration_seconds = 0
}) => {
  if (!external_media_id || !media_type || !title) return;

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
    server_key: server_key || 'vidsrcto',
    progress_seconds: parseInt(progress_seconds || '0', 10) || 0,
    duration_seconds: parseInt(duration_seconds || '0', 10) || 0,
    last_watched_at: new Date().toISOString()
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
      server_key: newItem.server_key || existing.server_key || 'vidsrcto',
      progress_seconds: (newItem.progress_seconds && newItem.progress_seconds > 0) ? newItem.progress_seconds : existing.progress_seconds,
      duration_seconds: (newItem.duration_seconds && newItem.duration_seconds > 0) ? newItem.duration_seconds : existing.duration_seconds,
      poster_path: newItem.poster_path || existing.poster_path,
      backdrop_path: newItem.backdrop_path || existing.backdrop_path,
      last_watched_at: new Date().toISOString()
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
    try {
      await axios.post(
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
          server_key: server_key || 'vidsrcto',
          progress_seconds,
          duration_seconds
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    } catch (err) {
      console.warn('[ContinueWatching] Failed to sync with MySQL backend:', err.message);
    }
  }
};

/**
 * Remove an item from Continue Watching:
 * 1. Removes from local storage immediately
 * 2. Deletes row from MySQL database (awaited so GET won't bring it back)
 * 3. Dispatches update event after database deletion completes
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

  // 1. Remove from local storage
  const localList = getLocalContinueWatching();
  const updatedList = localList.filter((item) => {
    if (targetId && String(item.id) === String(targetId)) return false;
    if (targetExternalId && String(item.external_media_id) === String(targetExternalId)) {
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

  // 2. Remove from MySQL database (WAIT so subsequent queries see the deleted state)
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const deleteId = targetExternalId || targetId;
      const params = new URLSearchParams();
      if (targetType) params.append('media_type', targetType);
      if (targetExternalId) params.append('external_id', targetExternalId);
      const queryStr = params.toString() ? `?${params.toString()}` : '';

      await axios.delete(`/api/media/continue-watching/${encodeURIComponent(deleteId)}${queryStr}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.warn('[ContinueWatching] Failed to delete from MySQL backend:', err.message);
    }
  }

  // 3. Notify components ONLY AFTER database delete has executed
  notifyContinueWatchingUpdated();
};

/**
 * Clear all continue-watching items or clear by media type ('movie' | 'tv' | 'anime' | 'manga')
 */
export const clearContinueWatching = async (mediaType = null) => {
  // 1. Update local storage
  const localList = getLocalContinueWatching();
  let updatedList;
  if (mediaType && mediaType !== 'all') {
    updatedList = localList.filter((item) => item.media_type !== mediaType);
  } else {
    updatedList = [];
  }

  setLocalContinueWatching(updatedList);

  // 2. Call backend if authenticated and WAIT for completion
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const url = mediaType && mediaType !== 'all'
        ? `/api/media/continue-watching/all?media_type=${encodeURIComponent(mediaType)}`
        : '/api/media/continue-watching/all';
      await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.warn('[ContinueWatching] Failed to clear items in MySQL backend:', err.message);
    }
  }

  // 3. Notify components ONLY AFTER database clear has executed
  notifyContinueWatchingUpdated();

  return updatedList;
};

/**
 * Bulk restore multiple continue-watching items (e.g. for Undo of Clear All / Clear Category)
 */
export const restoreContinueWatchingBatch = async (items) => {
  if (!Array.isArray(items) || items.length === 0) return;

  const localList = getLocalContinueWatching();
  const existingMap = new Map();
  localList.forEach((it) => existingMap.set(`${it.media_type}_${it.external_media_id}`, it));
  items.forEach((it) => existingMap.set(`${it.media_type}_${it.external_media_id}`, it));

  const merged = Array.from(existingMap.values());
  setLocalContinueWatching(merged);
  notifyContinueWatchingUpdated();

  const token = localStorage.getItem('token');
  if (token) {
    try {
      await axios.post(
        '/api/media/continue-watching/sync',
        { items },
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
  const srv = item.server_key ? `&server=${encodeURIComponent(item.server_key)}` : '';
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
