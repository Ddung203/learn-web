import apiService from './api.service';

export interface IPixabayImage {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  previewURL: string;
  previewWidth: number;
  previewHeight: number;
  webformatURL: string;
  webformatWidth: number;
  webformatHeight: number;
  largeImageURL: string;
  imageWidth: number;
  imageHeight: number;
  imageSize: number;
  views: number;
  downloads: number;
  collections: number;
  likes: number;
  comments: number;
  user_id: number;
  user: string;
  userImageURL: string;
}

export interface IPixabayResponse {
  total: number;
  totalHits: number;
  hits: IPixabayImage[];
}

class ImageService {
  async searchImages(query: string, perPage: number = 10): Promise<IPixabayResponse> {
    return await apiService.get<IPixabayResponse>('/images/search', {
      params: {
        q: query,
        per_page: perPage,
      },
    });
  }
}

export default new ImageService();
