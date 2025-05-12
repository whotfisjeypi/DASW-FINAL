# Backend de Pet Adoption Platform

## Instalación
1. Ejecuta `npm install` para instalar las dependencias.

## Configuración
1. Copia el archivo `.env.example` a `.env` y configura las variables de entorno.
2. Levanta MongoDB (puede usarse Docker: `docker run -d -p 27017:27017 mongo`).

## Sembrado de la Base de Datos
Ejecuta:
```
npm run seed
```

## Ejecución
- Desarrollo: `npm run dev`
- Producción: `npm start`

## Pruebas de Endpoints
- Se incluyen ejemplos en cURL y colecciones de Postman en la documentación.
- Swagger disponible en `/docs` una vez corriendo el servidor.
