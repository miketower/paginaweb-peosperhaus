-- Ejecutar con un usuario administrador: mysql -u root -p < database.sql
-- No elimina datos existentes. Requiere MySQL 8.0 o posterior.
CREATE DATABASE IF NOT EXISTS prosperhaus
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE prosperhaus;

CREATE TABLE IF NOT EXISTS solicitudes_incorporacion (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre_completo VARCHAR(150) NOT NULL,
    profesion VARCHAR(150) NOT NULL,
    correo VARCHAR(254) NOT NULL,
    telefono_celular VARCHAR(30) NOT NULL,
    autorizacion TINYINT UNSIGNED NOT NULL,
    autorizacion_fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('pendiente', 'aprobada', 'rechazada') NOT NULL DEFAULT 'pendiente',
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_solicitudes_correo (correo),
    KEY idx_solicitudes_estado_fecha (estado, creado_en),
    CONSTRAINT chk_autorizacion CHECK (autorizacion = 1)
) ENGINE=InnoDB;
