# n8ncopy

> A full-stack workflow automation platform inspired by **n8n** and **Zapier**, built with Next.js, React Flow, tRPC, Prisma, PostgreSQL/Neon and Inngest.

n8ncopy is a study project that reproduces the core architecture of a visual workflow automation platform: users create workflows visually, connect trigger/action nodes, configure AI providers and HTTP requests, save credentials securely, and execute workflows asynchronously in the background.

The project is based on the tutorial **"Build and Deploy an N8N & Zapier Clone" by Code with Antonio**, with additional implementation and experimentation around authentication, credentials, AI nodes, execution, persistence and workflow orchestration.

---

## ✨ Features

### 🔐 Authentication

Authentication is implemented with **Better Auth** and Prisma.

Supported authentication flows include:

- Email/password authentication
- Automatic sign-in after registration
- Google OAuth
- GitHub OAuth
- Account linking for trusted social providers
- Persistent sessions stored in PostgreSQL
- Protected server procedures

The application also integrates **Polar** for authenticated checkout, customer creation, subscription portal access and webhook handling.

### 🔄 Visual workflow builder

Workflows are represented as graphs made of nodes and connections.

The data model supports:

- Creating workflows
- Renaming workflows
- Deleting workflows
- Loading an individual workflow
- Listing workflows
- Searching workflows
- Pagination
- Creating and positioning nodes
- Connecting nodes with edges
- Persisting node configuration as JSON
- Persisting graph connections
- Executing a saved workflow

The frontend uses **React Flow (`@xyflow/react`)** for the node-based editor.

### 🧩 Supported node types

The current Prisma `NodeType` enum contains:

| Node | Purpose |
|---|---|
| `INITIAL` | Initial workflow node |
| `MANUAL_TRIGGER` | Starts a workflow manually |
| `HTTP_REQUEST` | Performs an HTTP request |
| `GOOGLE_FORM_TRIGGER` | Starts a workflow from a Google Form trigger |
| `GEMINI` | Runs a Google Gemini AI operation |
| `OPENAI` | Runs an OpenAI AI operation |
| `ANTHROPIC` | Runs an Anthropic AI operation |

Each node type has an executor registered in the execution registry.

### 🌐 HTTP Request automation

The HTTP Request node supports:

- `GET`
- `POST`
- `PUT`
- `DELETE`
- Dynamic endpoints
- Dynamic request bodies
- Handlebars template interpolation
- JSON request bodies
- JSON responses
- Text responses
- HTTP status information
- Execution status updates
- Error propagation

Workflow context can be injected into the endpoint and body using Handlebars templates.

For example:

```text
https://api.example.com/users/{{user.id}}
```

or:

```json
{
  "name": "{{user.name}}",
  "email": "{{user.email}}"
}
```

### 🤖 AI workflow nodes

The execution system includes dedicated executors for:

- Google Gemini
- OpenAI
- Anthropic

Provider credentials can be associated with AI nodes and selected from the user's stored credentials.

The project includes the corresponding Vercel AI SDK providers:

- `@ai-sdk/google`
- `@ai-sdk/openai`
- `@ai-sdk/anthropic`

### 🔑 Credential management

Users can create, update, list, search and delete credentials.

Currently supported credential types are:

- Gemini
- OpenAI
- Anthropic

Credentials are **not stored as plaintext**. Secrets are encrypted using **AES-256-GCM** before being persisted.

The encrypted credential value is intentionally excluded from responses sent to the client.

For production, the application requires:

```env
CREDENTIALS_ENCRYPTION_KEY=your-strong-random-secret
```

### ⚙️ Background workflow execution

Workflow execution is handled asynchronously by **Inngest**.

The execution pipeline is:

```text
User clicks Execute
        │
        ▼
Protected tRPC mutation
        │
        ▼
Inngest event
        │
        ▼
execute-workflow function
        │
        ▼
Load workflow from PostgreSQL
        │
        ▼
Topological sort
        │
        ▼
Resolve executor for each node
        │
        ▼
Execute nodes sequentially
        │
        ▼
Return final workflow context
```

This allows the workflow engine to execute outside the normal HTTP request lifecycle and provides a foundation for retries, durable execution and realtime execution state.

### 🧠 Graph execution

Before executing a workflow, its nodes and connections are loaded from the database and sorted topologically.

This ensures that nodes are executed according to the dependency graph rather than simply according to their database order.

The executor registry maps each node type to its implementation:

```text
NodeType
   │
   ▼
Executor Registry
   ├── Manual Trigger
   ├── HTTP Request
   ├── Google Form Trigger
   ├── Gemini
   ├── OpenAI
   └── Anthropic
```

