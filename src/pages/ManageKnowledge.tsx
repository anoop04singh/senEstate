import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";

const ManageKnowledge = () => {
  const { replicaId } = useParams();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Manage Knowledge Base</h1>
      <p className="text-muted-foreground">Replica ID: {replicaId}</p>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload a File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Upload property brochures, neighborhood guides, etc. (PDF, DOCX, TXT).</p>
            <Input type="file" />
            <Button>
              <Upload className="mr-2 h-4 w-4" /> Upload File
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Add Text Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <p className="text-sm text-muted-foreground">Add short pieces of information like FAQs or market updates.</p>
            <Textarea placeholder="Enter text content here..." rows={5} />
            <Button>Add Text</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Existing Knowledge</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No knowledge base items yet.</p>
          {/* List of knowledge items will go here */}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageKnowledge;