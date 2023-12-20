import localforage from 'localforage';
import { ProductData } from 'types';

const DB = '__wb-favorite';

class FavoriteService {
  init() {
    this.toggleFavLink();
  }

  async addProduct(product: ProductData) {
    const products = await this.get();
    await this.set([...products, product]);
    this.toggleFavLink();
  }

  async removeProduct(product: ProductData) {
    const products = await this.get();
    await this.set(products.filter(({ id }) => id !== product.id));
    this.toggleFavLink();
  }

  async clear() {
    await localforage.removeItem(DB);
  }

  async get(): Promise<ProductData[]> {
    return (await localforage.getItem(DB)) || [];
  }

  async set(data: ProductData[]) {
    await localforage.setItem(DB, data);
  }

  async isInFav(product: ProductData) {
    const products = await this.get();
    return products.some(({ id }) => id === product.id);
  }

  async updateUI(isAdd: boolean) {
    const heartSvg = document.querySelector('.svg-icon');

    if (isAdd) {
      heartSvg?.classList.remove('fill');
    } else {
      heartSvg?.classList.add('fill');
    }
  }

  async toggleFavLink() {
    const products = await this.get();

    const favLink = document.getElementById('favLink');

    if (products.length > 0) {
      favLink?.classList.remove('hide');
    } else {
      favLink?.classList.add('hide');
    }
  }
}

export const favoriteService = new FavoriteService();