### 📡 Realtime execution status

Execution components can publish status events through Inngest realtime channels.

For example, the HTTP Request executor reports states such as:

- `loading`
- `success`
- `error`

This gives the application a foundation for displaying live workflow execution feedback.

### 💳 Subscriptions and payments

Polar is integrated through `@polar-sh/better-auth` and the Polar SDK.

The authentication configuration includes:

- Pro product checkout
- Authenticated-user-only checkout
- Customer creation on sign-up
- Customer portal
- Subscription/order webhooks

The application has a `premiumProcedure` used for operations that require the premium plan, such as workflow creation.

### 🔎 Workflow search and pagination

Workflow listing supports:

- Page number
- Page size
- Case-insensitive search
- Total item count
- Total pages
- Next-page detection
- Previous-page detection
- Ordering by most recently updated

Query parameters are managed with **nuqs**.

### 🧱 Type-safe API with tRPC

The application uses **tRPC v11** for communication between the frontend and backend.

This provides:

- Type-safe queries
- Type-safe mutations
- Zod input validation
- Protected procedures
- Premium procedures
- Shared TypeScript types

The workflow router currently provides operations including:

```text
workflow.create
workflow.remove
workflow.update
workflow.updateName
workflow.getOne
workflow.getMany
workflow.execute
```

Credential operations include:

```text
credentials.create
credentials.update
credentials.remove
credentials.getOne
credentials.getMany
```

---

## 🏗️ Project architecture

The application is organized as a Next.js full-stack project using feature-oriented modules.

```text
n8ncopy/
├── prisma/
│   └── schema.prisma
│
├── public/
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── ...
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   └── ui/
│   │
│   ├── config/
│   │
│   ├── features/
│   │   ├── credentials/
│   │   │   ├── components/
│   │   │   └── server/
│   │   │
│   │   ├── executions/
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   └── types.ts
│   │   │
│   │   ├── triggers/
│   │   │   └── components/
│   │   │
│   │   └── workflows/
│   │       ├── components/
│   │       ├── params.ts
│   │       └── server/
│   │           └── routers.ts
│   │
│   ├── generated/
│   │   └── prisma/
│   │
│   ├── hooks/
│   │
│   ├── inngest/
│   │   ├── channels.ts
│   │   ├── client.ts
│   │   ├── functions.ts
│   │   └── utils.ts
│   │
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── encryption.ts
│   │   └── polar.ts
│   │
│   └── trpc/
│       ├── client.tsx
│       ├── init.ts
│       └── routers/
│
├── package.json
├── prisma.config.ts
├── tsconfig.json
└── ...
```

> The exact UI/component file list can evolve as the project develops. The architecture above represents the main application boundaries and feature modules.

---

## 🗄️ Database architecture

The project uses **Prisma 7** with PostgreSQL and the **Neon Prisma adapter**.

The database schema contains the following main models.

### User

Stores application users and their relationships with:

- Sessions
- Accounts
- Workflows
- Credentials

### Session

Stores Better Auth sessions, including:

- Expiration
- Session token
- IP address
- User agent
- Associated user

### Account

Stores authentication-provider accounts and OAuth tokens.

### Verification

Stores verification information used by the authentication system.

### Workflow

Represents an automation workflow.

Fields include:

- ID
- Name
- Creation date
- Update date
- Owner
- Nodes
- Connections

### Node

Represents an individual workflow step.

Fields include:

- Node ID
- Workflow ID
- Node name
- Node type
- Position
- Arbitrary JSON configuration
- Input connections
- Output connections

### Connection

Represents an edge between two workflow nodes.

It stores:

- Source node
- Target node
- Source output
- Target input

A unique constraint prevents duplicate connections with the same source, target and handles.

### Credential

Stores a user's provider credential.

The secret itself is encrypted before persistence.

---

## 🔐 Credential security

Credential encryption is implemented in:

```text
src/lib/encryption.ts
```

The implementation uses:

```text
AES-256-GCM
        │
        ├── Random 12-byte IV
        ├── Authentication tag
        └── Encrypted secret
```

The stored value is encoded as:

```text
IV:AUTH_TAG:ENCRYPTED_DATA
```

The encryption key is derived with `scrypt` from `CREDENTIALS_ENCRYPTION_KEY`.

In production, the application refuses to use the development fallback key.

---

## 🔄 Workflow lifecycle

A workflow generally goes through the following lifecycle:

