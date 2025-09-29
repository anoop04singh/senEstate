import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getReplica, sendChatMessage } from "@/lib/api";
import { Message } from "@/types";
import { useState, useEffect, useRef, FormEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const AgentChat = () => {
  const { replicaId } = useParams<{ replicaId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { data: replica, isLoading: isLoadingReplica } = useQuery({
    queryKey: ["replica", replicaId],
    queryFn: () => getReplica(replicaId!),
    enabled: !!replicaId,
  });

  const chatMutation = useMutation({
    mutationFn: (content: string) => sendChatMessage(replicaId!, content),
    onSuccess: (data) => {
      if (data && data.content) {
        setMessages((prev) => [
          ...prev,
          { id: uuidv4(), role: "assistant", content: data.content },
        ]);
      }
    },
  });

  useEffect(() => {
    if (replica && replica.introduction) {
      if (messages.length === 0) {
        setMessages([
          { id: uuidv4(), role: "assistant", content: replica.introduction },
        ]);
      }
    }
  }, [replica, messages.length]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;
    const userMessage: Message = { id: uuidv4(), role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    chatMutation.mutate(input.trim());
    setInput("");
  };

  if (isLoadingReplica) {
    return <div className="flex justify-center items-center h-screen">Loading Agent...</div>;
  }

  if (!replica) {
    return <div className="flex justify-center items-center h-screen">Agent not found.</div>;
  }

  return (
    <div className="flex justify-center items-center h-screen bg-background p-4">
      <Card className="w-full max-w-2xl h-full flex flex-col shadow-2xl">
        <CardHeader className="flex flex-row items-center gap-4 border-b">
          <Avatar>
            <AvatarImage src={replica.profile_image} alt={replica.name} />
            <AvatarFallback><Bot /></AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{replica.name}</CardTitle>
            <CardDescription>{replica.short_description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent ref={scrollAreaRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={cn(
                  "flex items-start gap-3 max-w-[80%]",
                  message.role === "user" ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    {message.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "rounded-lg p-3 text-sm shadow",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {chatMutation.isPending && (
             <div className="flex items-start gap-3">
               <Avatar className="w-8 h-8">
                 <AvatarFallback><Bot size={18} /></AvatarFallback>
               </Avatar>
               <div className="bg-muted rounded-lg p-3 text-sm shadow">
                 <Loader2 className="h-4 w-4 animate-spin" />
               </div>
             </div>
          )}
        </CardContent>
        <div className="p-4 border-t bg-background">
          <form onSubmit={handleSubmit} className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="pr-16"
              disabled={chatMutation.isPending}
            />
            <Button type="submit" size="icon" className="absolute top-1/2 right-1 -translate-y-1/2" disabled={chatMutation.isPending || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default AgentChat;