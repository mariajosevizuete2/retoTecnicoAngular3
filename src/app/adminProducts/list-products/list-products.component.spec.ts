import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ListProductsComponent } from './list-products.component';
import { ProductService } from '../../services/product.service';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { flush } from '@angular/core/testing';

describe('ListProductsComponent', () => {
  let comp: ListProductsComponent;
  let fixture: ComponentFixture<ListProductsComponent>;
  let mockService: any;
  let mockRouter: any;

  const prodFake = [
    {
      id: "1",
      name: 'Producto A',
      description: 'Alpha',
      logo: '',
      date_release: '2025-02-02',
      date_revision: '2026-02-02'
    },
    {
      id: "2",
      name: 'Producto B',
      description: 'Beta',
      logo: '',
      date_release: '2025-03-03',
      date_revision: '2026-03-03'
    },
  ];

  beforeEach(async () => {
    mockService = {
      getProducts: jasmine.createSpy().and.returnValue(of({ data: prodFake })),
      deleteProduct: jasmine.createSpy().and.returnValue(of({}))
    };

    mockRouter = {
      navigate: jasmine.createSpy()
    };

    await TestBed.configureTestingModule({
      imports: [ListProductsComponent],
      providers: [
        { provide: ProductService, useValue: mockService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListProductsComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('crear componente', () => {
    expect(comp).toBeTruthy();
  });


  it('cargar productos al iniciar', fakeAsync(() => {
    tick();

    expect(mockService.getProducts).toHaveBeenCalled();

    comp['data$'].subscribe(data => {
      expect(data.length).toBe(2);
    });
    flush();
  }));


  it('filtrar productos por búsqueda', fakeAsync(() => {
    tick();

    let result: any[] = [];
    comp.filteredData$.subscribe(data => result = data);

    comp.onSearch('Alpha');

    tick(300);

    expect(result.length).toBe(1);
    expect(result[0].description).toBe('Alpha');

    flush();
  }));


  it('cambiar items por página', fakeAsync(() => {
    tick();

    let result: any[] = [];
    comp.filteredData$.subscribe(data => result = data);

    const event = {
      target: { value: '1' }
    } as unknown as Event;

    comp.onChangeSelect(event);

    tick(300);

    expect(result.length).toBe(1);

    flush();
  }));


  it('navegar a agregar producto', () => {
    comp.addProduct();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/agregar']);
  });


  it('navegar a editar producto', () => {
    comp.updateProduct(prodFake[0]);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/editar-producto', '1']);
  });


  it('abrir modal de eliminar', () => {
    comp.openDeleteModal(prodFake[0]);

    expect(comp.showDeleteModal).toBeTrue();
    expect(comp.selectedProduct).toEqual(prodFake[0]);
  });


  it('cancelar eliminación', () => {
    comp.openDeleteModal(prodFake[0]);

    comp.cancelDelete();

    expect(comp.showDeleteModal).toBeFalse();
    expect(comp.selectedProduct).toBeNull();
  });


  it('confirmar eliminación exitosa', fakeAsync(() => {
    comp.openDeleteModal(prodFake[0]);

    comp.confirmDelete();
    tick();

    expect(mockService.deleteProduct).toHaveBeenCalledWith('1');
    expect(mockService.getProducts).toHaveBeenCalled();
    expect(comp.showDeleteModal).toBeFalse();
    expect(comp.selectedProduct).toBeNull();
    flush();
  }));


  it('error al obtener productos', fakeAsync(() => {
    mockService.getProducts.and.returnValue(
      throwError(() => new Error('Error'))
    );

    comp.getProducts();
    tick();

    expect(comp.errorMessage).toBe('No se pudieron obtener los productos.');
    flush();
  }));


  it('error al eliminar producto', fakeAsync(() => {
    mockService.deleteProduct.and.returnValue(
      throwError(() => new Error('Error'))
    );

    comp.openDeleteModal(prodFake[0]);

    comp.confirmDelete();
    tick();

    expect(comp.errorMessage).toBe('Error al eliminar el producto.');
    flush();
  }));


  it('trackById', () => {
    const result = comp.trackById(0, prodFake[0]);
    expect(result).toBe('1');
  });


  it('getValue', () => {
    const value = comp.getValue(prodFake[0], 'name');
    expect(value).toBe('Producto A');
  });


  it('getDateValue', () => {
    const value = comp.getDateValue(prodFake[0], 'date_release');
    expect(value).toBe('2025-02-02');
  });
});
