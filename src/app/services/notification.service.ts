import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor() {}

  async requestPermission(): Promise<boolean> {
    const res = await LocalNotifications.requestPermissions();
    return (res.display === 'granted');
  }

  async schedule(id: number, title: string, body: string, at: Date) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id,
            title,
            body,
            schedule: { at },
            sound: 'default'
          }
        ]
      });
    } catch (e) {
      console.error('Erro agendando notificação', e);
      throw e;
    }
  }

  async cancel(id: number) {
    try {
      await LocalNotifications.cancel({ notifications: [{ id }] });
    } catch (e) {
      console.error('Erro cancelando notificação', e);
    }
  }
}
