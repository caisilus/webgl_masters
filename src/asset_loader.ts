export class AssetLoader {
  urlsToLoadedImages: Map<string, HTMLImageElement> = new Map();
  constructor() {}

  async loadImages(urls: string[]) {
    try {
      await Promise.all(urls.map((url) => this.loadImage(url)));
    } catch (error) {
      console.error(error);
    }
  }

  loadImage(url: string) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.urlsToLoadedImages.set(url, img);
        resolve(img);
      }
      img.onerror = () => reject(new Error(`Failed to load image from ${url}`));
    });
  }
  
  getImage(url: string) {
    return this.urlsToLoadedImages.get(url);
  }
}