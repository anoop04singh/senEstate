import { showError, showSuccess } from "@/utils/toast";

const SENSAY_API_BASE_URL = "https://api.sensay.io/v1";
const API_VERSION = "2025-03-25";
const SENSAY_API_KEY = import.meta.env.VITE_SENSAY_API_KEY;

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
  console.log("[API] AI Agent created successfully:", data);
  showSuccess("AI Agent created successfully!");
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

export const requestFileUpload = async (replicaId: string, filename: string, title?: string) => {
    const body: { filename: string; title?: string } = { filename };
    if (title) body.title = title;
    console.log(`[API] Requesting file upload for replica ${replicaId}:`, body);

    const response = await fetch(`${SENSAY_API_BASE_URL}/replicas/${replicaId}/knowledge-base`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("[API] Failed to initiate file upload:", errorData);
        showError(`Failed to initiate file upload: ${errorData.message || 'Unknown error'}`);
        return null;
    }
    
    const data = await response.json();
    console.log("[API] File upload request successful, received signed URL info:", data);
    return data;
};

export const uploadFileToSignedUrl = async (signedUrl: string, file: File) => {
    console.log(`[API] Uploading file "${file.name}" to signed URL.`);
    const response = await fetch(signedUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': file.type,
        },
        body: file,
    });

    if (!response.ok) {
        console.error("[API] File upload to signed URL failed:", response.statusText);
        showError('File upload failed.');
        return false;
    }

    console.log("[API] File uploaded successfully to signed URL.");
    showSuccess('File uploaded successfully! Processing has started.');
    return true;
};

export const addUrlKnowledge = async (replicaId: string, url: string, title?: string) => {
  const body: { url: string; title?: string } = { url };
  if (title) body.title = title;
  console.log(`[API] Adding URL knowledge to replica ${replicaId}:`, body);

  const response = await fetch(`${SENSAY_API_BASE_URL}/replicas/${replicaId}/knowledge-base`, {
    method: "POST",
    headers: getAdminHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("[API] Failed to add URL knowledge:", errorData);
    showError(`Failed to add URL knowledge: ${errorData.message || 'Unknown error'}`);
    return null;
  }
  
  const data = await response.json();
  console.log("[API] URL knowledge added successfully:", data);
  showSuccess("URL knowledge added! Processing has started.");
  return data;
};