import { httpCaller } from '../libs';

import type { NewApiResponse } from '~/interfaces';

export class ProvinceService {
  static async getProvinces({
    name,
    search,
  }: {
    name?: string;
    search?: string;
  }): Promise<NewApiResponse<{ _id: string; order: number; name: string }[]>> {
    const response = await httpCaller.get('/mapping/provinces', {
      name,
      search,
    });

    return response.data as NewApiResponse<
      {
        _id: string;
        order: number;
        name: string;
      }[]
    >;
  }
}
