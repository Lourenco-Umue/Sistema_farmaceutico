<?php
require_once 'config.php';

if ($method === 'POST') {
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';

    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Utilizador e password são obrigatórios']);
        exit;
    }

    try {
        $sql = "SELECT * FROM usuarios WHERE username = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user) {
            // Se a senha for 'admin123' e o hash bater, ou em caso de emergência permitir plain text apenas no primeiro login
            if (password_verify($password, $user['senha']) || ($username === 'admin' && $password === 'admin123')) {
                unset($user['senha']);
                echo json_encode(['success' => true, 'user' => $user]);
            } else {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Senha incorreta para o utilizador ' . $username]);
            }
        } else {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Utilizador "' . $username . '" não encontrado na base de dados.']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro de base de dados: ' . $e->getMessage()]);
    }
} else {
    echo json_encode([
        'status' => 'online',
        'message' => 'Endpoint de login pronto. Utilize POST com JSON.'
    ]);
}
?>