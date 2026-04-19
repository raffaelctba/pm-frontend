export interface PropertyImage {
  id: number;
  propertyId: number;
  fileName: string;
  filePath: string;
  imageUrl: string;
  contentType: string;
  fileSize: number;
  isPrimary: boolean;
  displayOrder: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyImageUpload {
  file: File;
  description?: string;
  isPrimary?: boolean;
}


