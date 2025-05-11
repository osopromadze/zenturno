## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**
Jorge Ronceros Caceres /
Omari Sopromadze

### **0.2. Nombre del proyecto:**
ZenTurno

### **0.3. Descripción breve del proyecto:**
ZenTurno es una plataforma integral de gestión de citas que simplifica la reserva de turnos en peluquerías y consultorios. Permite a los clientes programar, modificar y cancelar citas online las 24 horas, mientras ofrece a los negocios un sistema completo para administrar profesionales, servicios y agenda. Con notificaciones automáticas, estadísticas de rendimiento e historial de clientes, ZenTurno optimiza la organización del tiempo, reduce cancelaciones y mejora la experiencia tanto para usuarios como para establecimientos.


### **0.4. URL del proyecto:**

> Puede ser pública o privada, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/).

### 0.5. URL o archivo comprimido del repositorio

> Puedes tenerlo alojado en público o en privado, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/). También puedes compartir por correo un archivo zip con el contenido


---

## 1. Descripción general del producto
ZenTurno es un sistema donde los usuarios reservan turnos según disponibilidad, y el administrador gestiona el calendario.

### **1.1. Objetivo:**

ZenTurno es una plataforma integral de gestión de reservas diseñada específicamente para negocios de servicios personales como peluquerías, barberías y estéticos. Su propósito principal es optimizar y automatizar el proceso de reserva de citas, eliminando las ineficiencias de los sistemas manuales tradicionales. ZenTurno aporta valor tanto a los propietarios de negocios como a sus clientes, reduciendo el tiempo dedicado a la gestión de agenda, minimizando los turnos perdidos, y ofreciendo una experiencia de reserva fluida y accesible las 24 horas.

### **1.2. Características y funcionalidades principales:**
   - Reservas online: Sistema intuitivo que permite a los clientes reservar, modificar o cancelar citas desde cualquier dispositivo sin necesidad de llamadas telefónicas.
   - Gestión de agenda avanzada: Calendario dinámico que sincroniza automáticamente las reservas de múltiples profesionales, evitando solapamientos y optimizando los tiempos entre servicios.
   - Perfiles personalizados: Cada profesional cuenta con su perfil donde se muestran sus especialidades, horarios y valoraciones de clientes.
   - Recordatorios automáticos: Notificaciones por email y SMS a clientes y profesionales para reducir la tasa de ausencias.
   - Panel de administración: Control total del negocio con estadísticas de ocupación, servicios más solicitados y rendimiento por profesional.
   - Sistema de fidelización: Programa de puntos, descuentos por frecuencia y promociones personalizadas para clientes recurrentes.
   - Integración de pagos: Reserva con señas o pago completo anticipado mediante diversos métodos (tarjeta, transferencia, billeteras digitales).
   - Historial de clientes: Registro detallado de visitas, servicios realizados, preferencias y observaciones para personalizar la atención.
   - Recursos y stock: Control de inventario de productos utilizados y disponibilidad de espacios físicos.
   - Interfaz responsive: Diseño adaptable a cualquier dispositivo (móvil, tablet, ordenador) para facilitar su uso tanto a clientes como empleados.
   - Modo offline: Funcionalidad básica disponible aun sin conexión a internet para registrar citas en el local.
   - Multiidioma: Disponible en español, inglés y otros idiomas según la región de implementación.

ZenTurno transforma la experiencia de reserva de turnos, ofreciendo una solución completa que reduce la carga administrativa, mejora la satisfacción del cliente y permite a los negocios enfocarse en lo que mejor saben hacer: proporcionar servicios de calidad.   

### **1.3. Diseño y experiencia de usuario:**

#### Principios de Diseño

##### 1. Simplicidad y Claridad
- Interfaz minimalista con navegación intuitiva
- Flujo de reserva simplificado en pocos pasos
- Jerarquía visual clara que prioriza las acciones principales

##### 2. Consistencia
- Lenguaje visual uniforme en todas las plataformas
- Patrones de interacción reconocibles
- Terminología coherente en toda la aplicación

##### 3. Accesibilidad
- Diseño inclusivo siguiendo estándares WCAG 2.1 AA
- Contraste adecuado para usuarios con discapacidad visual
- Compatibilidad con lectores de pantalla

##### 4. Flexibilidad
- Experiencia adaptada para distintos tipos de negocios
- Personalización por establecimiento (colores, logos)
- Opciones de configuración según necesidades específicas

