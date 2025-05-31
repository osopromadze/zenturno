# ZenTurno

ZenTurno es una plataforma integral de gestión de citas que simplifica la reserva de turnos en peluquerías y consultorios. Permite a los clientes programar, modificar y cancelar citas online las 24 horas, mientras ofrece a los negocios un sistema completo para administrar profesionales, servicios y agenda.

## Estructura del Proyecto

El proyecto está organizado como un monorepo con las siguientes partes:

- **frontend**: Aplicación web React para clientes y administradores

- **backend**: API REST en Node.js/Express

- **scripts**: Scripts de automatización para despliegue y configuración
- **docs**: Documentación técnica y guías de usuario

## Requisitos previos

- Node.js (v16.x o superior)
- npm (v8.x o superior) o yarn (v1.22.x o superior)
- PostgreSQL (v14.x o superior)
- Redis (v6.x o superior)
- Git (v2.x o superior)

## Instalación

Consulta el archivo [INSTALL.md](docs/guides/INSTALL.md) para obtener instrucciones detalladas sobre la instalación y configuración del proyecto.

## Desarrollo

```bash
# Instalar todas las dependencias
npm run setup

# Iniciar el servidor backend
npm run start:be

# Iniciar la aplicación frontend
npm run start:fe


```

## Documentación

La documentación completa está disponible en el directorio `docs/`:

- [Arquitectura](docs/architecture/README.md)
- [API](docs/api/README.md)
- [Guías de desarrollo](docs/guides/README.md)

## Licencia

Este proyecto está licenciado bajo los términos de la licencia ISC.
