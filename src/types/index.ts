export interface Category {
  id: string;
  name: string;
}

export interface Tag {
  id: string;
  name: string;
  categoryId?: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  lanzaoUrl: string;
  iconUrl?: string;
  categoryId: string;
  tagId: string;
}

export interface Database {
  categories: Category[];
  tags: Tag[];
  list: ResourceItem[];
}
