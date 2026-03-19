# TicoAutos — Frontend
🚗 Cliente web desacoplado para la plataforma de compra y venta de vehículos TicoAutos.

Desarrollado como proyecto académico para la carrera de Ingeniería del Software en la Universidad Técnica Nacional (UTN), Costa Rica.

---

## 📌 Descripción

Este repositorio contiene el frontend de TicoAutos, desarrollado con HTML, CSS y JavaScript puro (ES Modules), sin frameworks. Se conecta al backend mediante fetch a la API REST, utilizando JWT para autenticación y localStorage para persistencia de sesión.

---

## ⚙️ Tecnologías

- HTML5 + CSS3
- JavaScript (ES Modules)
- Live Server (VS Code)
- localStorage para manejo del token JWT

---

## 📂 Estructura del proyecto

```
ticoautos-frontend/
 ├── pages/
 │   ├── auth/
 │   │   ├── login.html
 │   │   └── register.html
 │   ├── dashboard/
 │   │   ├── dashboard.html
 │   │   ├── vehicle.my.html       mis vehículos
 │   │   ├── vehicle.create.html   publicar vehículo
 │   │   ├── vehicle.edit.html     editar vehículo
 │   │   ├── inbox.list.html       lista de conversaciones
 │   │   └── inbox.conversation.html  detalle de conversación
 │   └── public/
 │       ├── home.html             página principal con búsqueda
 │       └── vehicle.detail.html   detalle de vehículo
 ├── js/
 │   ├── app/
 │   │   ├── home.js               carga vehículos con filtros y paginación
 │   │   └── vehicle.detail.js     detalle + reserva + mensajes
 │   ├── auth/
 │   │   ├── login.js
 │   │   ├── register.js
 │   │   └── logout.js
 │   ├── core/
 │   │   ├── config.js             URL base de la API
 │   │   ├── http.js               wrapper de fetch con JWT
 │   │   └── storage.js            manejo del token en localStorage
 │   ├── dashboard/
 │   │   ├── dashboard.js
 │   │   ├── vehicle.my.js         listado de mis vehículos
 │   │   ├── vehicle.create.js     formulario de creación
 │   │   ├── vehicle.edit.js       formulario de edición
 │   │   ├── inbox.list.js         lista de conversaciones
 │   │   └── inbox.conversation.js historial de mensajes
 │   └── guards/
 │       └── requireAuth.js        protege páginas privadas
 ├── css/
 │   ├── base/       reset.css · global.css · main.css
 │   ├── auth/       auth.css
 │   ├── dashboard/  dashboard.css · vehicle.my.css · vehicle.form.css · inbox.css
 │   └── public/     home.css · vehicle.detail.css
 └── img/
     └── logo.png
```

---

## 🚀 Ejecución

1. Asegurarse de que el backend esté corriendo en `http://localhost:3001`.
2. Abrir la carpeta con **Live Server** en VS Code.
3. Navegar a `pages/public/home.html`.

> ⚠️ El frontend usa ES Modules (`type="module"`), por lo que debe ejecutarse desde un servidor HTTP (Live Server), no abriendo el archivo directamente con `file://`.

---

## 🔁 Flujo de autenticación

1. El usuario se registra o inicia sesión.
2. El backend retorna un JWT que se guarda en `localStorage`.
3. `core/http.js` adjunta el token en cada petición protegida.
4. `guards/requireAuth.js` verifica el token antes de cargar páginas privadas.
5. Al cerrar sesión se limpia el token de `localStorage`.

---

## 📄 Páginas principales

| Página | Acceso | Descripción |
|--------|--------|-------------|
| home.html | Público | Búsqueda y filtrado de vehículos con paginación |
| vehicle.detail.html | Público | Detalle del vehículo, reserva y mensajes |
| login.html | Público | Inicio de sesión |
| register.html | Público | Registro de usuario |
| dashboard.html | Privado | Panel principal del usuario |
| vehicle.my.html | Privado | Gestión de mis vehículos |
| vehicle.create.html | Privado | Publicar nuevo vehículo |
| vehicle.edit.html | Privado | Editar vehículo existente |
| inbox.list.html | Privado | Lista de conversaciones |
| inbox.conversation.html | Privado | Historial de mensajes |

---

## 🔗 Repositorio del backend

`https://github.com/juandagomez04/Ticoautos-backend`

---

## 👨‍💻 Autor

**Juan Daniel Gómez Cubillo**
Ingeniería del Software — UTN Costa Rica
Curso: Programación en Ambiente Web II (ISW-711)
