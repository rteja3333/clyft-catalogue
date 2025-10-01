import { db, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "../firebase";

export async function fetchCategories() {
  const snap = await getDocs(collection(db, "categories"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function fetchItems() {
  const snap = await getDocs(collection(db, "widelisting"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createCategory(category: { name: string; image?: string; visible?: boolean }) {
  return await addDoc(collection(db, "categories"), category);
}

export async function updateCategory(id: string, updates: Partial<any>) {
  return await updateDoc(doc(db, "categories", id), updates);
}

export async function createOrUpdateItem(item: any) {
  if (item.id) {
    return await updateDoc(doc(db, "widelisting", item.id), item);
  }
  return await addDoc(collection(db, "widelisting"), item);
}

export async function deleteItem(id: string) {
  return await deleteDoc(doc(db, "widelisting", id));
}