```text
Create workflow
      │
      ▼
Initial node created
      │
      ▼
Open workflow editor
      │
      ▼
Add/configure nodes
      │
      ▼
Connect nodes
      │
      ▼
Save nodes + edges
      │
      ▼
Execute workflow
      │
      ▼
Inngest event
      │
      ▼
Topological execution
      │
      ▼
Node executors
      │
      ▼
Final context/result
```

---

## 🧠 Execution context

Each executor receives a context containing data produced by previous nodes.

Conceptually:

```text
Initial context
      │
      ▼
Node A
      │
      ▼
Updated context
      │
      ▼
Node B
      │
      ▼
Updated context
      │
      ▼
Node C
      │
      ▼
Final context
```

This makes it possible for later nodes to use values generated by earlier nodes.

For example, an HTTP Request can use values from the workflow context through Handlebars interpolation.

---

## 🧰 Tech stack

| Technology | Purpose |
|---|---|
| **Next.js 15** | Full-stack React framework |
| **React 19** | UI |
| **TypeScript** | Application language |
| **React Flow** | Visual workflow editor |
| **tRPC 11** | Type-safe API |
| **TanStack React Query** | Server-state management |
| **Jotai** | Client state management |
| **Prisma 7** | ORM/database access |
| **Neon** | Serverless PostgreSQL |
| **Better Auth** | Authentication |
| **Inngest** | Background workflow execution |
| **Polar** | Payments and subscriptions |
| **Vercel AI SDK** | AI provider abstraction/execution |
| **Google AI SDK** | Gemini integration |
| **OpenAI SDK** | OpenAI integration |
| **Anthropic SDK** | Anthropic integration |
| **Zod** | Input validation |
| **shadcn/ui** | UI components |
| **Tailwind CSS 4** | Styling |
| **Biome** | Formatting and linting |
| **Handlebars** | Dynamic workflow templates |
| **ky** | HTTP requests |
| **Sentry** | Error monitoring |
| **Sonner** | Notifications |
| **nuqs** | URL/query-state management |

---

## ⚙️ Requirements

Before running the project locally, install:

- Node.js
- npm
- PostgreSQL-compatible database, preferably Neon
- Git
- Accounts/API credentials for the providers you want to use
- Inngest account/CLI setup for background execution
- Polar configuration if subscription functionality is required

The project currently uses npm scripts rather than Bun scripts.

---

## 🚀 Installation

Clone the repository:

```bash
git clone https://github.com/mrJoao28/n8ncopy.git
cd n8ncopy
```

Install dependencies:

```bash
npm install
```

---

## 🔐 Environment variables

Create a `.env` file in the project root.

At minimum, configure the database:

```env
DATABASE_URL="your-neon-postgresql-connection-string"
```

For production credential encryption:

```env
CREDENTIALS_ENCRYPTION_KEY="your-strong-random-secret"
```

Authentication requires the relevant Better Auth configuration, including the OAuth credentials if Google/GitHub login is enabled:

```env
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
```

AI integrations require the provider credentials used by your selected nodes, such as the corresponding Google, OpenAI or Anthropic API credentials.

Polar configuration is required if checkout/subscription functionality is enabled:

```env
POLAR_PRO_PRODUCT_ID="..."
POLAR_SUCCESS_URL="..."
POLAR_WEBHOOK_SECRET="..."
```

> Do not commit `.env` or API keys to Git. The exact environment-variable set can change as the project evolves; check the provider initialization files under `src/lib`, `src/inngest` and the AI executor modules when adding a new integration.

---

## 🗃️ Database setup

Generate the Prisma client:

```bash
npx prisma generate
```

Apply development migrations:

```bash
npx prisma migrate dev
```

If the project database schema needs to be synchronized without creating a migration:

```bash
npx prisma db push
```

Open Prisma Studio:

```bash
npx prisma studio
```

The generated Prisma client is configured under:

```text
src/generated/prisma
```

---

## ▶️ Run the application

Start the development server:

```bash
npm run dev
```

The project uses:

```text
next dev --turbopack
```

Open:

```text
http://localhost:3000
```

---

## 📦 Available npm scripts

From `package.json`:

```bash
npm run dev
```

Starts Next.js in development mode with Turbopack.

```bash
npm run build
```

Creates the production build.

```bash
npm run start
```

Starts the compiled Next.js application.

```bash
npm run lint
```

Runs Biome checks.

```bash
npm run format
```

Formats the project with Biome.

---

## 🧪 Development workflow

A typical development cycle is:

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Then:

