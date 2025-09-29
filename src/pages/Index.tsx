import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUser, getReplicas } from "@/lib/api";
import { Replica } from "@/types";
import { PlusCircle, ArrowUpRight, BrainCircuit } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const Index = () => {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState(localStorage.getItem("sensay_api_key") || "");
  const [userId, setUserId] = useState(localStorage.getItem("sensay_user_id") || "");
  const [replicas, setReplicas] = useState<Replica[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleApiKeySave = () => {
    localStorage.setItem("sensay_api_key", apiKey);
    // Check for user ID after saving key
    if (!userId) {
      const newUserId = `agent_${uuidv4()}`;
      createUser(newUserId).then(() => {
        localStorage.setItem("sensay_user_id", newUserId);
        setUserId(newUserId);
      });
    }
    window.location.reload(); // Reload to re-initialize API calls with new key
  };

  useEffect(() => {
    const storedApiKey = localStorage.getItem("sensay_api_key");
    const storedUserId = localStorage.getItem("sensay_user_id");

    if (storedApiKey) {
      if (!storedUserId) {
        const newUserId = `agent_${uuidv4()}`;
        createUser(newUserId).then((user) => {
          if (user) {
            localStorage.setItem("sensay_user_id", newUserId);
            setUserId(newUserId);
          }
        });
      } else {
        setUserId(storedUserId);
      }
    }
  }, [apiKey]);

  useEffect(() => {
    if (apiKey && userId) {
      setIsLoading(true);
      getReplicas()
        .then(setReplicas)
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [apiKey, userId]);

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Please enter your Sensay API Secret to continue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="apiKey">Sensay API Secret</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="your_secret_token"
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handleApiKeySave}>Save API Key</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your AI Agents</h1>
        <Button onClick={() => navigate("/create-agent")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create New Agent
        </Button>
      </div>

      {isLoading ? (
        <p>Loading agents...</p>
      ) : replicas.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {replicas.map((replica) => (
            <Card key={replica.uuid}>
              <CardHeader>
                <CardTitle>{replica.name}</CardTitle>
                <CardDescription>{replica.short_description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground italic">"{replica.introduction}"</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link to={`/manage-knowledge/${replica.uuid}`}>
                  <Button variant="outline">
                    <BrainCircuit className="mr-2 h-4 w-4" />
                    Manage Knowledge
                  </Button>
                </Link>
                <a href={`/agent/${replica.slug}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost">
                    View Live Page <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">No AI Agents Found</h3>
          <p className="text-muted-foreground mt-2">Get started by creating your first AI real estate agent.</p>
          <Button className="mt-4" onClick={() => navigate("/create-agent")}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Agent
          </Button>
        </div>
      )}
    </div>
  );
};

export default Index;