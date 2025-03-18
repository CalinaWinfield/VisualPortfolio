import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  // Initialize Supabase client with project credentials
  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  }

  /**
   * Uploads a file to Supabase Storage.
   * @param file - The file to upload.
   * @param userId - The ID of the user uploading the file.
   * @returns Uploaded file data or throws an error.
   */
  async uploadFile(file: File, userId: string) {
    const filePath = `${userId}/${file.name}`;
    const { data, error } = await this.supabase.storage
      .from('user-files')
      .upload(filePath, file);

    if (error) throw error;
    return data;
  }

  /**
   * Retrieves the public URL of an uploaded file.
   * @param filePath - The path of the file in Supabase Storage.
   * @returns Public URL of the file.
   */
  getFileUrl(filePath: string): string {
    const { data } = this.supabase.storage.from('user-uploads').getPublicUrl(filePath);
    return data.publicUrl;
  }


  /**
   * Uploads a file and stores its metadata in MongoDB.
   * @param file - The file to upload.
   * @param userId - The ID of the user uploading the file.
   * @returns Public URL of the uploaded file.
   */
  async uploadFileAndSaveMetadata(file: File, userId: string) {
    try {
      const uploadedFile = await this.uploadFile(file, userId);

      if (!uploadedFile || !uploadedFile.path) {
        throw new Error('File upload failed');
      }

      const fileUrl = this.getFileUrl(uploadedFile.path);

      // Send file data to MongoDB via backend
      const response = await fetch('http://localhost:5000/api/upload', { // Ensure correct backend URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, fileName: file.name, fileUrl })
      });

      if (!response.ok) {
        throw new Error(`Failed to save metadata: ${response.statusText}`);
      }

      return fileUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * retrieve user files
   * @param userId
   */
  async getUserFiles(userId: string) {
    const { data, error } = await this.supabase.storage.from('user-files').list(userId);
    if (error) throw error;
    return data.map(file => this.getFileUrl(`${userId}/${file.name}`));
  }

}
