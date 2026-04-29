import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { map, catchError, of } from 'rxjs';

export const productExistsGuard: CanActivateFn = (route) => {
  const service = inject(ProductService);
  const router = inject(Router);

  const id = route.paramMap.get('id');

  if (!id) {
    router.navigate(['/admin']);
    return of(false);
  }

  return service.verifyId(id).pipe(
    map(exists => {
      if (!exists) {
        router.navigate(['/admin']);
        return false;
      }
      return true;
    }),
    catchError(() => {
      router.navigate(['/admin']);
      return of(false);
    })
  );
};