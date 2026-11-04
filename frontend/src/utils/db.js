import { openDB } from 'idb';

const DB_NAME = 'bolkhata_offline_db';
const DB_VERSION = 1;

export async function getBolKhataDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Store for transactions awaiting sync to backend
      if (!db.objectStoreNames.contains('offline_queue')) {
        const queueStore = db.createObjectStore('offline_queue', { keyPath: 'offlineId' });
        queueStore.createIndex('createdAt', 'createdAt');
      }

      // Store for local cached transactions for offline view
      if (!db.objectStoreNames.contains('transactions_cache')) {
        const cacheStore = db.createObjectStore('transactions_cache', { keyPath: '_id' });
        cacheStore.createIndex('date', 'date');
      }

      // Store for offline settings & categories
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'key' });
      }
    },
  });
}

/**
 * Save transaction to offline queue when internet is disconnected
 */
export async function saveOfflineTransaction(transaction) {
  const db = await getBolKhataDB();
  const offlineId = transaction.offlineId || `offline_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const record = {
    ...transaction,
    offlineId,
    _id: transaction._id || offlineId,
    createdAt: new Date().toISOString(),
    isOffline: true,
  };

  await db.put('offline_queue', record);
  // Also put into cache store so it appears in transaction history right away!
  await db.put('transactions_cache', record);

  return record;
}

/**
 * Get all queued offline transactions
 */
export async function getOfflineQueue() {
  const db = await getBolKhataDB();
  return db.getAll('offline_queue');
}

/**
 * Remove an item from the offline sync queue
 */
export async function removeOfflineTransaction(offlineId) {
  const db = await getBolKhataDB();
  await db.delete('offline_queue', offlineId);
}

/**
 * Clear the offline queue after successful server sync
 */
export async function clearOfflineQueue() {
  const db = await getBolKhataDB();
  await db.clear('offline_queue');
}

/**
 * Cache server transactions for offline browsing
 */
export async function cacheTransactions(transactions) {
  if (!Array.isArray(transactions)) return;
  const db = await getBolKhataDB();
  const tx = db.transaction('transactions_cache', 'readwrite');
  for (const item of transactions) {
    if (item && (item._id || item.offlineId)) {
      await tx.store.put(item);
    }
  }
  await tx.done;
}

/**
 * Get cached transactions from IndexedDB
 */
export async function getCachedTransactions() {
  const db = await getBolKhataDB();
  return db.getAll('transactions_cache');
}

