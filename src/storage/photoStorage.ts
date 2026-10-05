export interface Photo {
  id: string;
  dataUrl: string;
  timestamp: number;
  recipe?: string;
  mode?: string;
  aspectRatio?: string;
  aestheticScore?: number;
  favourite: boolean;
  editPreset?: string;
}

class PhotoStorage {
  private readonly STORAGE_KEY = 'nicamera-photos';
  private readonly DB_NAME = 'nicamera-db';

  async savePhoto(photo: Omit<Photo, 'id' | 'timestamp'>): Promise<Photo> {
    const fullPhoto: Photo = {
      ...photo,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    const photos = await this.getPhotos();
    photos.unshift(fullPhoto);
    
    await this.setItem(this.STORAGE_KEY, photos);
    return fullPhoto;
  }

  async getPhotos(limit = 100): Promise<Photo[]> {
    const photos = await this.getItem<Photo[]>(this.STORAGE_KEY) || [];
    return photos.slice(0, limit);
  }

  async getPhoto(id: string): Promise<Photo | null> {
    const photos = await this.getPhotos();
    return photos.find(p => p.id === id) || null;
  }

  async toggleFavourite(id: string): Promise<void> {
    const photos = await this.getPhotos();
    const idx = photos.findIndex(p => p.id === id);
    if (idx !== -1) {
      photos[idx].favourite = !photos[idx].favourite;
      await this.setItem(this.STORAGE_KEY, photos);
    }
  }

  async deletePhoto(id: string): Promise<void> {
    const photos = await this.getPhotos();
    const filtered = photos.filter(p => p.id !== id);
    await this.setItem(this.STORAGE_KEY, filtered);
  }

  async getFavourites(): Promise<Photo[]> {
    const photos = await this.getPhotos();
    return photos.filter(p => p.favourite);
  }

  async getByRecipe(recipeId: string): Promise<Photo[]> {
    const photos = await this.getPhotos();
    return photos.filter(p => p.recipe === recipeId);
  }

  private async getItem<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  private async setItem<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error('Storage error:', err);
      throw new Error('Storage unavailable');
    }
  }
}

export const photoStorage = new PhotoStorage();
