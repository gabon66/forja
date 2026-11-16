<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');

function respond(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function sanitizeLogValue(string $value): string
{
    $value = preg_replace('/[\r\n\t]+/', ' ', $value) ?? '';
    $value = preg_replace('/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i', '[email]', $value) ?? '';
    return substr(trim($value), 0, 300);
}

function logMailAttempt(string $reference, string $result, array $details = []): void
{
    $details = array_map(static function ($value) {
        return is_string($value) ? sanitizeLogValue($value) : $value;
    }, $details);
    error_log('[forja-mail] ' . json_encode(
        ['reference' => $reference, 'result' => $result] + $details,
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    ));
}

$requestId = bin2hex(random_bytes(6));

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(405, ['ok' => false, 'message' => 'Método no permitido.']);
}

if (trim((string) ($_POST['sitio'] ?? '')) !== '') {
    respond(200, ['ok' => true, 'message' => 'Consulta enviada. ¡Gracias!']);
}

$nombre = trim((string) ($_POST['nombre'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$telefono = trim((string) ($_POST['telefono'] ?? ''));
$telefono = preg_replace('/[\r\n\t]+/', ' ', $telefono) ?? '';
$producto = trim((string) ($_POST['producto'] ?? ''));
$consulta = trim((string) ($_POST['consulta'] ?? ''));

if ($nombre === '' || strlen($nombre) > 480 || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254 || $telefono === '' || strlen($telefono) > 120 || $producto === '' || strlen($producto) > 640 || $consulta === '' || strlen($consulta) > 12000) {
    logMailAttempt($requestId, 'validation_failed');
    respond(422, ['ok' => false, 'message' => 'Revisá los datos e intentá nuevamente.']);
}

$recipient = 'gabriel.adrian.felipe@gmail.com';
$subject = 'Consulta web Forja Nordica - ' . preg_replace('/[\r\n]+/', ' ', $producto);
$encodedSubject = function_exists('mb_encode_mimeheader')
    ? mb_encode_mimeheader($subject, 'UTF-8')
    : '=?UTF-8?B?' . base64_encode($subject) . '?=';
$message = "Nueva consulta desde el sitio Forja Nordica\n\n"
    . "Modelo: {$producto}\n"
    . "Nombre: {$nombre}\n"
    . "Email: {$email}\n\n"
    . "Teléfono: {$telefono}\n\n"
    . "Consulta:\n{$consulta}\n";
$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: Forja Nordica <consultas@forjanordica.ar>',
    'Reply-To: ' . $email,
];

$mailWarnings = [];
$mailAccepted = false;
set_error_handler(static function (int $severity, string $message) use (&$mailWarnings): bool {
    if (!(error_reporting() & $severity)) {
        return false;
    }
    $mailWarnings[] = sanitizeLogValue($message);
    return true;
});

try {
    $mailAccepted = mail($recipient, $encodedSubject, $message, implode("\r\n", $headers));
} catch (Throwable $error) {
    $mailWarnings[] = sanitizeLogValue($error->getMessage());
} finally {
    restore_error_handler();
}

if (!$mailAccepted) {
    logMailAttempt($requestId, 'failed', [
        'transport' => 'php_mail',
        'warnings' => $mailWarnings,
    ]);
    respond(503, [
        'ok' => false,
        'message' => 'No se pudo enviar en este momento. Probá por WhatsApp.',
    ]);
}

logMailAttempt($requestId, 'accepted', ['transport' => 'php_mail']);
respond(200, [
    'ok' => true,
    'message' => 'Consulta enviada. ¡Gracias!',
]);
