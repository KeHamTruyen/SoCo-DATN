import api from './api';

interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    publicId: string;
    resourceType?: string;
  };
}

interface MultiUploadResponse {
  success: boolean;
  message: string;
  data: {
    images: Array<{
      url: string;
      publicId: string;
    }>;
  };
}

class UploadService {
  /**
   * Upload single product image
   */
  async uploadProductImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post<UploadResponse>('/upload/product', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Upload multiple product images
   */
  async uploadProductImages(files: File[]): Promise<MultiUploadResponse> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const response = await api.post<MultiUploadResponse>('/upload/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post<UploadResponse>('/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Upload post media (image or video)
   */
  async uploadPostMedia(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('media', file);

    const response = await api.post<UploadResponse>('/upload/post', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }
}

export default new UploadService();
