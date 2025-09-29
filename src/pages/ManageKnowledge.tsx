import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Loader2, CheckCircle, XCircle, RefreshCw, Info } from "lucide-react";
import { getKnowledgeBase, addTextKnowledge, requestFileUpload, uploadFileToSignedUrl } from "@/lib/api";
import { KnowledgeBaseItem } from "@/types";
import { useState, ChangeEvent, FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from 'date-fns';
import { Label } from "@/components/ui/label";

const StatusBadge = ({ status }: { status: KnowledgeBaseItem['status'] }) => {
  const statusMap: { [key in KnowledgeBaseItem['status']]: { label: string; className: string; icon: JSX.Element } } = {
    NEW: { label: "New", className: "bg-gray-400", icon: <Info className="h-3 w-3" /> },
    FILE_UPLOADED: { label: "Uploaded", className: "bg-blue-500", icon: <Upload className="h-3 w-3" /> },
    RAW_TEXT: { label: "Processing", className: "bg-yellow-500", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
    PROCESSED_TEXT: { label: "Processing", className: "bg-yellow-500", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
    VECTOR_CREATED: { label: "Processing", className: "bg-yellow-500", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
    READY: { label: "Ready", className: "bg-green-600", icon: <CheckCircle className="h-3 w-3" /> },
    UNPROCESSABLE: { label: "Error", className: "bg-red-600", icon: <XCircle className="h-3 w-3" /> },
  };

  const currentStatus = statusMap[status] || statusMap.NEW;

  return (
    <Badge className={`${currentStatus.className} hover:${currentStatus.className} text-white`}>
      <span className="mr-1.5">{currentStatus.icon}</span>
      {currentStatus.label}
    </Badge>
  );
};

const ManageKnowledge = () => {
  const { replicaId } = useParams<{ replicaId: string }>();
  const queryClient = useQueryClient();
  const [textContent, setTextContent] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileTitle, setFileTitle] = useState("");

  const { data: knowledgeItems = [], isLoading, isError, refetch, isRefetching } = useQuery<KnowledgeBaseItem[]>({
    queryKey: ["knowledgeBase", replicaId],
    queryFn: () => getKnowledgeBase(replicaId!),
    enabled: !!replicaId,
  });

  const addTextMutation = useMutation({
    mutationFn: (data: { text: string; title?: string }) => addTextKnowledge(replicaId!, data.text, data.title),
    onSuccess: () => {
      setTextContent("");
      setTextTitle("");
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ["knowledgeBase", replicaId] }), 1000);
    },
  });

  const fileUploadMutation = useMutation({
    mutationFn: async (data: { file: File; title?: string }) => {
      const { file, title } = data;
      const uploadRequest = await requestFileUpload(replicaId!, file.name, title);
      if (uploadRequest && uploadRequest.results && uploadRequest.results.length > 0 && uploadRequest.results[0].signedURL) {
        const success = await uploadFileToSignedUrl(uploadRequest.results[0].signedURL, file);
        if (!success) throw new Error("Upload failed");
      } else {
        throw new Error("Could not get upload URL");
      }
    },
    onSuccess: () => {
      setSelectedFile(null);
      setFileTitle("");
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if(fileInput) fileInput.value = "";
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ["knowledgeBase", replicaId] }), 1000);
    },
  });

  const handleTextSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (textContent.trim() && !addTextMutation.isPending) {
      addTextMutation.mutate({ text: textContent.trim(), title: textTitle.trim() || undefined });
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = (e: FormEvent) => {
    e.preventDefault();
    if (selectedFile && !fileUploadMutation.isPending) {
      fileUploadMutation.mutate({ file: selectedFile, title: fileTitle.trim() || undefined });
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Manage Knowledge Base</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload a File</CardTitle>
            <CardDescription>Upload property brochures, guides, etc. (PDF, DOCX, TXT).</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-title">Title (Optional)</Label>
                <Input id="file-title" placeholder="e.g., 123 Main St Brochure" value={fileTitle} onChange={(e) => setFileTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file-input">File</Label>
                <Input id="file-input" type="file" onChange={handleFileChange} />
              </div>
              <Button type="submit" disabled={!selectedFile || fileUploadMutation.isPending}>
                {fileUploadMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Upload File
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Add Text Content</CardTitle>
            <CardDescription>Add short info like FAQs or market updates.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTextSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text-title">Title (Optional)</Label>
                <Input id="text-title" placeholder="e.g., Common Buyer Questions" value={textTitle} onChange={(e) => setTextTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="text-content">Content</Label>
                <Textarea 
                  id="text-content"
                  placeholder="Enter text content here..." 
                  rows={4} 
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={!textContent.trim() || addTextMutation.isPending}>
                {addTextMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                Add Text
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Existing Knowledge</CardTitle>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <CardDescription>The AI will use this information to answer questions. Processing new items can take a few minutes.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading knowledge base...</p>
          ) : isError ? (
            <p className="text-center text-destructive py-8">Failed to load knowledge base.</p>
          ) : knowledgeItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No knowledge base items yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {knowledgeItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title || "Text Content"}</TableCell>
                    <TableCell className="capitalize">{item.type}</TableCell>
                    <TableCell><StatusBadge status={item.status} /></TableCell>
                    <TableCell>{formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageKnowledge;