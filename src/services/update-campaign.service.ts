import apiService from './api.service';

export interface IUpdateCampaign {
  version: string;
  deadline: string;
  title: string;
  content: string;
  is_show_update_info: boolean;
}

class UpdateCampaignService {
  async getUpdateCampaign(): Promise<IUpdateCampaign | null> {
    try {
      const response = await apiService.get<{ data: IUpdateCampaign | null }>('/update-campaign');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch update campaign:', error);
      return null;
    }
  }
}

export default new UpdateCampaignService();
