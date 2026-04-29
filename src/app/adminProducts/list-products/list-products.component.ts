import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { debounceTime, map, catchError, startWith, switchMap } from 'rxjs/operators';

import { ProductService } from '../../services/product.service';
import { ConfirmDialogComponent } from '../../shared/components/confirmation/confirmation.component';
import { Product } from '../../shared/interfaces/product.interface';


@Component({
  standalone: true,
  selector: 'app-list-products',
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './list-products.component.html',
  styleUrl: './list-products.component.css'
})

export class ListProductsComponent implements OnInit {

  private data$ = new BehaviorSubject<Product[]>([]);
  private search$ = new BehaviorSubject<string>('');
  private itemsPage$ = new BehaviorSubject<number>(5);

  filteredData$ = combineLatest([
    this.data$,
    this.search$.pipe(
      debounceTime(300),
      startWith('')
    ),
    this.itemsPage$
  ]).pipe(
    map(([data, search, itemsPage]) => {
      const filtered = data.filter(row =>
        Object.values(row).some(v =>
          String(v).toLowerCase().includes(search.toLowerCase())
        )
      );

      return filtered.slice(0, itemsPage);
    })
  );

  columns: {
    key: keyof Product;
    label: string;
    type?: 'date' | 'text' | 'image';
  }[] = [
      { key: 'logo', label: 'Logo', type: 'image' },
      { key: 'name', label: 'Nombre del producto' },
      { key: 'description', label: 'Descripción' },
      { key: 'date_release', label: 'Fecha de liberación', type: 'date' },
      { key: 'date_revision', label: 'Fecha de reestructuración', type: 'date' }
    ];

  showDeleteModal = false;
  selectedProduct: Product | null = null;
  errorMessage: string | null = null;


  constructor(
    private productService: ProductService,
    private router: Router
  ) { }


  ngOnInit(): void {
    this.getProducts();
  }


  getProducts() {
    this.productService.getProducts().pipe(
      map(res => res.data),
      catchError(() => {
        this.errorMessage = 'No se pudieron obtener los productos.';
        return of([]);
      })
    ).subscribe(data => {
      this.data$.next(data);
    });
  }


  trackById(index: number, item: Product) {
    return item.id;
  }


  getValue(row: Product, key: keyof Product) {
    return row[key];
  }


  getDateValue(row: Product, key: keyof Product): Date | string | null {
    const value = row[key];
    return typeof value === 'string' || value instanceof Date ? value : null;
  }


  onSearch(value: string) {
    this.search$.next(value);
  }


  onChangeSelect(event: Event) {
    const value = +(event.target as HTMLSelectElement).value;
    this.itemsPage$.next(value);
  }


  updateProduct(product: Product) {
    this.router.navigate(['/editar-producto', product.id]);
  }


  addProduct() {
    this.router.navigate(['/agregar']);
  }


  openDeleteModal(row: Product) {
    this.selectedProduct = row;
    this.showDeleteModal = true;
  }


  cancelDelete() {
    this.showDeleteModal = false;
    this.selectedProduct = null;
  }


  confirmDelete() {
    if (!this.selectedProduct) return;

    this.productService.deleteProduct(this.selectedProduct.id).pipe(
      switchMap(() => this.productService.getProducts()),
      map(res => res.data),
      catchError(() => {
        this.errorMessage = 'Error al eliminar el producto.';
        return of([]);
      })
    ).subscribe(data => {
      this.data$.next(data);
      this.cancelDelete();
    });
  }


  getDeleteMessage(): string {
  if (!this.selectedProduct) return '';

  return `¿Estás seguro de eliminar el producto ${this.selectedProduct.name}?`;
}
}
