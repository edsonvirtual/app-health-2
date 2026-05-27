import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonInput, IonButton, IonLabel, IonItem, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calculator, fitness, heart, menuOutline } from 'ionicons/icons';
let HealthPage = class HealthPage {
    constructor() {
        this.peso = 0;
        this.altura = 0;
        this.imc = 0;
        this.classificacao = '';
        this.dicas = [];
        addIcons({ menuOutline, calculator, fitness, heart });
    }
    calcularIMC() {
        if (this.altura > 0 && this.peso > 0) {
            this.imc = this.peso / (this.altura * this.altura);
            this.classificarIMC();
            this.gerarDicas();
        }
        else {
            this.imc = 0;
            this.classificacao = 'Dados inválidos';
            this.dicas = [];
        }
    }
    classificarIMC() {
        if (this.imc < 18.5) {
            this.classificacao = 'Abaixo do peso';
        }
        else if (this.imc >= 18.5 && this.imc < 25) {
            this.classificacao = 'Peso normal';
        }
        else if (this.imc >= 25 && this.imc < 30) {
            this.classificacao = 'Sobrepeso';
        }
        else if (this.imc >= 30 && this.imc < 35) {
            this.classificacao = 'Obesidade grau 1';
        }
        else if (this.imc >= 35 && this.imc < 40) {
            this.classificacao = 'Obesidade grau 2';
        }
        else {
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
        }
        else if (this.imc >= 18.5 && this.imc < 25) {
            this.dicas = [
                'Mantenha uma dieta equilibrada com frutas, verduras e proteínas.',
                'Continue praticando atividades físicas regularmente.',
                'Beba bastante água e evite alimentos processados.',
                'Monitore seu peso periodicamente.'
            ];
        }
        else if (this.imc >= 25 && this.imc < 30) {
            this.dicas = [
                'Reduza o consumo de açúcares e gorduras saturadas.',
                'Aumente a ingestão de fibras e verduras.',
                'Pratique exercícios aeróbicos e de força.',
                'Consulte um profissional de saúde para orientação.'
            ];
        }
        else {
            this.dicas = [
                'Busque acompanhamento médico e nutricional urgente.',
                'Adote uma dieta hipocalórica supervisionada.',
                'Inclua atividades físicas de baixo impacto inicialmente.',
                'Monitore o progresso com profissionais de saúde.',
                'Evite dietas milagrosas e foque em mudanças sustentáveis.'
            ];
        }
    }
};
HealthPage = __decorate([
    Component({
        selector: 'app-health',
        templateUrl: './health.page.html',
        styleUrls: ['./health.page.scss'],
        standalone: true,
        imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, CommonModule, FormsModule, IonInput, IonButton, IonLabel, IonItem, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon]
    })
], HealthPage);
export { HealthPage };
//# sourceMappingURL=health.page.js.map