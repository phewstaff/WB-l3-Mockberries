import { Component } from '../component';
import html from './catalog.tpl.html';

import { ProductList } from '../productList/productList';

import { analyticsService } from '../../services/analytics.service';
import { userService } from '../../services/user.service';

class Catalog extends Component {
  productList: ProductList;

  constructor(props: any) {
    super(props);

    this.productList = new ProductList();
    this.productList.attach(this.view.products);
  }

  async render() {
    await userService.init();
    const productsResp = await fetch('/api/getProducts', {
      headers: {
        'x-userid': window.userId
      }
    });
    const products = await productsResp.json();
    this.productList.update(products);

    analyticsService.postNavigateEvent();
  }
}

export const catalogComp = new Catalog(html);
