<?php
require_once 'config.php';

if ($method === 'GET') {
    $sql = "SELECT m.*, f.nome as supplier_name FROM medicamentos m LEFT JOIN fornecedores f ON m.fornecedor_id = f.id ORDER BY m.nome ASC";
    echo json_encode($pdo->query($sql)->fetchAll());
} elseif ($method === 'POST') {
    if (empty($input['nome'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Nome do medicamento é obrigatório']);
        exit;
    }
    
    $sql = "INSERT INTO medicamentos (nome, categoria, lote, quantidade, quantidade_minima, preco_venda, data_validade, fornecedor_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    $pdo->prepare($sql)->execute([
        $input['nome'], $input['categoria'], $input['lote'], 
        $input['quantidade'], $input['quantidade_minima'], 
        $input['preco_venda'], $input['data_validade'], $input['fornecedor_id'] ?: null
    ]);
    echo json_encode(['success' => true]);
}
?>