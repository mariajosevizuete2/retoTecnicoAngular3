import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class ProductService {

  private http = inject(HttpClient);
  private baseUrl = environment.url_repo;


  getProducts() {
    return this.http.get<any>(`${this.baseUrl}`);
  }


  addProduct(product: any) {
    return this.http.post<any>(`${this.baseUrl}`, product);
  }


  updateProduct(id: string, product: any) {
    return this.http.put<any>(`${this.baseUrl}/${id}`, product);
  }


  deleteProduct(id: string) {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }


  getProductById(id: string) {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }


  verifyId(id: string) {
    return this.http.get<any>(`${this.baseUrl}/verification/${id}`);
  }
}


