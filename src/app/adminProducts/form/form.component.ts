import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

import { ProductService } from '../../services/product.service';
import { Product } from '../../shared/interfaces/product.interface';


@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})

export class FormComponent {

  productForm!: FormGroup;
  isEdit = false;
  productId!: string;
  errorMessage: string | null = null;


  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initForm();
  }


  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      switchMap(id => {
        if (!id) return of(null);

        this.isEdit = true;
        this.productId = id;

        return this.productService.getProductById(id).pipe(
          catchError(() => {
            this.errorMessage = 'Error al encontrar el producto.';
            return of(null);
          })
        );
      })
    ).subscribe(product => {
      if (!product) return;

      this.productForm.patchValue(product);
      this.productForm.get('id')?.disable();
    });
  }


  initForm() {
    this.productForm = this.fb.group({
      id: ['', {
        validators: [Validators.required, Validators.minLength(3), Validators.maxLength(10)],
        asyncValidators: [this.verifyId()],
        updateOn: 'blur'
      }],
      name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      logo: ['', [Validators.required, Validators.pattern('https?://.+')]],
      date_release: ['', [Validators.required, this.validateDateRelease]],
      date_revision: ['', Validators.required],
    },
      { validators: this.validateDateRevision }
    );
  }


  verifyId() {
    return (control: AbstractControl) => {
      if (!control.value) return of(null);

      return this.productService.verifyId(control.value).pipe(
        map((exists: boolean) => exists ? { idExiste: true } : null),
        catchError(() => of(null))
      );
    };
  }


  validateDateRelease(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const hoy = new Date().toISOString().split('T')[0];

    return control.value > hoy ? { fechaFutura: true } : null;
  }


  validateDateRevision(group: AbstractControl): ValidationErrors | null {
    const release = group.get('date_release')?.value;
    const revisionCtrl = group.get('date_revision');

    if (!release || !revisionCtrl?.value) {
      return null;
    }

    const expectedDate = new Date(release);
    expectedDate.setFullYear(expectedDate.getFullYear() + 1);
    const expectedString = expectedDate.toISOString().split('T')[0];

    if (revisionCtrl.value !== expectedString) {
      revisionCtrl.setErrors({ revisionNoValida: true });
      return { revisionNoValida: true };
    }
    return null;
  }


  getControl(name: string) {
    return this.productForm.get(name);
  }


  hasError(name: string): boolean {
    const control = this.getControl(name);
    return !!(control && control.touched && control.errors);
  }


  showMessage(control: AbstractControl | null): string {
    if (!control || !control.errors) return '';

    const errors = control.errors;

    if (errors['required']) {
      return 'Campo requerido';
    }

    if (errors['minlength']) {
      return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    }

    if (errors['maxlength']) {
      return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    }

    if (errors['notString']) {
      return 'El valor debe ser texto';
    }

    if (errors['idExiste']) {
      return 'El ID ya existe';
    }

    if (errors['fechaFutura']) {
      return 'La fecha no puede ser mayor a hoy';
    }

    if (errors['revisionNoValida']) {
      return 'La fecha de revisión debe ser exactamente un año después';
    }

    if (errors['pattern']) {
      return 'Debe ser una URL válida (http o https)';
    }

    return 'Valor inválido';
  }


  resetForm() {
    this.productForm.reset();
    this.productForm.markAsPristine();
    this.productForm.markAsUntouched();
  }


  submit() {
    if (this.productForm.invalid) return;

    const product: Product = this.productForm.getRawValue();

    const request$ = this.isEdit
      ? this.productService.updateProduct(this.productId, product)
      : this.productService.addProduct(product);

    request$.pipe(
      catchError(() => {
        this.errorMessage = this.isEdit
          ? 'No se pudo actualizar el producto.'
          : 'No se pudo agregar el producto.';
        return of(null);
      })
    ).subscribe(res => {
      if (!res) return;

      this.errorMessage = null;
      this.router.navigate(['/']);
    });
  }
}