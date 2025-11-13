export type PaginationParams = {
  skip?: number;
  limit?: number;
  filter?: Record<string, any>;
};

export * from './auth.service';
export * from './province.service';
export * from './study-module.service';
export * from './user.service';
