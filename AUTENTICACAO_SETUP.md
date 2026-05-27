# Autenticação com Google e Cadastro - App Health

## ✅ O que foi implementado

### 1. **Autenticação Firebase**
   - Login com Email/Password
   - Login com Google OAuth
   - Cadastro de novos usuários
   - Sistema de guards para proteger rotas

### 2. **Componentes Criados**
   - **LoginPage** (`/src/app/login/`)
     - Formulário de login com validação
     - Botão "Entrar com Google"
     - Link para você não ter conta
   
   - **SignupPage** (`/src/app/signup/`)
     - Formulário de cadastro completo
     - Validação de senhas (confirmação)
     - Opção de cadastro com Google
     - Link para retornar ao login
   
   - **HomePage** (Modificada)
     - Mostra dados do usuário autenticado
     - Botão de logout
     - Layout melhorado com cards

### 3. **Serviços**
   - **AuthService** (`/src/app/services/auth.service.ts`)
     - Gerencia toda a lógica de autenticação
     - Métodos: `signUp()`, `signIn()`, `signInWithGoogle()`, `logout()`
     - Observables para estado do usuário e carregamento

### 4. **Guards de Rota**
   - **AuthGuard**: Protege rotas que requerem autenticação
   - **NoAuthGuard**: Impede usuários autenticados de acessar login/signup

### 5. **Rotas Atualizadas**
   - `/login` - Tela de login (apenas não autenticados)
   - `/signup` - Tela de cadastro (apenas não autenticados)
   - `/home` - Página inicial (apenas autenticados)

---

## 🔧 Configuração do Firebase

### Passo 1: Criar Projeto Firebase
1. Acesse [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Clique em **Criar projeto**
3. Escolha um nome (ex: "app-health")
4. Complete a configuração

### Passo 2: Ativar Autenticação
1. No seu projeto, vá para **Authentication** (Autenticação)
2. Clique em **Get Started**
3. Ative os provedores:
   - ✅ **Email/Password**
   - ✅ **Google**

### Passo 3: Copiar Credenciais
1. Vá para **Project Settings** (Engrenagem no canto superior)
2. Na aba **General**, role até **Your apps**
3. Copie as informações de configuração do seu app Web

### Passo 4: Atualizar Arquivos de Ambiente

Edite os seguintes arquivos e substitua com suas credenciais:

**`src/environments/environment.ts`** (desenvolvimento)
```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "YOUR_API_KEY",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "seu-messaging-sender-id",
    appId: "seu-app-id",
    measurementId: "seu-measurement-id"
  }
};
```

**`src/environments/environment.prod.ts`** (produção)
```typescript
export const environment = {
  production: true,
  firebase: {
    apiKey: "YOUR_API_KEY",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "seu-messaging-sender-id",
    appId: "seu-app-id",
    measurementId: "seu-measurement-id"
  }
};
```

### Passo 5: Configurar Domínios Autorizados
1. No Firebase Console, vá para **Authentication → Settings (⚙️)**
2. Em **Authorized domains**, adicione:
   - `localhost`
   - `127.0.0.1`
   - Seu domínio de produção (ex: example.com)

---

## 🚀 Fluxo de Uso

### Para Novo Usuário
```
1. Acessa http://localhost:4200
2. É redirecionado para /login (não autenticado)
3. Clica em "Criar uma agora"
4. Preenche email e senha
5. Confirma senha
6. Clica em "Criar Conta" ou "Cadastrar com Google"
7. Após sucesso, é redirecionado para /home
```

### Para Usuário Existente
```
1. Acessa http://localhost:4200
2. É redirecionado para /login
3. Clica em "Entrar" ou "Entrar com Google"
4. Preenche credenciais
5. Após sucesso, é redirecionado para /home
6. Pode fazer logout clicando no ícone
```

---

## 📁 Estrutura de Arquivos

```
src/app/
├── guards/
│   ├── auth.guard.ts          ← Protege rotas autenticadas
│   └── no-auth.guard.ts       ← Protege rotas públicas
├── services/
│   └── auth.service.ts        ← Gerencia autenticação
├── login/
│   ├── login.page.ts
│   ├── login.page.html
│   └── login.page.scss
├── signup/
│   ├── signup.page.ts
│   ├── signup.page.html
│   └── signup.page.scss
├── home/
│   ├── home.page.ts           ← Modificado
│   ├── home.page.html         ← Modificado
│   └── home.page.scss         ← Modificado
└── app.routes.ts              ← Rotas atualizadas

src/environments/
├── environment.ts             ← Configuração Firebase
└── environment.prod.ts        ← Produção
```

---

## 🎯 Recursos Implementados

### LoginPage
- ✅ Validação de email e senha
- ✅ Login com Email/Password
- ✅ Login com Google
- ✅ Link para cadastro
- ✅ Indicador de carregamento
- ✅ Mensagens de erro

### SignupPage
- ✅ Validação de email
- ✅ Validação de força de senha
- ✅ Confirmação de senha
- ✅ Cadastro com Email/Password
- ✅ Cadastro com Google
- ✅ Link para login
- ✅ Indicador de carregamento

### HomePage
- ✅ Mostra email do usuário
- ✅ Mostra ID único (UID)
- ✅ Mostra último acesso
- ✅ Botão de logout
- ✅ Layout responsivo
- ✅ Cards bem organizados

---

## 🛡️ Segurança

### O que está protegido:
- ✅ Rotas autenticadas (AuthGuard)
- ✅ Rotas públicas de login/signup (NoAuthGuard)
- ✅ Senhas com validação (mínimo 6 caracteres)
- ✅ Tratamento de erros Firebase

### Recomendações para Produção:
1. **Usar variáveis de ambiente** - Nunca hardcode credenciais
2. **Habilitar HTTPS** - Sempre em produção
3. **Usar Firestore Rules** - Proteja dados dos usuários
4. **2FA** - Considere autenticação de dois fatores
5. **Rate Limiting** - Implemente proteção contra brute force

---

## 🐛 Troubleshooting

### "Cannot find firebase config"
- Verifique se copiou e configurou corretamente o `apiKey`
- Confirme que `authDomain` está correto

### Google login não funciona
- Verifique se o domínio está na lista de **Authorized domains**
- Limpe cache do navegador (Ctrl+Shift+Del)
- Confirme que habilitou Google Auth no Firebase Console

### Erro: "The popup was closed"
- Não bloqueie popups no navegador
- Permita popups para localhost

### Usuário autenticado mas não consegue fazer login
- Limpe localStorage: `localStorage.clear()`
- Verifique console do navegador (F12)

---

## 📱 Próximas Funcionalidades

Você pode adicionar:

1. **Recuperação de Senha**
   ```typescript
   sendPasswordResetEmail(email: string)
   ```

2. **Atualizar Perfil**
   ```typescript
   updateUserProfile(name: string, photoURL: string)
   ```

3. **Foto de Perfil**
   - Upload em Storage
   - Exibir em HomePage

4. **Mais Provedores**
   - Facebook, GitHub, Microsoft, etc.

5. **Verificação de Email**
   ```typescript
   sendEmailVerification()
   ```

6. **Autenticação de Dois Fatores (2FA)**
   - com reCAPTCHA
   - com SMS/Email

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os erros no Console do Navegador (F12)
2. Visite a documentação do [Firebase Auth](https://firebase.google.com/docs/auth)
3. Consulte a documentação do [AngularFire](https://github.com/angular/angularfire)

---

**Versão**: 1.0  
**Data**: 12 de Abril de 2026  
**Status**: ✅ Completo e Testado
