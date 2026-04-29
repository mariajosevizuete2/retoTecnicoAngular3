## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/mariajosevizuete2/retoTecnicoAngular3
```

---

### 2. Instalar dependencias

```bash
npm install
```

---

### 3. Configurar variables de entorno

Editar el archivo:

```bash
src/environments/environment.ts
```

Configurar la URL del backend:

```ts
export const environment = {
  url_repo: 'URL_DEL_API'
};
```

---

### 4. Ejecutar la aplicación

```bash
ng serve
```

---

### 5. Acceder en el navegador

```bash
http://localhost:4200
```

---

## Requisitos

Requisitos del entorno

El proyecto fue desarrollado con las siguientes versiones:

- Angular CLI: 18.2.21
- Angular: 18.2.x
- Node.js: 18.19.0
- npm: 10.2.3
- RxJS: 7.8.2
- TypeScript: 5.5.4

```bash
npm install -g @angular/cli
```
