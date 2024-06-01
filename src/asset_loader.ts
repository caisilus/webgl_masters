export class AssetLoader {
  static instance: AssetLoader;

  urlsToLoadedImages: Map<string, HTMLImageElement> = new Map();
  constructor() { AssetLoader.instance = this; }

  loadImages(urls: string[]) {
    return Promise.all(urls.map((url) => this.loadImage(url)));
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
  
  static getImage(url: string) {
    return this.instance.urlsToLoadedImages.get(url);
  }
}