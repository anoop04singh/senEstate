export interface Replica {
  uuid: string;
  name: string;
  slug: string;
  short_description: string;
  introduction: string; // greeting message
  profile_image: string;
}

export interface KnowledgeBaseItem {
  id: number;
  type: 'text' | 'file' | 'website' | 'youtube';
  status: 'NEW' | 'FILE_UPLOADED' | 'RAW_TEXT' | 'PROCESSED_TEXT' | 'VECTOR_CREATED' | 'READY' | 'UNPROCESSABLE';
  title?: string;
  createdAt: string;
  updatedAt: string;
}