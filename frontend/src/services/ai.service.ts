import api, { type ApiResponse } from './api';

export type AiTone = 'professional' | 'friendly' | 'urgent' | 'luxury' | 'playful';

export interface GeneratePostTextPayload {
  idea: string;
  productDescription?: string;
  productImageUrls?: string[];
  tone?: AiTone;
  goal?: string;
  productId?: string;
}

export interface GeneratePostTextResult {
  suggestions: string[];
  primary: string;
  model: string;
}

class AiService {
  async generatePostText(payload: GeneratePostTextPayload): Promise<ApiResponse<GeneratePostTextResult>> {
    const response = await api.post<ApiResponse<GeneratePostTextResult>>('/ai/posts/generate-text', payload);
    return response.data;
  }
}

const aiService = new AiService();
export default aiService;
