# Guía de Despliegue en la Nube: Tortuguero Huellas en AlwaysData

Esta guía detalla los pasos para poner en línea la versión oficial de **Tortuguero Huellas** en **AlwaysData** con soporte completo para la base de datos, el backend API y el frontend compilado.

---

## 1. Registro o Acceso a AlwaysData

1. Ingrese a [https://www.alwaysdata.com](https://www.alwaysdata.com).
2. Si va a crear una cuenta nueva independiente:
   * Nombre de la cuenta (account name): `tortuguerohuellas`
   * Esto otorgará el subdominio gratuito: `https://tortuguerohuellas.alwaysdata.net`.
3. Si utiliza una cuenta existente:
   * Puede agregar un nuevo sitio web y una base de datos dentro de esa cuenta.

---

## 2. Configuración de la Base de Datos MySQL / MariaDB

1. En el menú lateral izquierdo, vaya a **Databases > MySQL**.
2. **Crear la base de datos:**
   * Haga clic en **Add a database**.
   * Nombre: `tortuguerohuellas_db` (o el prefijo que AlwaysData asigne según la cuenta).
3. **Crear usuario:**
   * En la sección de usuarios, cree el usuario `tortuguerohuellas` y defina una contraseña segura.
   * Asigne permisos completos sobre la base de datos creada.
4. **Importar el volcado inicial con datos:**
   * Haga clic en **Manage with phpMyAdmin**.
   * Seleccione la base de datos `tortuguerohuellas_db`.
   * Vaya a la pestaña **Importar** (Import).
   * Suba el archivo [app/backend/tortuguerohuellas_cloud_seed.sql](file:///c:/xampp/htdocs/tortuguero_huellas/app/backend/tortuguerohuellas_cloud_seed.sql).
   * Haga clic en **Continuar / Importar**. Esto creará las 15 tablas y cargará todos los datos de censo, usuarios y perfiles de adopción con fotos.

---

## 3. Despliegue del Código desde GitHub

1. En AlwaysData, vaya a **Remote access > SSH** y asegúrese de que el acceso SSH esté habilitado con contraseña.
2. Conéctese por SSH a su cuenta (o use la consola web de AlwaysData):
   ```bash
   ssh [cuenta]@ssh-[cuenta].alwaysdata.net
   ```
3. En la raíz de su carpeta de usuario (`/home/[cuenta]/`), clone el repositorio oficial:
   ```bash
   git clone https://github.com/chrvarar/tortuguero_huellas.git
   ```
4. Ingrese al backend y configure el archivo de variables `.env`:
   ```bash
   cd /home/[cuenta]/tortuguero_huellas/app/backend
   cp .env.production.example .env
   nano .env
   ```
   Asegúrese de colocar los datos reales de conexión de la base de datos:
   ```ini
   CI_ENVIRONMENT = production
   TORTUGUERO_HUELLAS_PUBLIC_ORIGIN = https://[cuenta].alwaysdata.net

   database.default.hostname = mysql-[cuenta].alwaysdata.net
   database.default.database = [cuenta]_db
   database.default.username = [cuenta]
   database.default.password = [SU_CONTRASENA]
   database.default.DBDriver = MySQLi
   ```
5. Asigne permisos de escritura a la carpeta `writable` (donde se guardan fotos y logs):
   ```bash
   chmod -R 775 /home/[cuenta]/tortuguero_huellas/app/backend/writable
   ```

---

## 4. Configuración del Sitio Web en AlwaysData

1. En el menú lateral izquierdo, vaya a **Web > Sites**.
2. Edite el sitio principal o haga clic en **Add a site**:
   * **Name / Addresses:** `[cuenta].alwaysdata.net` (ej. `tortuguerohuellas.alwaysdata.net`).
   * **Type:** `PHP`
   * **PHP Version:** `8.3` o `8.4`
   * **Application path:** `/tortuguero_huellas/app/backend/public` (relativo al home de usuario).
     * Ruta completa: `/home/[cuenta]/tortuguero_huellas/app/backend/public`
   * **Security:** Marque la casilla **Force HTTPS redirect**.
   * Guarde los cambios (**Submit**).
3. En **SSL / TLS Certificates**:
   * Verifique que el certificado Let's Encrypt esté activo para el dominio.

---

## 5. Verificación de Funcionamiento

Abra el navegador en `https://[cuenta].alwaysdata.net`:
1. **Portada pública:** El logo grande oficial y el nombre Tortuguero Huellas deben cargarse perfectamente.
2. **Inicio de sesión:** 
   * Usuario: `administrador`
   * Contraseña: `administrador`
3. **Escaneo QR móvil:**
   * Abra la ficha de cualquier animal desde un teléfono móvil apuntando a la cámara al código QR. Debe cargar la ficha pública en modal sin requerir sesión.