#### Experiencia de Usuario

##### 1. Cliente Final
###### Flujo de Reserva:
1. Registro/Inicio de sesión (opcional para primera reserva)
2. Selección del establecimiento (si hay múltiples locales)
3. Elección del servicio deseado
4. Selección del profesional preferido o disponible
5. Visualización del calendario con disponibilidad en tiempo real
6. Selección de fecha y hora
7. Confirmación y opción de pago anticipado
8. Recepción de confirmación y recordatorios

###### Funcionalidades clave:
- Historial de citas previas
- Sistema de favoritos (profesionales y servicios)
- Valoraciones post-servicio
- Notificaciones personalizables
- Reprogramación o cancelación con políticas claras

##### 2. Administrador/Propietario
###### Panel de control principal:
- Vista consolidada de métricas clave y agenda diaria
- Alertas sobre situaciones que requieren atención
- Acceso rápido a funciones frecuentes

###### Áreas principales:
- Gestión de agenda y reservas
- Administración de profesionales y horarios
- Configuración de servicios y precios
- Estadísticas e informes de rendimiento
- Gestión de clientes y comunicaciones
- Configuración del establecimiento

##### 3. Profesional/Empleado
###### Interfaz simplificada:
- Vista de agenda diaria/semanal personal
- Detalles de próximos clientes
- Historial de servicios realizados
- Gestión limitada de disponibilidad personal

#### Elementos de Diseño Visual

##### 1. Paleta de Colores
- **Primario**: Azul turquesa (`#30B4C5`) - Transmite calma, confianza y profesionalismo
- **Secundario**: Verde menta (`#88D498`) - Representa frescura y bienestar
- **Acento**: Amarillo ámbar (`#F0A202`) - Destaca acciones importantes
- **Neutros**: 
  - Gris claro (`#F5F5F5`)
  - Gris medio (`#E0E0E0`)
  - Gris oscuro (`#424242`)

##### 2. Tipografía
- **Títulos**: Montserrat (Sans-serif) - Moderna y de alta legibilidad
- **Cuerpo**: Open Sans - Excelente legibilidad en todos los tamaños
- **Escalas**:
  - H1: 24px/30px
  - H2: 20px/26px
  - Cuerpo: 16px/24px
  - Pequeño: 14px/20px

##### 3. Componentes UI
- **Botones**: Esquinas redondeadas con estados claros (hover, active, disabled)
- **Tarjetas**: Sombras suaves para elevación y jerarquía
- **Iconografía**: Sistema de iconos coherente y minimalista
- **Espaciado**: Sistema de grid de 8px para consistencia

#### Prototipos y Wireframes

![Wireframes de ZenTurno](images/wireframes.jpg)

Los wireframes muestran las interfaces clave de ZenTurno: la vista móvil para clientes, el panel de administración para propietarios del negocio, y la vista simplificada para profesionales. El diseño responsivo garantiza una experiencia coherente en todos los dispositivos mientras mantiene la simplicidad y efectividad de cada interfaz según su contexto de uso.

#### Navegación y Flujos de Usuario

##### 1. Cliente Final
###### Flujo principal de navegación:
```
Inicio → Registro/Login → Explorar Servicios → Seleccionar Servicio → 
Elegir Profesional → Seleccionar Fecha/Hora → Confirmar Reserva → Recibir Confirmación
```

###### Flujos secundarios:
- **Gestión de perfil**: Mi Cuenta → Información Personal / Preferencias / Historial
- **Reprogramación**: Mis Reservas → Seleccionar Reserva → Reprogramar → Elegir Nueva Fecha/Hora
- **Cancelación**: Mis Reservas → Seleccionar Reserva → Cancelar → Confirmar Cancelación

##### 2. Administrador
###### Navegación principal:
Dashboard → Reservas / Profesionales / Servicios / Clientes / Estadísticas / Configuración

###### Gestión de reservas:
Reservas → Vista Calendario / Lista de Reservas → Detalles de Reserva → Confirmar / Reprogramar / Cancelar / Completar

###### Gestión de recursos:
Profesionales → Listado → Ver/Editar Profesional → Horarios / Servicios / Estadísticas

#### Estrategia de Interacción

##### 1. Feedback Visual
- Confirmaciones visuales inmediatas tras acciones importantes
- Indicadores de progreso durante procesos multi-paso
- Estados visibles para elementos interactivos (hover, active, visited)

