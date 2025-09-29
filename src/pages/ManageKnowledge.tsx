import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle, XCircle, RefreshCw, Info, Home, Trash2 } from "lucide-react";
import { getKnowledgeBase, addTextKnowledge, deleteKnowledgeBaseItem } from "@/lib/api";
import { KnowledgeBaseItem } from "@/types";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from 'date-fns';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const StatusBadge = ({ status }: { status: KnowledgeBaseItem['status'] }) => {
  const statusMap: { [key in KnowledgeBaseItem['status']]: { label: string; className: string; icon: JSX.Element } } = {
    NEW: { label: "New", className: "bg-gray-400", icon: <Info className="h-3 w-3" /> },
    FILE_UPLOADED: { label: "Uploaded", className: "bg-blue-500", icon: <Trash2 className="h-3 w-3" /> },
    RAW_TEXT: { label: "Processing", className: "bg-yellow-500", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
    PROCESSED_TEXT: { label: "Processing", className: "bg-yellow-500", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
    VECTOR_CREATED: { label: "Ready", className: "bg-green-600", icon: <CheckCircle className="h-3 w-3" /> },
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

const propertyListingSchema = z.object({
  address: z.string().min(5, "Address is required."),
  price: z.coerce.number().positive("Price must be a positive number."),
  bedrooms: z.coerce.number().int().min(0, "Bedrooms cannot be negative."),
  bathrooms: z.coerce.number().min(0, "Bathrooms cannot be negative."),
  sqft: z.coerce.number().int().positive("Square footage must be a positive number."),
  description: z.string().min(10, "Description is required."),
  virtualTourUrl: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
  photoUrls: z.string().optional(),
});

const ManageKnowledge = () => {
  const { replicaId } = useParams<{ replicaId: string }>();
  const queryClient = useQueryClient();
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const { data: knowledgeItems = [], isLoading, isError, refetch, isRefetching } = useQuery<KnowledgeBaseItem[]>({
    queryKey: ["knowledgeBase", replicaId],
    queryFn: () => getKnowledgeBase(replicaId!),
    enabled: !!replicaId,
  });

  const addTextMutation = useMutation({
    mutationFn: (data: { text: string; title?: string }) => addTextKnowledge(replicaId!, data.text, data.title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledgeBase", replicaId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (knowledgeId: number) => deleteKnowledgeBaseItem(replicaId!, knowledgeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledgeBase", replicaId] });
      setItemToDelete(null);
    },
  });

  const listingForm = useForm<z.infer<typeof propertyListingSchema>>({
    resolver: zodResolver(propertyListingSchema),
    defaultValues: {
      address: "",
      price: 0,
      bedrooms: 0,
      bathrooms: 0,
      sqft: 0,
      description: "",
      virtualTourUrl: "",
      photoUrls: "",
    },
  });

  function onListingSubmit(values: z.infer<typeof propertyListingSchema>) {
    const photoUrlsArray = values.photoUrls
      ? values.photoUrls.split(',').map(url => url.trim()).filter(url => url)
      : [];
      
    const listingJson = {
      ...values,
      photoUrls: photoUrlsArray,
    };

    const content = JSON.stringify(listingJson, null, 2);
    const title = `Property Listing: ${values.address}`;

    addTextMutation.mutate({ text: content, title: title }, {
      onSuccess: () => {
        listingForm.reset();
      }
    });
  }

  return (
    <div className="space-y-8">
      <AlertDialog open={itemToDelete !== null} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the knowledge base item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (itemToDelete) {
                  deleteMutation.mutate(itemToDelete);
                }
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <h1 className="text-3xl font-bold">Manage Knowledge Base</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Add Property Listing</CardTitle>
          <CardDescription>Add a new property for your AI agent to learn about.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...listingForm}>
            <form onSubmit={listingForm.handleSubmit(onListingSubmit)} className="space-y-4">
              <FormField control={listingForm.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Address</FormLabel>
                  <FormControl><Input placeholder="e.g., 123 Main St, Anytown, USA" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={listingForm.control} name="price" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 500000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={listingForm.control} name="sqft" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Square Footage</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 2000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={listingForm.control} name="bedrooms" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrooms</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 3" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={listingForm.control} name="bathrooms" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bathrooms</FormLabel>
                    <FormControl><Input type="number" step="0.5" placeholder="e.g., 2.5" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={listingForm.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="e.g., A beautiful home with a large yard..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={listingForm.control} name="virtualTourUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>Virtual Tour URL (Optional)</FormLabel>
                  <FormControl><Input placeholder="https://example.com/virtual-tour" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={listingForm.control} name="photoUrls" render={({ field }) => (
                <FormItem>
                  <FormLabel>Photo Gallery URLs (Optional)</FormLabel>
                  <FormControl><Textarea placeholder="Enter image URLs, separated by commas" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" disabled={addTextMutation.isPending}>
                {addTextMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Home className="mr-2 h-4 w-4" />}
                Add Property Listing
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {knowledgeItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title || "Untitled"}</TableCell>
                    <TableCell className="capitalize">{item.type}</TableCell>
                    <TableCell><StatusBadge status={item.status} /></TableCell>
                    <TableCell>{formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setItemToDelete(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
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