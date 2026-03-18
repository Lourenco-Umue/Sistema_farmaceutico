<?php
require_once 'config.php';

if ($method === 'GET') {
    echo json_encode($pdo->query("SELECT id, nome_completo, username, cargo, data_criacao FROM usuarios")->fetchAll());
} elseif ($method === 'POST') {
    $sql = "INSERT INTO usuarios (nome_completo, username, senha, cargo) VALUES (?, ?, ?, ?)";
    $pdo->prepare($sql)->execute([
        $input['nome_completo'], $input['username'], 
        password_hash($input['senha'], PASSWORD_DEFAULT), $input['cargo']
    ]);
    echo json_encode(['success' => true]);
} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $pdo->prepare("DELETE FROM usuarios WHERE id = ?")->execute([$id]);
        echo json_encode(['success' => true]);
    }
}
?>