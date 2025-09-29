# senEstate - Community of Estate Agents

<img width="2000" height="1000" alt="senEstatewh" src="https://github.com/user-attachments/assets/18983e83-ee1b-4343-8a1d-6b09785ed93a" />

senEstate is a powerful, open-source platform that allows real estate professionals to create, manage, and deploy personalized AI assistants. These agents can be trained on specific property listings and neighborhood data to provide instant, 24/7 support to potential clients, automating lead qualification and answering common questions.

## The Impact: Relief for Real Estate Agents

The modern real estate market is demanding, with clients expecting immediate responses at all hours. senEstate is designed to alleviate this pressure by providing a tireless digital assistant.

-   **24/7 Availability:** Your AI agent works around the clock to answer questions about property details, virtual tours, and neighborhood amenities, ensuring no lead goes cold.
-   **Automated Lead Qualification:** The AI can handle initial inquiries, freeing up agents to focus on high-intent clients and complex negotiations.
-   **Instant, Accurate Information:** By training the AI on your specific listings, you ensure that clients receive consistent and accurate information every time.
-   **Focus on What Matters:** Automate repetitive tasks and dedicate your valuable time to building client relationships, hosting viewings, and closing deals.

## Features

-   **Simple AI Agent Creation:** A user-friendly form to create and personalize a new AI assistant with a unique name, personality, and profile image.
-   **Dynamic Knowledge Base:** Easily add new property listings through a structured form. The AI learns this information and uses it in conversations.
-   **Live Chat Interface:** A clean, responsive, and shareable chat page for clients to interact with your AI agent.
-   **Centralized Dashboard:** View and manage all your created AI agents from a single, intuitive dashboard.
-   **Light & Dark Mode:** A sleek interface that adapts to user preferences.
-   **Powered by Sensay:** Built on a robust and scalable AI platform for reliable performance.

## Architecture Overview

The application operates as a client-side interface that communicates directly with the Sensay API. There is no custom backend, which simplifies deployment and maintenance. All data, including AI agents (replicas) and their knowledge, is stored and managed by Sensay.

The diagram below illustrates the workflow:

```ascii
+-------------------------+      +--------------------------------+
|      User's Browser     |      |        End User's Browser      |
| (Real Estate Agent)     |      |        (Potential Client)      |
+-------------------------+      +--------------------------------+
            |                                      |
            | (HTTPS Requests)                     | (HTTPS Requests)
            v                                      v
+----------------------------------------------------------------+
|                    React Frontend (senEstate)                    |
|----------------------------------------------------------------|
| - Dashboard (View Agents)                                      |
| - Create Agent Form                                            |
| - Knowledge Management Form (Add/Remove Property Listings)     |
| - Live Chat Interface                                          |
+----------------------------------------------------------------+
            |
            | (Secure API Calls with VITE_SENSAY_API_KEY)
            v
+----------------------------------------------------------------+
|                        Sensay API Backend                        |
|----------------------------------------------------------------|
|                                                                |
|  [POST /replicas] <----------- Create a new AI Agent           |
|  [GET /replicas]  <------------ Fetch all agents for Dashboard |
|                                                                |
|  [POST /replicas/{id}/knowledge-base] <-- Add Property Listing |
|  [GET /replicas/{id}/knowledge-base]  <-- View Knowledge Items |
|  [DELETE /replicas/{id}/knowledge-base/{kb_id}] <-- Delete Item|
|                                                                |
|  [POST /replicas/{id}/chat/completions] <-- Send/Receive Chat  |
|                                                                |
+----------------------------------------------------------------+
```

### Workflow Explained:

1.  **Admin (Real Estate Agent):** The agent uses the senEstate dashboard to manage their AI assistants.
    -   **Creating an Agent:** The "Create Agent" form sends a `POST` request to `/replicas` on the Sensay API.
    -   **Managing Knowledge:** Adding a property listing sends a `POST` request to the `/replicas/{id}/knowledge-base` endpoint. The dashboard fetches existing knowledge with a `GET` request to the same endpoint.
2.  **Client (Home Buyer):** The client interacts with the AI through the public-facing chat page.
    -   **Chatting:** Each message sent by the client triggers a `POST` request to the `/replicas/{id}/chat/completions` endpoint. The AI's response is received from the Sensay API and displayed in the chat interface.

All state and data are managed by Sensay, making the frontend a stateless and highly scalable interface.

## Setup Instructions

Follow these steps to get the application running on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/), or [pnpm](https://pnpm.io/) package manager
-   A **Sensay API Key**. You can get one from the [Sensay Platform](https://sensay.io/).

### 1. Clone the Repository

Clone the project to your local machine:

```bash
git clone https://github.com/your-username/senEstate.git
cd senEstate
```

### 2. Install Dependencies

Install the required npm packages:

```bash
npm install
```

### 3. Configure Environment Variables

Create a new file named `.env` in the root of the project directory. This file will hold your Sensay API key.

```bash
touch .env
```

Open the `.env` file and add your API key as follows:

```
VITE_SENSAY_API_KEY="your_secret_token_here"
```

> **Important:** The `.env` file is listed in `.gitignore`, so your API key will not be accidentally committed to a public repository.

### 4. Run the Development Server

Start the local development server:

```bash
npm run dev
```

The application should now be running and accessible at `http://localhost:8080` (or another port if 8080 is in use).

## Technology Stack

-   **Framework:** [React](https://react.dev/) with [Vite](https://vitejs.dev/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [Shadcn/UI](https://ui.shadcn.com/)
-   **Routing:** [React Router](https://reactrouter.com/)
-   **Data Fetching:** [TanStack Query](https://tanstack.com/query/)
-   **Form Management:** [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation
-   **AI Backend:** [Sensay API](https://sensay.io/)
-   **Icons:** [Lucide React](https://lucide.dev/)

---

*This project was built with the assistance of [Dyad](https://www.dyad.sh/), an AI coding partner.*
