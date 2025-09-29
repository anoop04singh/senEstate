import { showError, showSuccess } from "@/utils/toast";

const SENSAY_API_BASE_URL = "https://api.sensay.io/v1";
const API_VERSION = "2025-03-25";
const SENSAY_API_KEY = import.meta.env.VITE_SENSAY_API_KEY;

const REAL_ESTATE_AGENT_GUIDE = `You are a specialized real estate AI assistant. Your purpose is to help clients find properties and answer their questions about the real estate market.

**Your Persona:**
- You are professional, friendly, and highly knowledgeable.
- You are proactive and helpful.
- Your tone should be encouraging and supportive throughout the user's home-buying journey.

**Your Core Directives:**
1.  **Provide Property Information:** When asked about specific properties, use the information from your knowledge base. Property listings are stored in a structured JSON format. You must parse this information and present it to the user in a clear, easy-to-read format.
2.  **Highlight Virtual Tours:** If a property listing in your knowledge base includes links for virtual tours (videos, 3D models) or photo galleries, you MUST share these links with the user. Encourage them to explore the property visually. For example, say "You can take a virtual tour here: [link]" or "Here are some photos of the property: [link]".
3.  **Answer General Questions:** Use the general knowledge you're provided to answer questions about neighborhoods, the home-buying process, financing, etc.
4.  **Be Honest:** If you do not have information on a specific topic or property, state that clearly. Do not invent details. You can say something like, "I don't have the details for that specific property, but I can tell you about others in the area."

**Example of handling a property query:**
When you find a JSON listing like this:
\`\`\`json
{
  "address": "123 Oak Avenue, Springfield, IL 62704",
  "price": 250000,
  "bedrooms": 3,
  "bathrooms": 2,
  "sqft": 1800,
  "description": "Charming single-family home with a large backyard, updated kitchen, and a two-car garage. Located in a quiet, family-friendly neighborhood close to parks and schools.",
  "virtualTourUrl": "https://example.com/tour/123-oak",
  "photoUrls": ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"]
}
\`\`\`

You should present it to the user like this:

"I have a great property for you at 123 Oak Avenue! It's a charming 3-bedroom, 2-bathroom home with 1,800 sqft of space. The description mentions it has a large backyard and an updated kitchen. It's listed for $250,000.

Would you like to see more?
- You can take a virtual tour here: https://example.com/tour/123-oak
- Here's a link to the photo gallery: https://example.com/photo1.jpg, https://example.com/photo2.jpg"
`;

// Headers for requests made on behalf of a user
const getUserHeaders = () => {
  const userId = localStorage.getItem("sensay_user_id");
  console.log(`[API] Using User Headers with User ID: ${userId}`);

  if (!SENSAY_API_KEY) {
    console.error("[API] API Key not found in .env file.");
    throw new Error("API Key not found. Please set VITE_SENSAY_API_KEY in your .env file.");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "X-API-Version": API_VERSION,
    "X-ORGANIZATION-SECRET": SENSAY_API_KEY,
  };

  if (userId) {
    headers["X-USER-ID"] = userId;
  }

  return headers;
};

// Headers for admin-level requests (organization only)
const getAdminHeaders = () => {
  console.log("[API] Using Admin Headers (Organization Secret only)");
  if (!SENSAY_API_KEY) {
    console.error("[API] API Key not found in .env file.");
    throw new Error("API Key not found. Please set VITE_SENSAY_API_KEY in your .env file.");
  }

  return {
    "Content-Type": "application/json",
    "X-API-Version": API_VERSION,
    "X-ORGANIZATION-SECRET": SENSAY_API_KEY,
  };
};


