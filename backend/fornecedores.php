<?php
require_once 'config.php';

if ($method === 'GET') {
    echo json_encode($pdo->query("SELECT * FROM fornecedores ORDER BY nome ASC")->fetchAll());
} elseif ($method === 'POST') {
    $sql = "INSERT INTO fornecedores (nome, contacto, email, endereco) VALUES (?, ?, ?, ?)";
    $pdo->prepare($sql)->execute([$input['nome'], $input['contacto'], $input['email'], $input['endereco']]);
    echo json_encode(['success' => true]);
}
?>