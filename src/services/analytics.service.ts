import { ProductData } from 'types';

class AnalyticsService {
  init() {
    this.productAppearanceEvent();
  }

  async getProducts() {
    const productsResp = await fetch('/api/getProducts');
    const products: ProductData[] = await productsResp.json();
    return products;
  }

  async postProductAppearance(data: ProductData) {
    const isLog = data.log ? true : false;

    console.log(data);

    const response = await fetch('/api/sendEvent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: isLog ? 'viewCardPromo' : 'viewCard',
        payload: { data },
        timestamp: new Date().toLocaleString()
      })
    });

    if (!response.ok) {
      console.error('Failed to send event data:', response.statusText);
    }
  }

  async productAppearanceEvent() {
    const products = await this.getProducts();

    if (!products) return;

    let observedProducts = new Set();

    const saveObservedProduct = (productId: string) => {
      observedProducts.add(productId);
      sessionStorage.setItem('observedProducts', JSON.stringify(Array.from(observedProducts)));
    };

    const loadObservedProducts = () => {
      const storedObservedProducts = sessionStorage.getItem('observedProducts');
      return storedObservedProducts ? new Set(JSON.parse(storedObservedProducts)) : new Set();
    };

    const onEntry = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry: IntersectionObserverEntry) => {
        const productId = entry.target.id;
        const productData = products.find((i) => `${i.id}` === productId);
        if (entry.isIntersecting && !observedProducts.has(productId)) {
          this.postProductAppearance(productData!);
          saveObservedProduct(productId);
        }
      });
    };

    const observerOptions = {
      threshold: 0.5
    };

    const observer = new IntersectionObserver(onEntry, observerOptions);

    for (const product of products) {
      const productElement = document.getElementById(`${product.id}`);
      if (productElement && !observedProducts.has(product.id)) {
        observer.observe(productElement);
      }
    }

    // Load observed products from session storage
    observedProducts = loadObservedProducts();
  }
}

export const analyticsService = new AnalyticsService();
