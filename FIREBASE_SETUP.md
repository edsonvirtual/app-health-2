# App Health - Autenticação com Firebase

## Configuração do Firebase

Para usar a autenticação com Google neste projeto, siga estes passos:

### 1. Criar um Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em **Criar projeto** (ou **Create project**)
3. Digite um nome para seu projeto (ex: "app-health")
4. Configure conforme necessário e crie o projeto

### 2. Configurar Autenticação

1. No console do Firebase, vá para **Authentication** (Autenticação)
2. Clique em **Get Started** (Começar)
3. Selecione **Email/Password** e ativ  e
4. Selecione **Google** e ative, depois configure a credencial do OAuth

### 3. Obter Credenciais Firebase

1. No console do Firebase, vá para **Project Settings** (Configurações do P rojeto)
2. Na aba **General**, copie as credenciais sob **Your apps**
3. Se não houver app registrado, clique em **Add app** e selecione **Web**
4. Copie o objeto `firebaseConfig`

### 4. Atualizar as Variáveis de Ambiente

Abra os arquivos:
- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

Substitua os valores com suas credenciais do Firebase:

```typescript
firebase: {
  apiKey: "SUA_API_KEY",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "seu-messaging-sender-id",
  appId: "seu-app-id",
  measurementId: "seu-measurement-id"
}
```

### 5. Configurar Google OAuth (para Web)

1. No Firebase Console, vá para **Authentication** > **Sign-in method**
2. Clique em **Google**
3. Em **Authorized domains**, adicione:
   - `localhost` (para desenvolvimento)
   - Seu domínio de produção

### 6. Testando Localmente

Para testar com OAuth do Google localmente, você pode:

1. Usar `localhost:4200` (já autorizado)
2. Adicionar hosts como `127.0.0.1:4200` se necessário

## Estrutura de Autenticação

### Serviços
- **AuthService** (`src/app/services/auth.service.ts`): Gerencia todas as operações de autenticação

### Guards
- **AuthGuard**: Protege rotas que requerem autenticação
- **NoAuthGuard**: Protege rotas de login/signup para usuários já autenticados

### Componentes
- **LoginPage** (`src/app/login/`): Tela de login com Email/Password e Google
- **SignupPage** (`src/app/signup/`): Tela de cadastro com validação
- **HomePage** (`src/app/home/`): Página protegida com informações do usuário

## Uso

### Fluxo de Autenticação

1. **Usuário não autenticado** → Redirecionado para `/login`
2. **Login com Email** → Validação e autenticação
3. **Login com Google** → OAuth redirect
4. **Cadastro** → Criar nova conta com validação
5. **Logout** → Limpar sessão e retornar a `/login`

### Métodos do AuthService

```typescript
// Criar nova conta
authService.signUp(email: string, password: string): Promise<any>

// Login com Email
authService.signIn(email: string, password: string): Promise<any>

// Login com Google
authService.signInWithGoogle(): Promise<any>

// Logout
authService.logout(): Promise<void>

// Obter usuário atual (Observable)
authService.getUser(): Observable<User | null>

// Verificar se autenticado (Observable)
authService.isAuthenticated(): Observable<boolean>

// Obter estado de carregamento (Observable)
authService.getLoading(): Observable<boolean>
```

## Segurança

### Regras do Firestore (Recomendado para Produção)

```plain
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

> Essa regra permite acessos a `/users/{uid}` e também às subcoleções como `/users/{uid}/friends` e `/users/{uid}/posts`.

## Troubleshooting

### Erro: "Cannot find firebase config"
- Verifique se preencheu corretamente as credenciais no arquivo `environment.ts`

### Google Login não funciona
- Confirme que a URL está em **Authorized domains** no Firebase
- Verifique se habilitou Google como método de sign-in
- Limpe o cache do navegador

### Erro de senha fraca
- Use senhas com pelo menos 6 caracteres

## Próximos Passos

Você pode agora:
1. Adicionar Firestore para armazenar dados de usuário
2. Implementar autenticação com redes sociais (Facebook, GitHub, etc)
3. Adicionar recuperação de senha
4. Implementar autenticação de dois fatores
5. Adicionar foto de perfil do usuário

---

**Nota**: Nunca commite credenciais reais no GitHub. Use variáveis de ambiente em produção.
