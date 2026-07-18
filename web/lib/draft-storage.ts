export type DraftFile = {
  name: string;
  type: string;
  lastModified: number;
  data: ArrayBuffer;
};

export type SubmitDraftRecord = {
  id?: string;
  title?: string;
  abstract?: string;
  doi?: string;
  authorsText?: string;
  date?: string;
  language?: string;
  researchType?: string;
  isPeerReviewed?: boolean;
  visibility?: 'public' | 'private';
  step?: number;
  pdf?: DraftFile | null;
  coverImage?: DraftFile | null;
};

const databaseName = 'researchhub-drafts';
const storeName = 'submit';
const recordId = 'current';
let writeQueue = Promise.resolve();

function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(storeName, { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Unable to open draft storage'));
  });
}

function readRecord(database: IDBDatabase): Promise<SubmitDraftRecord | undefined> {
  return new Promise((resolve, reject) => {
    const request = database.transaction(storeName, 'readonly').objectStore(storeName).get(recordId);
    request.onsuccess = () => resolve(request.result as SubmitDraftRecord | undefined);
    request.onerror = () => reject(request.error || new Error('Unable to read draft'));
  });
}

function writeRecord(database: IDBDatabase, record: SubmitDraftRecord): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = database.transaction(storeName, 'readwrite').objectStore(storeName).put({ ...record, id: recordId });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error || new Error('Unable to save draft'));
  });
}

export function updateSubmitDraft(patch: SubmitDraftRecord) {
  writeQueue = writeQueue.then(async () => {
    const database = await openDatabase();
    if (!database) return;
    const existing = await readRecord(database);
    await writeRecord(database, { ...existing, ...patch, id: recordId });
    database.close();
  }).catch(() => undefined);
  return writeQueue;
}

export async function loadSubmitDraft(): Promise<SubmitDraftRecord | null> {
  try {
    const database = await openDatabase();
    if (!database) return null;
    const record = await readRecord(database);
    database.close();
    return record || null;
  } catch {
    return null;
  }
}

export function clearSubmitDraft() {
  writeQueue = writeQueue.then(async () => {
    const database = await openDatabase();
    if (!database) return;
    await new Promise<void>((resolve, reject) => {
      const request = database.transaction(storeName, 'readwrite').objectStore(storeName).delete(recordId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error || new Error('Unable to clear draft'));
    });
    database.close();
  }).catch(() => undefined);
  return writeQueue;
}

export async function fileToDraftFile(file: File): Promise<DraftFile> {
  return { name: file.name, type: file.type, lastModified: file.lastModified, data: await file.arrayBuffer() };
}

export function draftFileToFile(file: DraftFile) {
  return new File([file.data], file.name, { type: file.type, lastModified: file.lastModified });
}
