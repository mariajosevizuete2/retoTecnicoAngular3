import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout.component')
        .then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./adminProducts/admin.routes')
            .then(m => m.adminRoutes),
      },
    ],
  },
];

