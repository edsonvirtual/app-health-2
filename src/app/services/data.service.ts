import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, collection, addDoc, getDocs, query, orderBy, deleteDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadString, getDownloadURL } from '@angular/fire/storage';
import { Auth } from '@angular/fire/auth';
import { updateProfile } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(
    private firestore: Firestore,
    private storage: Storage,
    private auth: Auth
  ) {}

  private uid(): string | null {
    return this.auth.currentUser ? (this.auth.currentUser.uid as string) : null;
  }

  // Doctor contact stored inside users/{uid} document under doctor
  async saveDoctor(name: string, phone: string) {
    const uid = this.uid();
    if (!uid) throw new Error('Usuário não autenticado');
    const userDoc = doc(this.firestore, `users/${uid}`);
    await setDoc(userDoc, { doctor: { name, phone } }, { merge: true });
  }

  async loadDoctor(): Promise<{ name: string; phone: string } | null> {
    const uid = this.uid();
    if (!uid) return null;
    const userDoc = doc(this.firestore, `users/${uid}`);
    const snap = await getDoc(userDoc);
    if (!snap.exists()) return null;
    const data: any = snap.data();
    return data?.doctor || null;
  }

  async saveHealthRecord(title: string, notes: string) {
    const uid = this.uid();
    if (!uid) throw new Error('Usuário não autenticado');
    const coll = collection(this.firestore, `users/${uid}/healthRecords`);
    await addDoc(coll, { title, notes, date: Date.now() });
  }

  async loadHealthRecords(): Promise<any[]> {
    const uid = this.uid();
    if (!uid) return [];
    const coll = collection(this.firestore, `users/${uid}/healthRecords`);
    const q = query(coll, orderBy('date', 'desc'));
    const snaps = await getDocs(q);
    const items: any[] = [];
    snaps.forEach(s => items.push({ id: s.id, ...(s.data() as any) }));
    return items;
  }

  async deleteHealthRecord(id: string) {
    const uid = this.uid();
    if (!uid) return;
    const d = doc(this.firestore, `users/${uid}/healthRecords/${id}`);
    await deleteDoc(d);
  }

  async saveHeartRate(bpm: number) {
    const uid = this.uid();
    if (!uid) throw new Error('Usuário não autenticado');
    const coll = collection(this.firestore, `users/${uid}/heartRates`);
    await addDoc(coll, { bpm, timestamp: Date.now() });
  }

  async loadHeartRates(): Promise<any[]> {
    const uid = this.uid();
    if (!uid) return [];
    const coll = collection(this.firestore, `users/${uid}/heartRates`);
    const q = query(coll, orderBy('timestamp', 'desc'));
    const snaps = await getDocs(q);
    const items: any[] = [];
    snaps.forEach(s => items.push({ id: s.id, ...(s.data() as any) }));
    return items;
  }

  // Upload profile photo (dataURL) and update user's photoURL
  async uploadProfilePhoto(dataUrl: string): Promise<string> {
    const uid = this.uid();
    if (!uid) throw new Error('Usuário não autenticado');
    const storageRef = ref(this.storage, `profiles/${uid}/photo.jpg`);
    // upload as data_url
    await uploadString(storageRef, dataUrl, 'data_url');
    const url = await getDownloadURL(storageRef);
    // update auth profile
    if (this.auth.currentUser) {
      await updateProfile(this.auth.currentUser, { photoURL: url });
    }
    // also save in user doc
    const userDoc = doc(this.firestore, `users/${uid}`);
    await setDoc(userDoc, { photoURL: url }, { merge: true });
    return url;
  }
}
