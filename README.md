# n8ncopy
 
A functional clone of a workflow automation tool in the style of **n8n / Zapier**, built as a full-stack study project. The goal was to create, connect, and run automation workflows visually while understanding how platforms like this are structured under the hood.
 
> Study project based on the tutorial *"Build and Deploy an N8N & Zapier Clone"* (Code with Antonio), built to deepen knowledge of modern full-stack architecture and automation.
 
## ✨ About the project
 
The goal was to replicate, from scratch, the core pillars of a real automation platform:
 
- Building workflows by connecting triggers to actions
- User authentication
- Data persistence and background workflow execution
- A modern, responsive interface
## 🛠️ Tech stack
 
- **Next.js** (App Router) — full-stack React framework
- **Better Auth** — authentication
- **Prisma** — ORM for data modeling and database access
- **Neon** — serverless PostgreSQL database
- **Inngest** — background job orchestration and workflow execution
- **Polar** — payments/subscriptions
- **shadcn/ui** — UI components
- **lucide-react** — icons
## 🚀 Running locally
 
\`\`\`bash
# Clone the repository
git clone https://github.com/mrJoao28/n8ncopy.git
cd n8ncopy
 
# Install dependencies
npm install
 
# Set up environment variables
cp .env.example .env
# Fill in your credentials (database, auth, etc.)
 
# Run database migrations
npx prisma migrate dev
 
# Start the development server
npm run dev
\`\`\`
 
Open \`http://localhost:3000\` in your browser.
 
## 📚 What I learned
 
- Data modeling with Prisma to represent workflows, nodes, and executions
- Authentication and route protection in a Next.js application
- Reliable asynchronous background task execution with Inngest
- Structuring a full-stack project end-to-end, from the database to the UI
## 📌 Status
 
Work in progress / study project — features are being added as learning progresses.
 
## 👤 Author
 
**João Felipe** — Computer Engineering student (UEA)
[GitHub](https://github.com/mrJoao28)
