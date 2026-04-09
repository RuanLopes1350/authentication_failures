# Laboratório OWASP: Falha de Autenticação (JWT Bypass - Algoritmo "none")

Este projeto é um exemplo prático de uma falha grave de autenticação, onde um atacante pode burlar a verificação de um token JWT para obter privilégios de administrador.

## A Vulnerabilidade

O servidor utiliza a biblioteca `jsonwebtoken`, mas na sua configuração de verificação, ele permite explicitamente o algoritmo `none`. Isso significa que, se o cabeçalho do token indicar que não há assinatura (`alg: "none"`), o servidor ignora a parte da assinatura e aceita o payload como verdadeiro.

### Passos do Ataque Simulado:

1.  **Login Comum**: O atacante faz login como um usuário normal e recebe um token JWT válido assinado (HS256).
2.  **Decodificação**: Como o JWT é apenas codificado em Base64, o atacante decodifica o cabeçalho (Header) e o corpo (Payload).
3.  **Modificação**:
    *   No **Header**, o atacante altera `"alg": "HS256"` para `"alg": "none"`.
    *   No **Payload**, o atacante altera sua identidade (ex: `id: 15` para `id: 1` ou `role: "user"` para `role: "admin"`).
4.  **Envio**: O atacante reconstrói o token (Header + Payload) e o envia sem a assinatura final (mas mantendo o ponto `.` no final).
5.  **Bypass**: O servidor vê o `alg: none`, não verifica a assinatura e concede acesso de administrador.

## Como Executar

### 1. Instalação e Inicialização

```bash
cd OWASP-Seminary
npm install
npm run dev
```

O servidor estará rodando em `http://localhost:1350`.

### 2. Executar o Exploit

Com o servidor rodando, abra outro terminal e execute:

```bash
npm run exploit
```

O script `exploit.ts` (executado via `tsx`) automatiza os passos acima, explicando didaticamente cada fase da manipulação do JWT.

## Onde encontrar o erro no código?

Abra o arquivo `src/service/authService.ts` e observe a função `getSecureData` (e `getAdminData`):

```typescript
const decoded = jwt.verify(token, this.SECRET_KEY, {
  algorithms: ["HS256", "none"] as any // <-- O ERRO ESTÁ AQUI
}) as any;
```

A inclusão de `"none"` na lista de algoritmos permitidos é o que causa a falha. Em sistemas reais, **nunca** deve-se permitir o algoritmo `none`.
