import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonInput, IonItem, IonLabel, IonCard, IonSpinner, IonText, IonBackButton, IonButtons } from '@ionic/angular/standalone';
let SignupPage = class SignupPage {
    constructor(formBuilder, authService, router, alertController) {
        this.formBuilder = formBuilder;
        this.authService = authService;
        this.router = router;
        this.alertController = alertController;
        this.isLoading = false;
        this.destroy$ = new Subject();
    }
    ngOnInit() {
        this.signupForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
        }, { validators: this.passwordMatchValidator });
        this.authService.getLoading()
            .pipe(takeUntil(this.destroy$))
            .subscribe(loading => {
            this.isLoading = loading;
        });
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    passwordMatchValidator(group) {
        const password = group.get('password')?.value;
        const confirmPassword = group.get('confirmPassword')?.value;
        if (password && confirmPassword && password !== confirmPassword) {
            return { passwordMismatch: true };
        }
        return null;
    }
    async signup() {
        if (this.signupForm.invalid) {
            await this.showAlert('Erro', 'Por favor, preencha todos os campos corretamente.');
            return;
        }
        const { email, password } = this.signupForm.value;
        try {
            await this.authService.signUp(email, password);
            await this.showAlert('Sucesso', 'Conta criada com sucesso!');
            this.router.navigate(['/home']);
        }
        catch (error) {
            await this.showAlert('Erro de Cadastro', error.message || 'Falha ao criar a conta.');
        }
    }
    async signupWithGoogle() {
        try {
            await this.authService.signInWithGoogle();
            this.router.navigate(['/home']);
        }
        catch (error) {
            await this.showAlert('Erro de Cadastro', error.message || 'Falha ao fazer cadastro com Google.');
        }
    }
    async showAlert(header, message) {
        const alert = await this.alertController.create({
            header,
            message,
            buttons: ['OK'],
        });
        await alert.present();
    }
};
SignupPage = __decorate([
    Component({
        selector: 'app-signup',
        standalone: true,
        imports: [
            CommonModule,
            ReactiveFormsModule,
            RouterModule,
            IonContent,
            IonHeader,
            IonToolbar,
            IonTitle,
            IonButton,
            IonInput,
            IonItem,
            IonLabel,
            IonCard,
            IonSpinner,
            IonText,
            IonBackButton,
            IonButtons,
        ],
        templateUrl: './signup.page.html',
        styleUrls: ['./signup.page.scss'],
    })
], SignupPage);
export { SignupPage };
//# sourceMappingURL=signup.page.js.map