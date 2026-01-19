// lib/cloudinary-receipt-service.ts


interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width: number;
  height: number;
}

export class CloudinaryReceiptService {
  private static cloudName = "dqoo1d1ip";
  private static uploadPreset = "Images";

  static async uploadReceipt(file: File): Promise<string> {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload only image files');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size should be less than 5MB');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.uploadPreset);
      formData.append('folder', 'receipts');
      formData.append('transformation', 'c_limit,w_800,h_800,q_auto');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload receipt');
      }

      const data: CloudinaryUploadResponse = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading receipt:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to upload receipt');
    }
  }

  static async uploadReceiptWithProgress(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload only image files');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size should be less than 5MB');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.uploadPreset);
      formData.append('folder', 'receipts');
      formData.append('transformation', 'c_limit,w_800,h_800,q_auto');

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable && onProgress) {
            const progress = (e.loaded / e.total) * 100;
            onProgress(Math.round(progress));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            try {
              const data: CloudinaryUploadResponse = JSON.parse(xhr.responseText);
              resolve(data.secure_url);
            } catch (e) {
              reject(new Error('Invalid response format'));
            }
          } else {
            reject(new Error('Failed to upload receipt'));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('POST', `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`);
        xhr.send(formData);
      });
    } catch (error) {
      console.error('Error uploading receipt:', error);
      throw error;
    }
  }
}
