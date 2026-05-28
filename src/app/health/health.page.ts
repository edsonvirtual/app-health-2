import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { pageFadeAnimation, listStagger } from '../animations';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonInput, IonButton, IonLabel, IonItem, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonIcon, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calculator, fitness, heart, menuOutline } from 'ionicons/icons';
import { DataService } from '../services/data.service';


@Component({
  selector: 'app-health',
  templateUrl: './health.page.html',
  styleUrls: ['./health.page.scss'],
  standalone: true,
  animations: [pageFadeAnimation, listStagger],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, CommonModule, FormsModule, IonInput, IonButton, IonLabel, IonItem, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonIcon]
})
export class HealthPage implements OnInit {
  peso: number = 0;
  altura: number = 0;
  imc: number = 0;
  classificacao: string = '';
  dicas: string[] = [];

  // contato do médico
  doctorName: string = '';
  doctorPhone: string = '';

  // registros de saúde (anotações, consultas, etc.)
  healthRecords: Array<{ id: string; title: string; notes: string; date: number }> = [];
  // edição de registro
  editingId: string | null = null;
  recordFormTitle = '';
  recordFormNotes = '';

  constructor(private toastCtrl: ToastController, private data: DataService) {
    addIcons({menuOutline,calculator,fitness,heart});
  }

  async ngOnInit() {
    await this.loadDoctor();
    await this.loadRecords();
  }

  calcularIMC() {
    if (this.altura > 0 && this.peso > 0) {
      this.imc = this.peso / (this.altura * this.altura);
      this.classificarIMC();
      this.gerarDicas();
    } else {
      this.imc = 0;
      this.classificacao = 'Dados inválidos';
      this.dicas = [];
    }
  }

  classificarIMC() {
    if (this.imc < 18.5) {
      this.classificacao = 'Abaixo do peso';
    } else if (this.imc >= 18.5 && this.imc < 25) {
      this.classificacao = 'Peso normal';
    } else if (this.imc >= 25 && this.imc < 30) {
      this.classificacao = 'Sobrepeso';
    } else if (this.imc >= 30 && this.imc < 35) {
      this.classificacao = 'Obesidade grau 1';
    } else if (this.imc >= 35 && this.imc < 40) {
      this.classificacao = 'Obesidade grau 2';
    } else {
      this.classificacao = 'Obesidade grau 3';
    }
  }

  gerarDicas() {
    this.dicas = [];
    if (this.imc < 18.5) {
      this.dicas = [
        'Aumente a ingestão calórica com alimentos ricos em nutrientes.',
        'Inclua proteínas, carboidratos complexos e gorduras saudáveis na dieta.',
        'Consulte um nutricionista para um plano alimentar personalizado.',
        'Pratique exercícios de fortalecimento muscular.'
      ];
    } else if (this.imc >= 18.5 && this.imc < 25) {
      this.dicas = [
        'Mantenha uma dieta equilibrada com frutas, verduras e proteínas.',
        'Continue praticando atividades físicas regularmente.',
        'Beba bastante água e evite alimentos processados.',
        'Monitore seu peso periodicamente.'
      ];
    } else if (this.imc >= 25 && this.imc < 30) {
      this.dicas = [
        'Reduza o consumo de açúcares e gorduras saturadas.',
        'Aumente a ingestão de fibras e verduras.',
        'Pratique exercícios aeróbicos e de força.',
        'Consulte um profissional de saúde para orientação.'
      ];
    } else {
      this.dicas = [
        'Busque acompanhamento médico e nutricional urgente.',
        'Adote uma dieta hipocalórica supervisionada.',
        'Inclua atividades físicas de baixo impacto inicialmente.',
        'Monitore o progresso com profissionais de saúde.',
        'Evite dietas milagrosas e foque em mudanças sustentáveis.'
      ];
    }
  }

  // doctor contact
  async saveDoctor() {
    try {
      await this.data.saveDoctor(this.doctorName, this.doctorPhone);
      this.toastCtrl.create({ message: 'Contato do médico salvo.', duration: 1500, position: 'bottom', color: 'success' }).then(t => t.present());
    } catch (e) {
      console.error(e);
      this.toastCtrl.create({ message: 'Erro ao salvar contato. Verifique se está autenticado.', duration: 1800, position: 'bottom', color: 'danger' }).then(t => t.present());
    }
  }

  async loadDoctor() {
    try {
      const d = await this.data.loadDoctor();
      if (d) {
        this.doctorName = d.name || '';
        this.doctorPhone = d.phone || '';
      }
    } catch (e) {
      // ignore
    }
  }

  async deleteDoctor() {
    this.doctorName = '';
    this.doctorPhone = '';
    try {
      await this.data.saveDoctor('', '');
    } catch (e) {
      // ignore
    }
    this.toastCtrl.create({ message: 'Contato do médico removido.', duration: 1400, position: 'bottom', color: 'warning' }).then(t => t.present());
  }

  // health records CRUD
  async loadRecords() {
    try {
      this.healthRecords = await this.data.loadHealthRecords();
    } catch (e) {
      this.healthRecords = [];
    }
  }

  async addRecord(title: string, notes: string) {
    try {
      await this.data.saveHealthRecord(title, notes);
      await this.loadRecords();
      this.toastCtrl.create({ message: 'Registro adicionado.', duration: 1200, position: 'bottom', color: 'success' }).then(t => t.present());
    } catch (e) {
      console.error(e);
      this.toastCtrl.create({ message: 'Erro ao adicionar registro.', duration: 1400, position: 'bottom', color: 'danger' }).then(t => t.present());
    }
  }

  async updateRecord(id: string, title: string, notes: string) {
    // For now, update by deleting and re-adding (simpler) or rely on Firestore doc update later
    try {
      // remove existing and re-add with same id not trivial with addDoc; so we'll reload from server
      // a proper implementation would use updateDoc on the specific doc id
      await this.data.deleteHealthRecord(id);
      await this.data.saveHealthRecord(title, notes);
      await this.loadRecords();
      this.toastCtrl.create({ message: 'Registro atualizado.', duration: 1200, position: 'bottom', color: 'success' }).then(t => t.present());
    } catch (e) {
      console.error(e);
      this.toastCtrl.create({ message: 'Erro ao atualizar registro.', duration: 1400, position: 'bottom', color: 'danger' }).then(t => t.present());
    }
  }

  startEditRecord(id: string) {
    const rec = this.healthRecords.find(r => r.id === id);
    if (!rec) return;
    this.editingId = id;
    this.recordFormTitle = rec.title;
    this.recordFormNotes = rec.notes;
  }

  submitRecordForm() {
    if (this.editingId) {
      this.updateRecord(this.editingId, this.recordFormTitle, this.recordFormNotes);
      this.editingId = null;
    } else if (this.recordFormTitle || this.recordFormNotes) {
      this.addRecord(this.recordFormTitle, this.recordFormNotes);
    }
    this.recordFormTitle = '';
    this.recordFormNotes = '';
  }

  async deleteRecord(id: string) {
    try {
      await this.data.deleteHealthRecord(id);
      await this.loadRecords();
      this.toastCtrl.create({ message: 'Registro removido.', duration: 1200, position: 'bottom', color: 'warning' }).then(t => t.present());
    } catch (e) {
      console.error(e);
      this.toastCtrl.create({ message: 'Erro ao remover registro.', duration: 1400, position: 'bottom', color: 'danger' }).then(t => t.present());
    }
  }
}
