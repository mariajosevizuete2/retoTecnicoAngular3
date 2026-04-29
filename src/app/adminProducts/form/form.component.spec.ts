/// <reference types="jasmine" />
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormComponent } from './form.component';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

describe('FormComponent', () => {
  let comp: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let mockService: any;
  let mockRouter: any;
  let mockRoute: any;


  const prodFake = {
    id: 'abc',
    name: 'Mi Producto',
    description: 'Descripción válida',
    logo: 'http://logo.com/img.png',
    date_release: '2025-01-01',
    date_revision: '2026-01-01'
  };


  beforeEach(async () => {
    mockService = {
      getProductById: jasmine.createSpy().and.returnValue(of(prodFake)),
      addProduct: jasmine.createSpy().and.returnValue(of({})),
      updateProduct: jasmine.createSpy().and.returnValue(of({})),
      verifyId: jasmine.createSpy().and.returnValue(of(false))
    };

    mockRouter = { navigate: jasmine.createSpy() };

    mockRoute = {
      paramMap: of({
        get: (key: string) => null
      })
    };

    await TestBed.configureTestingModule({
      imports: [FormComponent, ReactiveFormsModule, FormsModule],
      providers: [
        { provide: ProductService, useValue: mockService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('crear componente', () => {
    expect(comp).toBeTruthy();
    expect(comp.productForm).toBeTruthy();
  });


  it('cargar producto si es edición', fakeAsync(() => {
    mockRoute.paramMap = of({
      get: () => 'abc'
    });

    comp.ngOnInit();
    tick();

    expect(comp.isEdit).toBeTrue();
    expect(mockService.getProductById).toHaveBeenCalledWith('abc');
  }));


  it('error al cargar producto', fakeAsync(() => {
    mockRoute.paramMap = of({
      get: () => 'abc'
    });

    mockService.getProductById.and.returnValue(
      throwError(() => new Error('Error'))
    );

    comp.ngOnInit();
    tick();

    expect(comp.errorMessage).toBe('Error al encontrar el producto.');
  }));


  it('agregar producto', fakeAsync(() => {
    comp.productForm.patchValue(prodFake);
    comp.productForm.updateValueAndValidity();

    comp.isEdit = false;
    comp.submit();
    tick();

    expect(mockService.addProduct).toHaveBeenCalledWith(prodFake);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  }));


  it('error al agregar producto', fakeAsync(() => {
    mockService.addProduct.and.returnValue(
      throwError(() => new Error('Error'))
    );

    comp.productForm.patchValue(prodFake);
    comp.productForm.updateValueAndValidity();

    comp.isEdit = false;
    comp.submit();
    tick();

    expect(comp.errorMessage).toBe('No se pudo agregar el producto.');
  }));


  it('actualizar producto', fakeAsync(() => {
    comp.productForm.patchValue(prodFake);
    comp.productForm.updateValueAndValidity();

    comp.isEdit = true;
    comp.productId = 'abc';

    comp.submit();
    tick();

    expect(mockService.updateProduct).toHaveBeenCalledWith('abc', prodFake);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  }));


  it('error al actualizar producto', fakeAsync(() => {
    mockService.updateProduct.and.returnValue(
      throwError(() => new Error('Error'))
    );

    comp.productForm.patchValue(prodFake);
    comp.productForm.updateValueAndValidity();

    comp.isEdit = true;
    comp.productId = 'abc';

    comp.submit();
    tick();

    expect(comp.errorMessage).toBe('No se pudo actualizar el producto.');
  }));


  it('verificar ID existe', fakeAsync(() => {
    mockService.verifyId.and.returnValue(of(true));

    const ctrl: any = { value: 'abc' };

    comp.verifyId()(ctrl).subscribe(res => {
      expect(res).toEqual({ idExiste: true });
    });
  }));


  it('error en verifyId retorna null', fakeAsync(() => {
    mockService.verifyId.and.returnValue(
      throwError(() => new Error('Error'))
    );

    const ctrl: any = { value: 'abc' };

    comp.verifyId()(ctrl).subscribe(res => {
      expect(res).toBeNull();
    });
  }));


  it('validar fecha de release', () => {
    const ctrl: any = { value: '2999-01-01' };
    expect(comp.validateDateRelease(ctrl)).toEqual({ fechaFutura: true });
  });

  it('validar fecha de revision', () => {
    comp.productForm.patchValue({
      date_release: '2025-01-01',
      date_revision: '2027-01-01'
    });

    expect(comp.validateDateRevision(comp.productForm)).toEqual({
      revisionNoValida: true
    });
  });


  it('resetear formulario', () => {
    comp.resetForm();
    expect(comp.productForm.pristine).toBeTrue();
    expect(comp.productForm.untouched).toBeTrue();
  });


  it('get control y mostrar mensaje vacío', () => {
    const ctrl = comp.getControl('name')!;
    ctrl.setValue('producto válido');
    ctrl.setErrors(null);

    expect(comp.showMessage(ctrl)).toBe('');
  });


  it('mostrar mensajes de error', () => {
    const ctrl = comp.getControl('name')!;

    ctrl.setErrors({ required: true });
    expect(comp.showMessage(ctrl)).toBe('Campo requerido');

    ctrl.setErrors({ minlength: { requiredLength: 5 } });
    expect(comp.showMessage(ctrl)).toBe('Mínimo 5 caracteres');

    ctrl.setErrors({ idExiste: true });
    expect(comp.showMessage(ctrl)).toBe('El ID ya existe');
  });
});