1. Create/sign in to a user account.
2. Create a workflow.
3. Open the workflow editor.
4. Add trigger/action nodes.
5. Configure credentials where required.
6. Connect the nodes.
7. Save the workflow.
8. Execute it.
9. Let Inngest process the workflow in the background.

---

## 🔌 tRPC architecture

The application separates API concerns into routers and procedures.

```text
React UI
   │
   ▼
TanStack Query / tRPC client
   │
   ▼
tRPC server
   │
   ├── Authentication check
   ├── Zod validation
   ├── Prisma
   └── Inngest
```

The workflow router uses protected procedures for user-owned resources and a premium procedure for workflow creation.

Every workflow query/mutation verifies the authenticated user's ownership before accessing the workflow.

---

## 🛡️ Authorization model

Workflow and credential resources are scoped to the authenticated user.

For example, workflow operations use conditions equivalent to:

```text
workflow.id = requestedId
AND
workflow.userId = authenticatedUser.id
```

This prevents a user from directly reading, modifying or deleting another user's workflows through the tRPC procedures.

Credential operations follow the same ownership model.

---

## 🧩 Adding a new workflow node

The architecture is designed around node executors.

A new node generally requires:

1. Add a value to the Prisma `NodeType` enum.
2. Create the node's UI/configuration component.
3. Create its executor.
4. Register the executor in:

```text
src/features/executions/lib/executor-registry.ts
```

5. Add any required credential type.
6. Add the required provider/API dependency.
7. Add validation/configuration fields.
8. Test the node inside a workflow.

The executor registry is the central mapping between persisted node types and runtime behavior.

---

## 🧠 AI node architecture

AI nodes follow the same executor pattern as other workflow nodes.

```text
Workflow Node
     │
     ▼
NodeType.GEMINI / OPENAI / ANTHROPIC
     │
     ▼
Executor Registry
     │
     ▼
Provider Executor
     │
     ├── Load credential
     ├── Decrypt secret
     ├── Build AI request
     ├── Execute provider
     └── Return updated context
```

This keeps provider-specific implementation isolated from the workflow engine.

---

## 🧭 Architecture decisions

### Feature-oriented organization

Domain-specific functionality lives under `src/features` instead of putting all business logic into generic folders.

### tRPC instead of REST

The project uses tRPC to keep client/server contracts type-safe and reduce duplicated API types.

### Prisma + Neon

Prisma provides the data model and queries while Neon provides serverless PostgreSQL infrastructure.

### Inngest for execution

Workflow execution is separated from the web request using durable background functions.

### React Flow for graph editing

React Flow provides the node/edge editor while Prisma stores the graph in a database-friendly representation.

### Executor registry

Node execution is decoupled from the workflow engine through a registry, making new node types easier to add.

---

## ⚠️ Current project status

This repository is a **work in progress / study project**.

The main automation architecture is implemented, including:

- Authentication
- Workflow persistence
- Visual node/edge representation
- Workflow CRUD
- Workflow execution
- Inngest background processing
- Topological node execution
- HTTP requests
- Google Form trigger infrastructure
- Gemini/OpenAI/Anthropic executors
- Credential management
- AES-256-GCM credential encryption
- Polar checkout/subscription integration
- tRPC API
- Pagination and search

Some integrations and product/business logic may still require additional configuration or implementation before being considered production-ready.

---

## 🔒 Security notes

Never commit:

- API keys
- OAuth client secrets
- Database passwords
- Polar secrets
- `CREDENTIALS_ENCRYPTION_KEY`
- Production environment files

For production deployments, always configure a strong random `CREDENTIALS_ENCRYPTION_KEY`. The application intentionally refuses to use the development encryption fallback when `NODE_ENV=production`.

---

## 📚 What this project demonstrates

This project is particularly useful as a full-stack portfolio/study project because it combines several production-oriented concepts in one application:

- Full-stack Next.js architecture
- React Flow graph editors
- Authentication and OAuth
- Authorization and resource ownership
- PostgreSQL data modeling
- Prisma ORM
- Type-safe APIs with tRPC
- Zod validation
- Background jobs
- Event-driven architecture
- Workflow graph execution
- Topological sorting
- AI provider integrations
- Secret encryption
- Payment/subscription integration
- Server/client state management
- Realtime execution feedback
- Error monitoring

---

## 👤 Author

**João Felipe** — Computer Engineering student at UEA.

GitHub: [@mrJoao28](https://github.com/mrJoao28)

Repository: https://github.com/mrJoao28/n8ncopy

---

## 📄 License

No explicit open-source license is currently specified in the repository. If this project is intended for external distribution or contributions, consider adding an appropriate license.
