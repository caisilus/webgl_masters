import { ObjData, ObjParser } from "./obj_parser";

export class AssetLoader {
  static instance: AssetLoader;

  urlsToLoadedImages: Map<string, HTMLImageElement> = new Map();
  urlsToLoadedObj: Map<string, ObjData> = new Map();

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

  loadObj(url: string) {
    const objParser = new ObjParser();
    return fetch(url)
      .then(response => response.text())
      .then((text) => {
        const objData = objParser.parse(text)
        this.urlsToLoadedObj.set(url, objData);
      });
  }
  
  static getImage(url: string) {
    return this.instance.urlsToLoadedImages.get(url);
  }

  static getObj(url: string) {
    return this.instance.urlsToLoadedObj.get(url);
  }
}