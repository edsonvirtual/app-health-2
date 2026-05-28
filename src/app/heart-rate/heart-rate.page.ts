import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { pageFadeAnimation } from '../animations';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-heart-rate',
  templateUrl: './heart-rate.page.html',
  styleUrls: ['./heart-rate.page.scss'],
  standalone: true,
  animations: [pageFadeAnimation],
  imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent]
})
export class HeartRatePage implements OnInit {
  heartRate: number | null = null;
  lastSync: string = 'Nunca sincronizado';
  syncing = false;
  smartwatchConnected = false;
  history: Array<{ id: string; bpm: number; timestamp: number }> = [];

  constructor() {}

  ngOnInit() {
    this.heartRate = null;
    this.loadHistory();
  }

  connectSmartwatch() {
    this.smartwatchConnected = true;
    this.lastSync = 'Pronto para sincronizar';
  }

  syncHeartRate() {
    if (!this.smartwatchConnected) {
      return;
    }

    this.syncing = true;
    setTimeout(() => {
      this.heartRate = Math.floor(Math.random() * 40) + 60;
      this.lastSync = new Date().toLocaleString();
      this.syncing = false;
      // salvar automaticamente o batimento sincronizado
      this.saveCurrentToHistory();
    }, 1200);
  }

  private saveCurrentToHistory() {
    if (this.heartRate === null) return;
    const entry = { id: Date.now().toString(), bpm: this.heartRate, timestamp: Date.now() };
    this.history.unshift(entry);
    localStorage.setItem('heartRates', JSON.stringify(this.history));
  }

  loadHistory() {
    try {
      const raw = localStorage.getItem('heartRates');
      this.history = raw ? JSON.parse(raw) : [];
    } catch (e) {
      this.history = [];
    }
  }

  deleteEntry(id: string) {
    this.history = this.history.filter(h => h.id !== id);
    localStorage.setItem('heartRates', JSON.stringify(this.history));
  }

  clearHistory() {
    this.history = [];
    localStorage.removeItem('heartRates');
  }

  groupedHistory() {
    // retorna um array de { date: 'dd/mm/aaaa', entries: [...] }
    const groups: { [key: string]: Array<{ id: string; bpm: number; timestamp: number }> } = {};
    this.history.forEach(e => {
      const d = new Date(e.timestamp);
      const key = d.toLocaleDateString();
      groups[key] = groups[key] || [];
      groups[key].push(e);
    });
    return Object.keys(groups).map(k => ({ date: k, entries: groups[k] }));
  }
}
