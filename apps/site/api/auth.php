<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

$configFile = __DIR__ . '/config.php';
if (!is_file($configFile)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'API config not found']);
    exit;
}

$config = require $configFile;

function json_input(): array
{
    $raw = file_get_contents('php://input') ?: '';
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function send_json(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

function db(array $config): PDO
{
    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=utf8mb4',
        $config['db_host'],
        $config['db_name']
    );

    return new PDO($dsn, $config['db_user'], $config['db_pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
}

function verify_password_for_user(string $password, array $user): bool
{
    $hash = (string)($user['password_hash'] ?? '');
    $salt = (string)($user['password_salt'] ?? '');

    if ($salt === 'password_hash' && password_verify($password, $hash)) {
        return true;
    }

    return hash_equals($hash, hash('sha256', $salt . $password));
}

/**
 * Verifica a assinatura/validade de um ID token do Google Sign-In usando o
 * endpoint tokeninfo do Google (nao precisa de biblioteca extra). Retorna o
 * e-mail verificado ou null se o token for invalido, expirado, ou nao for
 * para o client_id configurado.
 */
function verify_google_id_token(string $idToken, string $expectedClientId): ?string
{
    if ($idToken === '' || $expectedClientId === '') {
        return null;
    }

    $url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($idToken);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 5,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    $body = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($body === false || $status !== 200) {
        return null;
    }

    $claims = json_decode((string)$body, true);
    if (!is_array($claims)) {
        return null;
    }

    if (($claims['aud'] ?? '') !== $expectedClientId) {
        return null;
    }
    if (($claims['email_verified'] ?? 'false') !== 'true') {
        return null;
    }
    $email = strtolower(trim((string)($claims['email'] ?? '')));
    return $email !== '' ? $email : null;
}

function new_session_token(): string
{
    return bin2hex(random_bytes(32));
}

function session_payload(array $user, string $token, string $expiresAt): array
{
    return [
        'sessionToken' => $token,
        'expiresAt' => $expiresAt,
        'user' => [
            'name' => $user['name'],
            'email' => $user['email'],
        ],
    ];
}

$action = $_GET['action'] ?? '';
$input = json_input();

try {
    $pdo = db($config);

    if ($action === 'login') {
        $email = strtolower(trim((string)($input['email'] ?? '')));
        $password = (string)($input['password'] ?? '');

        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
            send_json(400, ['ok' => false, 'error' => 'Invalid credentials']);
        }

        $stmt = $pdo->prepare('SELECT * FROM app_users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !(bool)$user['active'] || $user['role'] !== 'ADMIN' || !verify_password_for_user($password, $user)) {
            send_json(401, ['ok' => false, 'error' => 'Invalid credentials']);
        }

        $token = new_session_token();
        $tokenHash = hash('sha256', $token);
        $expiresAt = (new DateTime('+12 hours'))->format(DateTime::ATOM);

        $pdo->prepare('INSERT INTO admin_sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)')
            ->execute([$user['id'], $tokenHash, $expiresAt]);
        $pdo->prepare('UPDATE app_users SET last_login_at = NOW() WHERE id = ?')->execute([$user['id']]);

        send_json(200, ['ok' => true, 'session' => session_payload($user, $token, $expiresAt)]);
    }

    if ($action === 'google-login') {
        $credential = (string)($input['credential'] ?? '');
        $clientId = (string)($config['google_client_id'] ?? '');

        if ($credential === '' || $clientId === '') {
            send_json(400, ['ok' => false, 'error' => 'Credencial do Google não informada.']);
        }

        $email = verify_google_id_token($credential, $clientId);
        if ($email === null) {
            send_json(401, ['ok' => false, 'error' => 'Credencial do Google inválida ou expirada.']);
        }

        $stmt = $pdo->prepare('SELECT * FROM app_users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || $user['role'] !== 'ADMIN') {
            send_json(403, ['ok' => false, 'error' => 'Acesso negado: E-mail Google não autorizado no painel.']);
        }

        if (!(bool)$user['active']) {
            send_json(403, ['ok' => false, 'error' => 'Conta desativada. Contate o administrador.']);
        }

        $token = new_session_token();
        $tokenHash = hash('sha256', $token);
        $expiresAt = (new DateTime('+12 hours'))->format(DateTime::ATOM);

        $pdo->prepare('INSERT INTO admin_sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)')
            ->execute([$user['id'], $tokenHash, $expiresAt]);
        $pdo->prepare('UPDATE app_users SET last_login_at = NOW() WHERE id = ?')->execute([$user['id']]);

        send_json(200, ['ok' => true, 'session' => session_payload($user, $token, $expiresAt)]);
    }

    if ($action === 'session') {
        $sessionToken = (string)($input['sessionToken'] ?? '');

        if ($sessionToken === '') {
            send_json(200, ['ok' => true, 'active' => false]);
        }

        $tokenHash = hash('sha256', $sessionToken);
        $stmt = $pdo->prepare(
            'SELECT au.*, s.expires_at AS session_expires_at
             FROM admin_sessions s
             INNER JOIN app_users au ON au.id = s.user_id
             WHERE s.token_hash = ? AND s.revoked_at IS NULL AND s.expires_at > NOW() AND au.active = 1
             LIMIT 1'
        );
        $stmt->execute([$tokenHash]);
        $row = $stmt->fetch();

        if (!$row) {
            send_json(200, ['ok' => true, 'active' => false]);
        }

        send_json(200, [
            'ok' => true,
            'active' => true,
            'session' => session_payload($row, $sessionToken, (string)$row['session_expires_at']),
        ]);
    }

    if ($action === 'logout') {
        $sessionToken = (string)($input['sessionToken'] ?? '');

        if ($sessionToken !== '') {
            $tokenHash = hash('sha256', $sessionToken);
            $pdo->prepare('UPDATE admin_sessions SET revoked_at = NOW() WHERE token_hash = ? AND revoked_at IS NULL')
                ->execute([$tokenHash]);
        }

        send_json(200, ['ok' => true]);
    }

    send_json(404, ['ok' => false, 'error' => 'Not found']);
} catch (Throwable $error) {
    send_json(500, ['ok' => false, 'error' => 'Internal server error']);
}
