import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { Room, StockItem } from '../types';

const ROOMS_LOCAL_KEY = 'araguaia_rooms_data';
const INVENTORY_LOCAL_KEY = 'araguaia_inventory_data';

function mirrorLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage indisponivel (modo privado etc.) — segue so com Firestore.
  }
}

// --- Quartos ---
// Um documento por quarto (nao um array unico), pra duas pessoas editando
// quartos diferentes ao mesmo tempo nao se sobrescreverem.

export function subscribeRooms(onChange: (rooms: Room[]) => void): () => void {
  return onSnapshot(collection(db, 'rooms'), (snap) => {
    const rooms = snap.docs.map((d) => d.data() as Room).sort((a, b) => a.id - b.id);
    mirrorLocal(ROOMS_LOCAL_KEY, rooms);
    onChange(rooms);
  });
}

export async function saveRoom(room: Room): Promise<void> {
  await setDoc(doc(db, 'rooms', String(room.id)), room);
}

export async function getRoomsOnce(): Promise<Room[]> {
  const snap = await getDocs(collection(db, 'rooms'));
  return snap.docs.map((d) => d.data() as Room).sort((a, b) => a.id - b.id);
}

/** Semeia o Firestore com os quartos padrao, so se a colecao ainda estiver vazia. */
export async function seedRoomsIfEmpty(defaultRooms: Room[]): Promise<void> {
  const snap = await getDocs(collection(db, 'rooms'));
  if (!snap.empty) return;
  const batch = writeBatch(db);
  for (const room of defaultRooms) {
    batch.set(doc(db, 'rooms', String(room.id)), room);
  }
  await batch.commit();
}

// --- Estoque ---

export function subscribeInventory(onChange: (items: StockItem[]) => void): () => void {
  return onSnapshot(collection(db, 'inventory'), (snap) => {
    const items = snap.docs.map((d) => d.data() as StockItem);
    mirrorLocal(INVENTORY_LOCAL_KEY, items);
    onChange(items);
  });
}

export async function saveStockItem(item: StockItem): Promise<void> {
  await setDoc(doc(db, 'inventory', item.id), item);
}

export async function deleteStockItem(itemId: string): Promise<void> {
  await deleteDoc(doc(db, 'inventory', itemId));
}

export async function seedInventoryIfEmpty(defaultItems: StockItem[]): Promise<void> {
  const snap = await getDocs(collection(db, 'inventory'));
  if (!snap.empty) return;
  const batch = writeBatch(db);
  for (const item of defaultItems) {
    batch.set(doc(db, 'inventory', item.id), item);
  }
  await batch.commit();
}
