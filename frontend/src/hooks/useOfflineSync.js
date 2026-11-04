import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setOnlineStatus, setSyncingState } from '../store/uiSlice.js';
import { fetchTransactions, fetchSummary } from '../store/transactionSlice.js';
import { getOfflineQueue, clearOfflineQueue } from '../utils/db.js';
import { api } from '../api/client.js';

export function useOfflineSync() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const syncPendingQueue = useCallback(async () => {
    if (!navigator.onLine || !isAuthenticated) return;

    try {
      const queue = await getOfflineQueue();
      if (!queue || queue.length === 0) return;

      dispatch(setSyncingState({ isSyncing: true, pendingCount: queue.length }));

      const res = await api.syncOfflineTransactions(queue);
      if (res.success) {
        await clearOfflineQueue();
        dispatch(fetchTransactions());
        dispatch(fetchSummary({ period: 'today' }));
        console.log(`[BolKhata Sync] Successfully synced ${res.count} offline records.`);
      }
    } catch (err) {
      console.warn('[BolKhata Sync] Sync attempt deferred:', err.message);
    } finally {
      dispatch(setSyncingState({ isSyncing: false, pendingCount: 0 }));
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    const handleOnline = () => {
      dispatch(setOnlineStatus(true));
      syncPendingQueue();
    };

    const handleOffline = () => {
      dispatch(setOnlineStatus(false));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync check on mount
    syncPendingQueue();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch, syncPendingQueue]);

  return {
    syncPendingQueue,
  };
}

