import type { NewApiResponse } from '~/interfaces';

export interface IStudyModuleCard {
  terminology: string;
  define: string;
}

export interface ICreateStudyModuleParams {
  title: string;
  description: string;
  data: IStudyModuleCard[];
}

export interface IStudyModule extends ICreateStudyModuleParams {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export class StudyModuleService {
  static async createStudyModule(
    params: ICreateStudyModuleParams
  ): Promise<NewApiResponse<IStudyModule>> {
    // Fake API call - simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate successful response
    const fakeResponse: NewApiResponse<IStudyModule> = {
      status: 200,
      message: 'Study module created successfully',
      payload: {
        id: `study-module-${Date.now()}`,
        ...params,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      serverTime: Date.now(),
    };

    console.log('Fake API Response:', fakeResponse);
    return fakeResponse;
  }

  static async updateStudyModule(
    id: string,
    params: Partial<ICreateStudyModuleParams>
  ): Promise<NewApiResponse<IStudyModule>> {
    // Fake API call - simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const fakeResponse: NewApiResponse<IStudyModule> = {
      status: 200,
      message: 'Study module updated successfully',
      payload: {
        id,
        title: params.title || '',
        description: params.description || '',
        data: params.data || [],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      serverTime: Date.now(),
    };

    console.log('Fake API Response:', fakeResponse);
    return fakeResponse;
  }
}
