# Guia rápido de uso da Autenticação

## 🚀 Para Começar

### 1. Preencha as credenciais do Firebase
- Edite `src/environments/environment.ts`
- Copie suas credenciais do Firebase Console
- Salve o arquivo

### 2. Execute o servidor
```bash
npm start
```

### 3. Teste a aplicação
- Acesse `http://localhost:4200`
- Deve ser redirecionado para `/login`

---

## 📝 Usando o AuthService em Componentes

### Exemplo: Verificar se usuário está autenticado

```typescript
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-example',
  template: `
    <div *ngIf="isAuthenticated$ | async">
      Você está logado!
    </div>
  `
})
export class ExampleComponent implements OnInit {
  isAuthenticated$ = this.authService.isAuthenticated();

  constructor(private authService: AuthService) {}
}
```

### Exemplo: Obter dados do usuário

```typescript
this.authService.getUser().subscribe(user => {
  if (user) {
    console.log('Email:', user.email);
    console.log('UID:', user.uid);
    console.log('Verificado:', user.emailVerified);
  }
});
```

### Exemplo: Login programático

```typescript
async login(email: string, password: string) {
  try {
    const result = await this.authService.signIn(email, password);
    console.log('Logado com sucesso:', result.user.email);
  } catch (error) {
    console.error('Erro de login:', error);
  }
}
```

---

## 🔗 Protegendo Rotas

Todas as rotas já estão protegidas automaticamente pelos Guards. Para adicionar uma nova rota protegida:

```typescript
// src/app/app.routes.ts
{
  path: 'minha-nova-rota',
  loadComponent: () => import('./minha-nova-rota/minha-nova-rota.page')
    .then(m => m.MinhaNovaRotaPage),
  canActivate: [AuthGuard]  // ← Adicione isso
}
```

---

## 🎨 Personalizando as Telas

### Mudar cores da UI
- Edite `src/theme/variables.scss`
- Modifique as variáveis de cor
- As páginas de login/signup usarão automaticamente

### Adicionar logo
- Coloque a imagem em `src/assets/`
- Adicione ao template HTML:
```html
<img src="assets/logo.png" alt="Logo" class="logo">
```

### Mudar mensagens
- Edite os arquivos `.html` das páginas
- Customize textos conforme necessário

---

## 🔐 Como Funciona o Fluxo de Autenticação

```
1. Usuário entra em http://localhost:4200
   ↓
2. App verifica se está autenticado (via AuthService)
   ↓
3. Se NÃO está autenticado:
   → Redireciona para /login (via AuthGuard)
   → Usuário faz login ou cadastro
   ↓
4. Se está autenticado:
   → Libera acesso a /home
   → Mostra dados do usuário
   ↓
5. Usuário clica em logout:
   → Limpa sessão Firebase
   → Redireciona para /login
```

---

## 💾 Salvando Dados do Usuário

Para salvar dados adicionais do usuário no Firestore:

```typescript
// Adicione ao AuthService
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

constructor(
  private auth: Auth,
  private firestore: Firestore
) {}

async createUserProfile(user: User, data: any) {
  const userRef = doc(this.firestore, 'users', user.uid);
  await setDoc(userRef, {
    email: user.email,
    ...data,
    createdAt: new Date()
  });
}
```

---

## 🌙 Adicionando Modo Escuro

As páginas de login/signup já suportam tema escuro automaticamente. O Ionic detectará a preferência do sistema.

Para forçar um tema:

```html
<!-- Em index.html -->
<html dark>
  <!-- Conteúdo -->
</html>
```

---

## ⚙️ Variáveis de Ambiente Úteis

```typescript
// Para acessar em qualquer lugar:
import { environment } from '../environments/environment';

console.log(environment.firebase.projectId);
```

---

## 📱 Testando com Diferentes Dispositivos

```bash
# Testar no iOS (requer macOS)
npm run build:ios
ionic capacitor run ios

# Testar no Android
npm run build:android
ionic capacitor run android

# Testar no navegador (padrão)
npm start
```

---

## 🎯 Checklist para Produção

- [ ] Credenciais do Firebase configuradas
- [ ] Todas as URLs adicionadas em Authorized Domains
- [ ] HTTPS habilitado (automático em produção)
- [ ] Logo e branding adicionados
- [ ] Mensagens de erro traduzidas
- [ ] Build de produção testado: `ng build --configuration production`
- [ ] Build enviado para hospedagem
- [ ] Variáveis de ambiente configuradas
- [ ] Firestore Rules configuradas
- [ ] Email de verificação habilitado (opcional)

---

## 📚 Recursos Úteis

- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [AngularFire Docs](https://github.com/angular/angularfire)
- [Ionic Documentation](https://ionicframework.com/docs)
- [Angular Material](https://material.angular.io)

---

Qualquer dúvida? Consulte a documentação oficial!
