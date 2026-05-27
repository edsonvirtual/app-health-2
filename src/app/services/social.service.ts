import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, where, writeBatch } from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref, uploadString } from '@angular/fire/storage';
import { firstValueFrom, Observable, of, switchMap } from 'rxjs';
import { AuthService } from './auth.service';

export interface Friend {
  id: string;
  name: string;
  email: string;
  addedAt: string;
}

export interface FeedPost {
  id: string;
  caption: string;
  image: string;
  date: string;
}

export interface FriendRequest {
  id: string;
  requestId: string;
  senderUid: string;
  senderName: string;
  senderEmail: string;
  receiverUid: string;
  receiverEmail: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class SocialService {
  constructor(
    private firestore: Firestore,
    private storage: Storage,
    private authService: AuthService
  ) {}

  getFriends(): Observable<Friend[]> {
    return this.authService.getUser().pipe(
      switchMap(user => {
        if (!user) {
          return of([]);
        }

        const friendsCollection = collection(this.firestore, `users/${user.uid}/friends`);
        return collectionData(friendsCollection, { idField: 'id' }) as Observable<Friend[]>;
      })
    );
  }

  getPosts(): Observable<FeedPost[]> {
    return this.authService.getUser().pipe(
      switchMap(user => {
        if (!user) {
          return of([]);
        }

        const postsCollection = collection(this.firestore, `users/${user.uid}/posts`);
        const ordered = query(postsCollection, orderBy('date', 'desc'));
        return collectionData(ordered, { idField: 'id' }) as Observable<FeedPost[]>;
      })
    );
  }

  getFriendRequestsReceived(): Observable<FriendRequest[]> {
    return this.authService.getUser().pipe(
      switchMap(user => {
        if (!user) {
          return of([]);
        }

        const requestsCollection = collection(this.firestore, `users/${user.uid}/friend_requests_received`);
        return collectionData(requestsCollection, { idField: 'id' }) as Observable<FriendRequest[]>;
      })
    );
  }

  getFriendRequestsSent(): Observable<FriendRequest[]> {
    return this.authService.getUser().pipe(
      switchMap(user => {
        if (!user) {
          return of([]);
        }

        const requestsCollection = collection(this.firestore, `users/${user.uid}/friend_requests_sent`);
        return collectionData(requestsCollection, { idField: 'id' }) as Observable<FriendRequest[]>;
      })
    );
  }

  async addFriend(name: string, email: string): Promise<string> {
    const user = await firstValueFrom(this.authService.getUser());
    if (!user) {
      throw new Error('Usuário não autenticado. Faça login para enviar solicitações.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!name.trim() || !normalizedEmail) {
      throw new Error('Nome e e-mail são obrigatórios.');
    }

    const usersQuery = query(collection(this.firestore, 'users'), where('email', '==', normalizedEmail));
    const usersSnapshot = await getDocs(usersQuery);
    if (usersSnapshot.empty) {
      throw new Error('Usuário não encontrado. Verifique o e-mail ou peça que seu amigo se cadastre primeiro.');
    }

    const targetDoc = usersSnapshot.docs[0];
    const targetUid = targetDoc.id;
    if (targetUid === user.uid) {
      throw new Error('Você não pode enviar solicitação de amizade para si mesmo.');
    }

    const friendRef = doc(this.firestore, 'users', user.uid, 'friends', targetUid);
    const friendSnapshot = await getDoc(friendRef);
    if (friendSnapshot.exists()) {
      throw new Error('Esse usuário já está na sua lista de amigos.');
    }

    const existingSentRequestQuery = query(
      collection(this.firestore, `users/${user.uid}/friend_requests_sent`),
      where('receiverUid', '==', targetUid)
    );
    const existingSentRequestSnapshot = await getDocs(existingSentRequestQuery);
    if (!existingSentRequestSnapshot.empty) {
      throw new Error('Você já enviou uma solicitação para este usuário. Aguarde a resposta.');
    }

    const existingReceivedRequestQuery = query(
      collection(this.firestore, `users/${user.uid}/friend_requests_received`),
      where('senderUid', '==', targetUid)
    );
    const existingReceivedRequestSnapshot = await getDocs(existingReceivedRequestQuery);
    if (!existingReceivedRequestSnapshot.empty) {
      throw new Error('Este usuário já enviou uma solicitação para você. Verifique seus pedidos recebidos.');
    }

    const requestId = this.generateId();
    const senderName = user.displayName || user.email || name.trim();
    const senderEmail = user.email || normalizedEmail;
    const receiverEmail = normalizedEmail;

    const requestData = {
      requestId,
      senderUid: user.uid,
      senderName,
      senderEmail,
      receiverUid: targetUid,
      receiverEmail,
      status: 'pending' as const,
      createdAt: new Date().toISOString()
    };

    const batch = writeBatch(this.firestore);
    const senderRequestRef = doc(this.firestore, 'users', user.uid, 'friend_requests_sent', requestId);
    const receiverRequestRef = doc(this.firestore, 'users', targetUid, 'friend_requests_received', requestId);
    batch.set(senderRequestRef, requestData);
    batch.set(receiverRequestRef, requestData);
    await batch.commit();

    const targetName = targetDoc.data()['displayName'] || normalizedEmail;
    return `Solicitação enviada para ${targetName}.`;
  }

  async acceptFriendRequest(requestId: string): Promise<string> {
    const user = await firstValueFrom(this.authService.getUser());
    if (!user) {
      throw new Error('Usuário não autenticado. Faça login para aceitar solicitações.');
    }

    const receivedRequestRef = doc(this.firestore, 'users', user.uid, 'friend_requests_received', requestId);
    const receivedRequestSnapshot = await getDoc(receivedRequestRef);
    if (!receivedRequestSnapshot.exists()) {
      throw new Error('Solicitação de amizade não encontrada.');
    }

    const requestData = receivedRequestSnapshot.data() as FriendRequest;
    const senderUid = requestData.senderUid;
    if (!senderUid) {
      throw new Error('Dados da solicitação inválidos.');
    }

    const batch = writeBatch(this.firestore);
    const userFriendRef = doc(this.firestore, 'users', user.uid, 'friends', senderUid);
    const senderFriendRef = doc(this.firestore, 'users', senderUid, 'friends', user.uid);
    const senderRequestRef = doc(this.firestore, 'users', senderUid, 'friend_requests_sent', requestId);

    batch.set(userFriendRef, {
      uid: senderUid,
      name: requestData.senderName,
      email: requestData.senderEmail,
      addedAt: new Date().toISOString(),
      createdAt: serverTimestamp()
    });

    batch.set(senderFriendRef, {
      uid: user.uid,
      name: user.displayName || user.email || 'Amigo',
      email: user.email || '',
      addedAt: new Date().toISOString(),
      createdAt: serverTimestamp()
    });

    batch.delete(receivedRequestRef);
    batch.delete(senderRequestRef);
    await batch.commit();

    return `Você aceitou a solicitação de ${requestData.senderName}.`;
  }

  async rejectFriendRequest(requestId: string): Promise<string> {
    const user = await firstValueFrom(this.authService.getUser());
    if (!user) {
      throw new Error('Usuário não autenticado. Faça login para recusar solicitações.');
    }

    const receivedRequestRef = doc(this.firestore, 'users', user.uid, 'friend_requests_received', requestId);
    const receivedRequestSnapshot = await getDoc(receivedRequestRef);
    if (!receivedRequestSnapshot.exists()) {
      throw new Error('Solicitação de amizade não encontrada.');
    }

    const requestData = receivedRequestSnapshot.data() as FriendRequest;
    const senderUid = requestData.senderUid;
    if (!senderUid) {
      throw new Error('Dados da solicitação inválidos.');
    }

    const senderRequestRef = doc(this.firestore, 'users', senderUid, 'friend_requests_sent', requestId);
    const batch = writeBatch(this.firestore);
    batch.delete(receivedRequestRef);
    batch.delete(senderRequestRef);
    await batch.commit();

    return `Solicitação de ${requestData.senderName} recusada.`;
  }

  async cancelFriendRequest(requestId: string): Promise<string> {
    const user = await firstValueFrom(this.authService.getUser());
    if (!user) {
      throw new Error('Usuário não autenticado. Faça login para cancelar solicitações.');
    }

    const sentRequestRef = doc(this.firestore, 'users', user.uid, 'friend_requests_sent', requestId);
    const sentRequestSnapshot = await getDoc(sentRequestRef);
    if (!sentRequestSnapshot.exists()) {
      throw new Error('Solicitação não encontrada para cancelamento.');
    }

    const requestData = sentRequestSnapshot.data() as FriendRequest;
    const receiverUid = requestData.receiverUid;
    if (!receiverUid) {
      throw new Error('Dados da solicitação inválidos.');
    }

    const receiverRequestRef = doc(this.firestore, 'users', receiverUid, 'friend_requests_received', requestId);
    const batch = writeBatch(this.firestore);
    batch.delete(sentRequestRef);
    batch.delete(receiverRequestRef);
    await batch.commit();

    return `Solicitação para ${requestData.receiverEmail} cancelada.`;
  }

  async removeFriend(friendUid: string): Promise<void> {
    const user = await firstValueFrom(this.authService.getUser());
    if (!user) {
      throw new Error('Usuário não autenticado.');
    }

    const batch = writeBatch(this.firestore);
    const userFriendRef = doc(this.firestore, 'users', user.uid, 'friends', friendUid);
    const otherFriendRef = doc(this.firestore, 'users', friendUid, 'friends', user.uid);
    batch.delete(userFriendRef);
    batch.delete(otherFriendRef);
    await batch.commit();
  }

  async addPost(caption: string, image: string): Promise<string> {
    const user = await firstValueFrom(this.authService.getUser());
    if (!user) {
      throw new Error('Usuário não autenticado. Faça login para publicar.');
    }

    if (!image) {
      throw new Error('Imagem é obrigatória. Selecione uma foto antes de publicar.');
    }

    const postId = this.generateId();
    const storageRef = ref(this.storage, `users/${user.uid}/posts/${postId}.jpg`);
    await uploadString(storageRef, image, 'data_url');
    const imageUrl = await getDownloadURL(storageRef);

    const postsCollection = collection(this.firestore, `users/${user.uid}/posts`);
    await addDoc(postsCollection, {
      caption: caption.trim() || 'Compartilhando minha corrida! 🏃‍♂️',
      image: imageUrl,
      date: new Date().toISOString(),
      createdAt: serverTimestamp()
    });

    return 'Post publicado com sucesso!';
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
  }
}
