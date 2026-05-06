# 🛡️ SagrilaftV3 - Sistema de Gestión de Riesgos

![Status](https://img.shields.io/badge/Status-Public-success?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-3.0.0-blue?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack-Next.js%20|%20Express%20|%20Prisma-orange?style=for-the-badge)

**SagrilaftV3** es una solución integral diseñada para la automatización y gestión del Sistema de Autocontrol y Gestión del Riesgo Integral de Lavado de Activos y Financiación del Terrorismo (**SAGRILAFT**). Optimiza el cumplimiento normativo mediante flujos de trabajo digitalizados, gestión de documentos y notificaciones automatizadas.

---

## ✨ Características Principales

- 🔐 **Autenticación Segura**: Sistema de login y registro robusto con JWT y encriptación de contraseñas.
- 📂 **Gestión Documental**: Carga y validación de documentos obligatorios para vinculación de terceros.
- 📧 **Notificaciones Automatizadas**: Envío de correos electrónicos profesionales para confirmaciones y rechazos.
- 📊 **Panel de Administración**: Visualización de estados, logs de actividad y gestión de usuarios.
- 📄 **Generación de Reportes**: Exportación de datos y formularios pre-diligenciados.
- 📱 **Diseño Responsive**: Interfaz moderna y adaptable construida con Next.js y Tailwind CSS.

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **UI**: React 19 + Tailwind CSS
- **Estado/Auth**: Context API
- **Cliente HTTP**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma
- **Base de Datos**: PostgreSQL / SQLite (Configurable)
- **Seguridad**: Helmet, JWT, BcryptJS

---

## 🚀 Guía de Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/sagrilaftv3.git
cd sagrilaftv3
```

### 2. Configuración del Backend
```bash
cd backend
npm install
```
Crea un archivo `.env` basado en `.env.example` y completa tus credenciales:
```bash
cp .env.example .env
```

Ejecuta las migraciones de la base de datos:
```bash
npx prisma generate
npx prisma migrate dev
```

### 3. Configuración del Frontend
```bash
cd ../frontend
npm install
```
(Opcional) Crea un archivo `.env.local` si necesitas variables específicas para el cliente.

---

## 💻 Uso en Desarrollo

Para iniciar ambos servicios simultáneamente, puedes abrir dos terminales:

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

El servidor de desarrollo estará disponible en `http://localhost:3000`.

---

## 📂 Estructura del Proyecto

```text
sagrilaftv3/
├── backend/            # API Express & Prisma ORM
│   ├── prisma/         # Esquemas de base de datos
│   ├── src/            # Lógica del servidor
│   └── templates/      # Plantillas de documentos
├── frontend/           # Aplicación Next.js
│   ├── public/         # Assets estáticos
│   └── src/            # Componentes y páginas (App Router)
└── README.md           # Esta guía
```

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si deseas mejorar SagrilaftV3:
1. Haz un **Fork** del proyecto.
2. Crea una **Rama** para tu función (`git checkout -b feature/NuevaFuncion`).
3. Haz un **Commit** de tus cambios (`git commit -m 'Añadir nueva función'`).
4. Haz un **Push** a la rama (`git push origin feature/NuevaFuncion`).
5. Abre un **Pull Request**.

---

## 📄 Licencia

Este proyecto está bajo la Licencia **ISC**. Consulta el archivo `LICENSE` para más detalles.

---

<p align="center">
  Desarrollado con ❤️ para la eficiencia en el cumplimiento normativo.
</p>