export const createUser = async (userId: string) => {
  console.log(`[API] Initiating user creation for ID: ${userId}`);
  if (!SENSAY_API_KEY) {
    showError("API Key not configured.");
    console.error("[API] createUser failed: API Key not configured.");
    throw new Error("API Key not found. Please set VITE_SENSAY_API_KEY in your .env file.");
  }

  const response = await fetch(`${SENSAY_API_BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Version": API_VERSION,
      "X-ORGANIZATION-SECRET": SENSAY_API_KEY,
    },
    body: JSON.stringify({ id: userId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("[API] Failed to create user:", errorData);
    showError("Failed to create user.");
    return null;
  }

  const data = await response.json();
  console.log("[API] User created successfully:", data);
  return data;
};

export const getReplicas = async () => {
  console.log("[API] Fetching replicas...");
  const response = await fetch(`${SENSAY_API_BASE_URL}/replicas`, {
    headers: getAdminHeaders(),
  });
  if (!response.ok) {
    console.error("[API] Failed to fetch AI agents:", response.statusText);
    showError("Failed to fetch AI agents.");
    return [];
  }
  const data = await response.json();
  console.log("[API] Replicas fetched successfully:", data.items);
  return data.items || [];
};

export const getReplica = async (replicaId: string) => {
  console.log(`[API] Fetching replica: ${replicaId}`);
  const response = await fetch(`${SENSAY_API_BASE_URL}/replicas/${replicaId}`, {
    headers: getAdminHeaders(),
  });
  if (!response.ok) {
    console.error(`[API] Failed to fetch replica ${replicaId}:`, response.statusText);
    showError("Failed to fetch AI agent details.");
    return null;
  }
  const data = await response.json();
  console.log(`[API] Replica ${replicaId} fetched successfully:`, data);
  return data;
};

export const createReplica = async (replicaData: {
  name: string;
  shortDescription: string;
  greeting: string;
  slug: string;
}) => {
  const userId = localStorage.getItem("sensay_user_id");
  console.log("[API] Initiating replica creation with data:", replicaData);
  if (!userId) {
    showError("User ID not found. Cannot create agent.");
    console.error("[API] createReplica failed: User ID not found.");
    return null;
  }

  const response = await fetch(`${SENSAY_API_BASE_URL}/replicas`, {
    method: "POST",
    headers: getAdminHeaders(),
    body: JSON.stringify({
      ...replicaData,
      ownerID: userId,
      llm: {
        provider: "openai",
        model: "gpt-4o",
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("[API] Failed to create agent:", errorData);
    showError(`Failed to create agent: ${errorData.message || 'Unknown error'}`);
    return null;
  }
  
  const data = await response.json();
  
  if (data && data.uuid) {
    console.log(`[API] Replica created. Now adding real estate guide to replica ${data.uuid}`);
    await addTextKnowledge(data.uuid, REAL_ESTATE_AGENT_GUIDE, "Core Instructions: Real Estate Agent Guide");
  }

  console.log("[API] AI Agent created and configured successfully:", data);
  showSuccess("AI Agent created successfully!");
  return data;
};

export const sendChatMessage = async (replicaId: string, content: string) => {
  console.log(`[API] Sending chat message to replica ${replicaId}`);
  const response = await fetch(`${SENSAY_API_BASE_URL}/replicas/${replicaId}/chat/completions`, {
    method: 'POST',
    headers: getUserHeaders(),
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("[API] Failed to send chat message:", errorData);
    showError(`Failed to send message: ${errorData.message || 'Unknown error'}`);
    return null;
  }

  const data = await response.json();
  console.log("[API] Chat message response received:", data);
  return data;
};

export const getKnowledgeBase = async (replicaId: string) => {
  console.log(`[API] Fetching knowledge base for replica: ${replicaId}`);
  const response = await fetch(`${SENSAY_API_BASE_URL}/replicas/${replicaId}/knowledge-base`, {
    headers: getAdminHeaders(),
  });
  if (!response.ok) {
    console.error(`[API] Failed to fetch knowledge base for replica ${replicaId}:`, response.statusText);
    showError("Failed to fetch knowledge base.");
    return [];
  }
  const data = await response.json();
  console.log(`[API] Knowledge base for replica ${replicaId} fetched successfully:`, data.items);
  return data.items || [];
};

export const addTextKnowledge = async (replicaId: string, text: string, title?: string) => {
  const body: { text: string; title?: string } = { text };
  if (title) body.title = title;
  console.log(`[API] Adding text knowledge to replica ${replicaId}:`, body);

  const response = await fetch(`${SENSAY_API_BASE_URL}/replicas/${replicaId}/knowledge-base`, {
    method: "POST",
    headers: getAdminHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("[API] Failed to add text knowledge:", errorData);
    showError(`Failed to add text knowledge: ${errorData.message || 'Unknown error'}`);
    return null;
  }
  
  const data = await response.json();
  console.log("[API] Text knowledge added successfully:", data);
  showSuccess("Text knowledge added! Processing has started.");
  return data;
};

export const deleteKnowledgeBaseItem = async (replicaId: string, knowledgeId: number) => {
  console.log(`[API] Deleting knowledge base item ${knowledgeId} from replica ${replicaId}`);
  const response = await fetch(`${SENSAY_API_BASE_URL}/replicas/${replicaId}/knowledge-base/${knowledgeId}`, {
    method: 'DELETE',
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("[API] Failed to delete knowledge base item:", errorData);
    showError(`Failed to delete item: ${errorData.message || 'Unknown error'}`);
    return null;
  }

  console.log(`[API] Knowledge base item ${knowledgeId} deleted successfully.`);
  showSuccess("Knowledge base item deleted.");
  return { success: true };
};