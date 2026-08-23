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

function user_payload(array $user): array
{
    $permissions = json_decode((string)$user['permissions'], true);

    return [
        'id' => $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role'],
        'contact' => $user['contact'],
        'photo' => $user['photo_url'],
        'active' => (bool)$user['active'],
        'permissions' => is_array($permissions) ? $permissions : [],
    ];
}

function send_reset_email(array $config, string $to, string $name, string $token): bool
{
    $baseUrl = rtrim((string)$config['app_base_url'], '/') . '/';
    $resetUrl = $baseUrl . '#/reset-password?token=' . urlencode($token);
    $subject = 'Recuperacao de senha - Araguaia Palace Hotel';
    $message = "Ola, {$name}.\n\n";
    $message .= "Recebemos uma solicitacao para recuperar sua senha do Sistema de Gestao do Araguaia Palace Hotel.\n\n";
    $message .= "Acesse o link abaixo para definir uma nova senha. O link expira em 1 hora:\n";
    $message .= $resetUrl . "\n\n";
    $message .= "Se voce nao solicitou isso, ignore este e-mail.\n";

    $from = (string)$config['mail_from'];
    $fromName = (string)$config['mail_from_name'];
    $headers = [
        'From: ' . $fromName . ' <' . $from . '>',
        'Reply-To: ' . $from,
        'Content-Type: text/plain; charset=UTF-8',
    ];

    return mail($to, $subject, $message, implode("\r\n", $headers));
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

        if (!$user || !(bool)$user['active'] || !verify_password_for_user($password, $user)) {
            send_json(401, ['ok' => false, 'error' => 'Invalid credentials']);
        }

        $pdo->prepare('UPDATE app_users SET last_login_at = NOW() WHERE id = ?')->execute([$user['id']]);
        send_json(200, ['ok' => true, 'user' => user_payload($user)]);
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

        if (!$user) {
            send_json(403, ['ok' => false, 'error' => 'Acesso negado: E-mail Google não cadastrado no sistema']);
        }

        if (!(bool)$user['active']) {
            send_json(403, ['ok' => false, 'error' => 'Conta desativada. Contate o administrador.']);
        }

        $pdo->prepare('UPDATE app_users SET last_login_at = NOW() WHERE id = ?')->execute([$user['id']]);
        send_json(200, ['ok' => true, 'user' => user_payload($user)]);
    }

    if ($action === 'request-password-reset') {
        $email = strtolower(trim((string)($input['email'] ?? '')));

        if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $stmt = $pdo->prepare('SELECT id, name, email, active FROM app_users WHERE email = ? LIMIT 1');
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if ($user && (bool)$user['active']) {
                $token = bin2hex(random_bytes(32));
                $tokenHash = hash('sha256', $token);

                $pdo->prepare('UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL')
                    ->execute([$user['id']]);
                $pdo->prepare('INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))')
                    ->execute([$user['id'], $tokenHash]);

                send_reset_email($config, $user['email'], $user['name'], $token);
            }
        }

        send_json(200, ['ok' => true]);
    }

    if ($action === 'reset-password') {
        $token = trim((string)($input['token'] ?? ''));
        $password = (string)($input['password'] ?? '');

        if (strlen($token) < 40 || strlen($password) < 8) {
            send_json(400, ['ok' => false, 'error' => 'Invalid reset data']);
        }

        $tokenHash = hash('sha256', $token);
        $stmt = $pdo->prepare(
            'SELECT prt.id AS token_id, au.id AS user_id
             FROM password_reset_tokens prt
             INNER JOIN app_users au ON au.id = prt.user_id
             WHERE prt.token_hash = ? AND prt.used_at IS NULL AND prt.expires_at > NOW() AND au.active = 1
             LIMIT 1'
        );
        $stmt->execute([$tokenHash]);
        $row = $stmt->fetch();

        if (!$row) {
            send_json(400, ['ok' => false, 'error' => 'Invalid or expired token']);
        }

        $newHash = password_hash($password, PASSWORD_DEFAULT);
        $pdo->beginTransaction();
        $pdo->prepare('UPDATE app_users SET password_salt = ?, password_hash = ? WHERE id = ?')
            ->execute(['password_hash', $newHash, $row['user_id']]);
        $pdo->prepare('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?')
            ->execute([$row['token_id']]);
        $pdo->commit();

        send_json(200, ['ok' => true]);
    }

    send_json(404, ['ok' => false, 'error' => 'Not found']);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    send_json(500, ['ok' => false, 'error' => 'Internal server error']);
}
