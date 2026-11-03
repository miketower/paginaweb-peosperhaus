# paginaweb-peosperhaus
Página web de Prosperhaus

## Formulario y base de datos

Requiere PHP 8.1 o posterior con PDO y `pdo_mysql`, y MySQL 8.0.16 o posterior.
El formulario existente envía sus datos a `procesar.php`, que valida los campos
y guarda una solicitud con estado `pendiente`. No crea cuentas ni envía correos.

1. Importa el esquema con una cuenta administradora:

   ```sh
   mysql -u root -p < database.sql
   ```

   Se crea `prosperhaus.solicitudes_incorporacion` sin borrar datos existentes.
   El script puede ejecutarse otra vez; no actualiza estructuras preexistentes.
   Para hosting con una base ya asignada, selecciona esa base e importa solo
   `CREATE TABLE`, omitiendo `CREATE DATABASE` y `USE`.

2. Para MAMP local, la conexión predeterminada es `localhost`, base `prosperhaus`,
   usuario `root` y contraseña vacía. No necesitas definir variables de entorno.
   Importa primero `database.sql` y abre el sitio desde el servidor PHP de MAMP.
   Con `localhost`, PDO MySQL utiliza el socket configurado en PHP; si no conecta,
   comprueba el socket MySQL en MAMP y su configuración de PHP. Para conectar por
   TCP usa `DB_HOST=127.0.0.1` y `DB_PORT` con el puerto real de MySQL en MAMP.

   Para producción, crea una cuenta de aplicación en MySQL, con contraseña propia y permiso
   `INSERT` únicamente sobre `prosperhaus.solicitudes_incorporacion`. Restringe
   su host al servidor PHP. Usa otra cuenta para consultar o revisar solicitudes.
   No uses la cuenta root en producción.

3. Configura estas variables en el proceso PHP o en el panel del hosting:

   | Variable | Valor |
   | --- | --- |
   | `DB_HOST` | Host MySQL; por defecto `localhost` |
   | `DB_PORT` | Puerto MySQL; por defecto `3306` |
   | `DB_NAME` | Base de datos; por defecto `prosperhaus` |
   | `DB_USER` | Por defecto `root` para MAMP local |
   | `DB_PASSWORD` | Por defecto vacía para MAMP local |

   El código lee el entorno con `getenv`; no carga archivos `.env`.
   Guarda las credenciales fuera de Git y de la carpeta pública.

4. Para desarrollo, desde la raíz del repositorio, con las variables ya
   configuradas en la sesión:

   ```sh
   php -S 127.0.0.1:8080 -t .
   ```

   El servidor estático de Python no ejecuta PHP. En producción usa un servidor
   con PHP, HTTPS y errores ocultos al visitante (`display_errors=Off`). Publica
   únicamente `index.html`, `logo-prosperhaus.png`, `formulario.js`, `animaciones.js` y `procesar.php`; mantén el
   script SQL y los documentos fuera de la carpeta pública.

El formulario se envía sin salir de la página y muestra un diálogo de confirmación
o error. Durante el envío bloquea el botón; solo limpia los campos al confirmar
que se guardaron. La ventana admite teclado y respeta movimiento reducido.
No requiere librerías ni CDN adicionales. Sin JavaScript conserva el envío HTML.

El procesador responde con JSON si se solicita `Accept: application/json`, o HTML
para el envío tradicional, y HTTP 201 al guardar, 422 para datos no válidos,
405 para métodos distintos de POST y 503 si falla la base de datos. Guarda las
fechas en UTC y usa consultas preparadas. Cada envío válido crea una solicitud;
no se impone unicidad por correo ni se deduplican reenvíos.

Antes de recibir solicitudes reales, publica y enlaza el aviso de privacidad
al que hace referencia el formulario. Para exposición pública, configura límites
de solicitudes o protección contra automatización en el servidor; esta primera
versión no incorpora CAPTCHA, limitación de frecuencia ni panel de revisión.
