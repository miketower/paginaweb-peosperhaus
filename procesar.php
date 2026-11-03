<?php
declare(strict_types=1);

// Las credenciales se configuran en el servidor, nunca en el HTML o en Git.
header('Content-Type: text/html; charset=UTF-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header("Content-Security-Policy: default-src 'none'; base-uri 'none'; frame-ancestors 'none'");

function responder(int $codigo, string $titulo, string $mensaje): never
{
    http_response_code($codigo);
    $titulo = htmlspecialchars($titulo, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $mensaje = htmlspecialchars($mensaje, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    echo '<!doctype html><html lang="es"><head><meta charset="utf-8">'
        . '<meta name="viewport" content="width=device-width, initial-scale=1">'
        . '<title>' . $titulo . ' | Prosperhaus</title></head><body><main>'
        . '<h1>' . $titulo . '</h1><p>' . $mensaje . '</p>'
        . '<p><a href="index.html#integrarme">Volver a Prosperhaus</a></p>'
        . '</main></body></html>';
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    responder(405, 'Método no permitido', 'Envía tu solicitud desde el formulario de incorporación.');
}

function campo(string $nombre, int $maximo): string
{
    $valor = $_POST[$nombre] ?? null;
    if (!is_string($valor)) {
        responder(422, 'Revisa tu solicitud', 'Todos los campos son obligatorios y deben contener texto.');
    }
    $valor = trim($valor);
    // Valida UTF-8 y cuenta caracteres sin requerir la extensión mbstring.
    $longitud = preg_match_all('/./us', $valor);
    if ($valor === '' || $longitud === false || $longitud > $maximo
        || preg_match('/[\x00-\x1F\x7F]/u', $valor)) {
        responder(422, 'Revisa tu solicitud', 'Hay campos vacíos, demasiado largos o con caracteres no válidos.');
    }
    return $valor;
}

$nombre = campo('nombre_completo', 150);
$profesion = campo('profesion', 150);
$correo = campo('correo', 254);
$telefono = campo('telefono_celular', 30);

if (filter_var($correo, FILTER_VALIDATE_EMAIL) === false) {
    responder(422, 'Correo no válido', 'Escribe una dirección de correo electrónico válida.');
}
$digitos = preg_replace('/\D/', '', $telefono);
if (!preg_match('/^\+?[0-9 () .-]+$/D', $telefono)
    || strlen($digitos) < 7 || strlen($digitos) > 15) {
    responder(422, 'Teléfono no válido', 'Escribe un teléfono de 7 a 15 dígitos; puedes incluir el prefijo internacional.');
}
if (($_POST['autorizacion'] ?? null) !== 'on') {
    responder(422, 'Autorización requerida', 'Debes aceptar el aviso de privacidad y autorizar el contacto.');
}

try {
    $host = getenv('DB_HOST') ?: '127.0.0.1';
    $puerto = getenv('DB_PORT') ?: '3306';
    $base = getenv('DB_NAME') ?: 'prosperhaus';
    $usuario = getenv('DB_USER');
    $clave = getenv('DB_PASSWORD');
    if ($usuario === false || $usuario === '' || $clave === false
        || !ctype_digit($puerto) || (int) $puerto < 1 || (int) $puerto > 65535
        || preg_match('/[;\x00-\x20]/', $host)
        || !preg_match('/^[A-Za-z0-9_]+$/D', $base)) {
        throw new RuntimeException('Configuración de base de datos incompleta o inválida.');
    }
    $pdo = new PDO(
        "mysql:host={$host};port={$puerto};dbname={$base};charset=utf8mb4",
        $usuario,
        $clave,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
         PDO::ATTR_EMULATE_PREPARES => false,
         PDO::ATTR_TIMEOUT => 5]
    );
    $pdo->exec("SET time_zone = '+00:00'");
    $sentencia = $pdo->prepare(
        'INSERT INTO solicitudes_incorporacion '
        . '(nombre_completo, profesion, correo, telefono_celular, autorizacion) '
        . 'VALUES (:nombre, :profesion, :correo, :telefono, 1)'
    );
    $sentencia->execute([
        'nombre' => $nombre,
        'profesion' => $profesion,
        'correo' => $correo,
        'telefono' => $telefono,
    ]);
} catch (Throwable $error) {
    // No registrar datos personales, contraseñas ni mensajes del controlador SQL.
    error_log('Prosperhaus: no se pudo guardar la solicitud (' . get_class($error) . ').');
    responder(503, 'Servicio temporalmente no disponible', 'No pudimos guardar tu solicitud. Inténtalo de nuevo más tarde.');
}

responder(201, 'Solicitud recibida', 'Guardamos tu solicitud para revisión. Esto no crea automáticamente una cuenta activa.');
