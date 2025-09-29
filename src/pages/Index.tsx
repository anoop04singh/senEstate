import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createUser, getReplicas } from "@/lib/api";
import { Replica } from "@/types";
import { PlusCircle, ArrowUpRight, BrainCircuit, AlertTriangle, Bot } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const SENSAY_API_KEY = import.meta.env.VITE_SENSAY_API_KEY;

const Index = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(localStorage.getItem("sensay_user_id") || "");
  const [replicas, setReplicas] = useState<Replica[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (SENSAY_API_KEY) {
      const storedUserId = localStorage.getItem("sensay_user_id");
      if (!storedUserId) {
        const newUserId = `agent_${uuidv4()}`;
        createUser(newUserId).then((user) => {
          if (user) {
            localStorage.setItem("sensay_user_id", newUserId);
            setUserId(newUserId);
          } else {
            setError("Failed to initialize user. Please check your API key and refresh.");
            setIsLoading(false);
          }
        });
      } else {
        setUserId(storedUserId);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (SENSAY_API_KEY && userId) {
      setIsLoading(true);
      getReplicas()
        .then(setReplicas)
        .catch(() => setError("Failed to fetch agents."))
        .finally(() => setIsLoading(false));
    }
  }, [userId]);

  if (!SENSAY_API_KEY) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              Configuration Needed
            </CardTitle>
            <CardDescription>
              Your Sensay API Key is not configured.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Please create a <code className="bg-muted px-1 py-0.5 rounded">.env</code> file in the root of your project and add your API key:
            </p>
            <pre className="mt-2 p-2 bg-muted rounded text-left text-sm overflow-x-auto">
              <code>VITE_SENSAY_API_KEY="your_secret_token_here"</code>
            </pre>
            <p className="text-sm text-muted-foreground mt-4">
              After adding the key, you will need to restart the application.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-semibold text-destructive">{error}</h3>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Your AI Agents</h1>
          <p className="text-muted-foreground">Manage, configure, and deploy your real estate assistants.</p>
        </div>
        <Button onClick={() => navigate("/create-agent")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create New Agent
        </Button>
      </div>

      {isLoading ? (
        <p>Loading agents...</p>
      ) : replicas.length > 0 ? (
        <motion.div 
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.05 } }
          }}
        >
          {replicas.map((replica) => (
            <motion.div
              key={replica.uuid}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              whileHover={{ scale: 1.03, transition: { type: "spring", stiffness: 300 } }}
            >
              <Card className="h-full flex flex-col transition-all hover:shadow-lg hover:shadow-primary/20 dark:hover:shadow-primary/10">
                <CardHeader className="flex-row items-start gap-4">
                  <Avatar>
                    <AvatarImage src={replica.profile_image} alt={replica.name} />
                    <AvatarFallback><Bot /></AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle>{replica.name}</CardTitle>
                    <CardDescription>{replica.short_description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground italic">"{replica.introduction}"</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Link to={`/manage-knowledge/${replica.uuid}`}>
                    <Button variant="outline">
                      <BrainCircuit className="mr-2 h-4 w-4" />
                      Knowledge
                    </Button>
                  </Link>
                  <a href={`/agent/${replica.uuid}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost">
                      View Live <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <BotMessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold">No AI Agents Found</h3>
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