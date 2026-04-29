import { Routes } from '@angular/router';
import { productExistsGuard } from '../core/guards/product-exist.guard';


export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list-products/list-products.component')
        .then(m => m.ListProductsComponent),
  },
  {
  path: 'editar-producto/:id',
  canActivate: [productExistsGuard],
  loadComponent: () =>
    import('./form/form.component')
      .then(m => m.FormComponent),
},
  {
    path: 'agregar',
    loadComponent: () =>
      import('./form/form.component')
        .then(m => m.FormComponent),
  },
];
