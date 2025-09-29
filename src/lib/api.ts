import { showError, showSuccess } from "@/utils/toast";

const SENSAY_API_BASE_URL = "https://api.sensay.io/v1";
const API_VERSION = "2025-03-25";

const getHeaders = () => {
  const apiKey = localStorage.getItem("sensay_api_key");
  const userId = localStorage.getItem("sensay_user_id");

  if (!apiKey) {
    throw new Error("API Key not found. Please set it on the dashboard.");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "X-API-Version": API_VERSION,
    "X-ORGANIZATION-SECRET": apiKey,
  };

  if (userId) {
    headers["X-USER-ID"] = userId;
  }

  return headers;
};

export const createUser = async (userId: string) => {
  const apiKey = localStorage.getItem("sensay_api_key");
  if (!apiKey) throw new Error("API Key not found.");

  const response = await fetch(`${SENSAY_API_BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Version": API_VERSION,
      "X-ORGANIZATION-SECRET": apiKey,
    },
    body: JSON.stringify({ id: userId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to create user:", errorData);
    showError("Failed to create user.");
    return null;
  }

  return response.json();
};

export const getReplicas = async () => {
  const response = await fetch(`${SENSAY_API_BASE_URL}/replicas`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    showError("Failed to fetch AI agents.");
    return [];
  }
  const data = await response.json();
  return data.items || [];
};

export const createReplica = async (replicaData: {
  name: string;
  shortDescription: string;
  greeting: string;
  slug: string;
}) => {
  const userId = localStorage.getItem("sensay_user_id");
  if (!userId) {
    showError("User ID not found. Cannot create agent.");
    return null;
  }

  const response = await fetch(`${SENSAY_API_BASE_URL}/replicas`, {
    method: "POST",
    headers: getHeaders(),
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
    showError(`Failed to create agent: ${errorData.message || 'Unknown error'}`);
    return null;
  }
  
  showSuccess("AI Agent created successfully!");
  return response.json();
};