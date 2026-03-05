TicoAutos Frontend

Frontend del proyecto TicoAutos desarrollado con HTML, CSS y JavaScript.

Este frontend se conecta con un backend construido con Node.js, Express y MongoDB para manejar la autenticación de usuarios utilizando JWT (JSON Web Token).

--------------------------------------------------

FUNCIONALIDADES ACTUALES

- Registro de usuario
- Inicio de sesión
- Almacenamiento del token JWT
- Página privada protegida
- Cierre de sesión

--------------------------------------------------

ESTRUCTURA DEL PROYECTO

ticoautos-frontend

css
  base
  auth
  app

js
  core
  guards
  auth
  app

pages
  auth
    login.html
    register.html
  app
    home.html

index.html

--------------------------------------------------

REQUISITOS

El backend debe estar corriendo en:

http://localhost:3001

--------------------------------------------------

CÓMO EJECUTAR EL PROYECTO

1. Levantar el backend

npm start

2. Abrir el frontend

Abrir el archivo:

index.html

o usar Live Server en VS Code.

--------------------------------------------------

FLUJO DE AUTENTICACIÓN

1. El usuario se registra usando:

POST /auth/register

2. El usuario inicia sesión usando:

POST /auth/token

3. El token recibido se guarda en:

sessionStorage

4. Las páginas privadas utilizan:

GET /auth/me

enviando el token en el header Authorization.

--------------------------------------------------

Autor Juan Daniel Gómez Cubillo
Proyecto académico – TicoAutos
