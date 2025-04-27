# PSI Form

Este é um projeto [Next.js](https://nextjs.org/) criado com [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

> Aplicação para gerenciamento de formulários internos.

---

## 🚀 Tecnologias utilizadas

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Prisma ORM](https://www.prisma.io/)
- Banco de dados SQLite (modo desenvolvimento)

---

## ⚙️ Requisitos para rodar localmente

- Node.js `>=18.18`
- NPM, Yarn, PNPM ou Bun

---

## 🛠️ Como iniciar o projeto

Clone o repositório:

```bash
git clone https://github.com/seu-usuario/seu-repo.git
cd seu-repo
```

Instale as dependências:

```bash
npm install
# ou
yarn install
# ou
pnpm install
# ou
bun install
```

Configure o ambiente:

- Crie um arquivo `.env` na raiz (veja `.env.example` para saber as variáveis necessárias).

Rode o servidor de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador para visualizar a aplicação.

---

## 🧹 Scripts úteis

| Comando             | Ação                                 |
| ------------------ | ----------------------------------- |
| `npm run dev`       | Inicia o servidor de desenvolvimento |
| `npm run build`     | Gera a build de produção             |
| `npm run start`     | Sobe o app em modo produção          |
| `npx prisma studio` | Abre painel visual para o banco      |

---

## 📦 Deploy no servidor

Este projeto foi configurado para deploy manual via Git remoto + PM2.

Resumo:

- Atualize o repositório com `git push production main`
- O servidor aplica o build automático (`npm run build`) e reinicia via PM2.

---

## 📚 Documentação adicional

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

---

## 🛡️ Notas de Segurança

- Arquivos `.env` e o banco de dados `dev.db` **não são versionados** no Git.
- Nunca compartilhe suas credenciais públicas.
- Use variáveis de ambiente para armazenar chaves sensíveis.

---

## ✨ Contribuições

Contribuições são bem-vindas!  
Abra uma [issue](https://github.com/seu-usuario/seu-repo/issues) ou envie um pull request.

---

## 📝 Licença

Este projeto está sob a licença **MIT**.

---

**Bora construir algo incrível!**
