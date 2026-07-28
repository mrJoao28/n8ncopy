# n8ncopy
 
Clone funcional de uma ferramenta de automação de workflows no estilo **n8n / Zapier**, construído como projeto de estudo full-stack. A ideia é permitir criar, conectar e executar fluxos de automação de forma visual, entendendo na prática como plataformas desse tipo são estruturadas por baixo dos panos.
 
> Projeto de estudo baseado no tutorial *"Build and Deploy an N8N & Zapier Clone"* (Code with Antonio), desenvolvido para aprofundar conhecimento em arquitetura full-stack moderna e automação.
 
## ✨ Sobre o projeto
 
O objetivo foi replicar, do zero, os pilares de uma plataforma de automação real:
 
- Criação de workflows conectando gatilhos (*triggers*) a ações
- Autenticação de usuários
- Persistência de dados e execução de fluxos em segundo plano
- Interface moderna e responsiva
## 🛠️ Tecnologias utilizadas
 
- **Next.js** (App Router) — framework full-stack React
- **Better Auth** — autenticação
- **Prisma** — ORM para modelagem e acesso ao banco de dados
- **Neon** — banco de dados PostgreSQL serverless
- **Inngest** — orquestração de jobs e execução de workflows em background
- **Polar** — pagamentos/assinaturas
- **shadcn/ui** — componentes de interface
- **lucide-react** — ícones
## 🚀 Como rodar localmente
 
```bash
# Clonar o repositório
git clone https://github.com/mrJoao28/n8ncopy.git
cd n8ncopy
 
# Instalar dependências
npm install
 
# Configurar variáveis de ambiente
cp .env.example .env
# Preencher com suas credenciais (banco de dados, auth, etc.)
 
# Rodar as migrações do banco
npx prisma migrate dev
 
# Iniciar o servidor de desenvolvimento
npm run dev
```
 
Acesse `http://localhost:3000` no navegador.
 
## 📚 O que aprendi
 
- Modelagem de dados com Prisma para representar workflows, nós e execuções
- Autenticação e proteção de rotas em uma aplicação Next.js
- Execução assíncrona e confiável de tarefas em background com Inngest
- Estruturação de um projeto full-stack de ponta a ponta, do banco de dados à interface
## 📌 Status
 
Projeto em desenvolvimento/estudo — funcionalidades sendo adicionadas conforme o aprendizado avança.
 
## 👤 Autor
 
**João Felipe** — estudante de Engenharia de Computação (UEA)
[GitHub](https://github.com/mrJoao28)
