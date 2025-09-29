import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

const AgentChat = () => {
  const { slug } = useParams();

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="h-[70vh] flex flex-col">
        <CardHeader>
          <CardTitle>Real Estate Assistant</CardTitle>
          <CardDescription>Chat with the AI for {slug}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Chat messages will go here */}
          <div className="flex items-start gap-3">
            <div className="bg-muted rounded-lg p-3 max-w-[80%]">
              <p className="text-sm">Hi! I can help you find your dream home. What are you looking for?</p>
            </div>
          </div>
        </CardContent>
        <div className="p-4 border-t">
          <div className="relative">
            <Input placeholder="Ask about properties..." className="pr-16" />
            <Button type="submit" size="icon" className="absolute top-1/2 right-1 -translate-y-1/2">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AgentChat;