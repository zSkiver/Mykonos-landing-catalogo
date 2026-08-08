export const TABLES = {
  profiles: 'profiles',
  products: 'products',
  categories: 'categories',
  offers: 'offers',
  settings: 'settings',
  brands: 'brands',
} as const;

export type TableName = (typeof TABLES)[keyof typeof TABLES];

export const SINGLETON_IDS = {
  settings: 'store',
} as const;