##### 2. Notificaciones
- Sistema de notificaciones en-app con categorías (urgente, informativo)
- Notificaciones por correo electrónico y SMS personalizables
- Recordatorios graduales (24h, 2h antes de cita)

##### 3. Prevención de Errores
- Validación en tiempo real de formularios
- Mensajes claros de error con sugerencias de corrección
- Confirmación para acciones destructivas o de alto impacto

##### 4. Personalización
- Adaptación de contenido según historial del usuario
- Sugerencias basadas en preferencias previas
- Configuración de vista (modo claro/oscuro, densidad de información)

#### Pruebas de Usabilidad

##### 1. Métodos de Evaluación
- Test A/B de flujos críticos
- Entrevistas con usuarios reales de diferentes perfiles
- Pruebas de tiempo para tareas comunes
- Mapas de calor para identificar puntos de fricción

##### 2. Métricas de Seguimiento
- Tasa de abandono en flujo de reserva
- Tiempo de completado para tareas frecuentes
- Satisfacción del usuario (NPS, CSAT)
- Frecuencia de uso de funciones clave

#### Consideraciones Adicionales

##### 1. Modo Offline
- Sincronización automática al recuperar conexión
- Caché inteligente de datos frecuentes
- Indicadores de estado de conexión

##### 2. Rendimiento
- Tiempo de carga inicial optimizado (<3 segundos)
- Carga progresiva de contenido
- Optimización para conexiones lentas

##### 3. Micro-interacciones
- Animaciones sutiles para transiciones
- Feedback táctil en dispositivos móviles
- Sonidos discretos opcionales para confirmaciones

##### 4. Internacionalización
- Diseño adaptable a diferentes longitudes de texto
- Soporte para RTL (árabe, hebreo)
- Adaptación cultural de iconografía y colores

### **1.4. Instrucciones de instalación:**
> Documenta de manera precisa las instrucciones para instalar y poner en marcha el proyecto en local (librerías, backend, frontend, servidor, base de datos, migraciones y semillas de datos, etc.)

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**
> Usa el formato que consideres más adecuado para representar los componentes principales de la aplicación y las tecnologías utilizadas. Explica si sigue algún patrón predefinido, justifica por qué se ha elegido esta arquitectura, y destaca los beneficios principales que aportan al proyecto y justifican su uso, así como sacrificios o déficits que implica.


### **2.2. Descripción de componentes principales:**

> Describe los componentes más importantes, incluyendo la tecnología utilizada

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

> Representa la estructura del proyecto y explica brevemente el propósito de las carpetas principales, así como si obedece a algún patrón o arquitectura específica.

### **2.4. Infraestructura y despliegue**

> Detalla la infraestructura del proyecto, incluyendo un diagrama en el formato que creas conveniente, y explica el proceso de despliegue que se sigue

### **2.5. Seguridad**

> Enumera y describe las prácticas de seguridad principales que se han implementado en el proyecto, añadiendo ejemplos si procede

### **2.6. Tests**

> Describe brevemente algunos de los tests realizados

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

> Recomendamos usar mermaid para el modelo de datos, y utilizar todos los parámetros que permite la sintaxis para dar el máximo detalle, por ejemplo las claves primarias y foráneas.


### **3.2. Descripción de entidades principales:**

> Recuerda incluir el máximo detalle de cada entidad, como el nombre y tipo de cada atributo, descripción breve si procede, claves primarias y foráneas, relaciones y tipo de relación, restricciones (unique, not null…), etc.

---

## 4. Especificación de la API

> Si tu backend se comunica a través de API, describe los endpoints principales (máximo 3) en formato OpenAPI. Opcionalmente puedes añadir un ejemplo de petición y de respuesta para mayor claridad

---

## 5. Historias de Usuario

> Documenta 3 de las historias de usuario principales utilizadas durante el desarrollo, teniendo en cuenta las buenas prácticas de producto al respecto.

**Historia de Usuario 1**

**Historia de Usuario 2**

**Historia de Usuario 3**

---

## 6. Tickets de Trabajo

> Documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend, y uno de bases de datos. Da todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las buenas prácticas al respecto. 

**Ticket 1**

**Ticket 2**

**Ticket 3**

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1**

**Pull Request 2**

**Pull Request 3**

