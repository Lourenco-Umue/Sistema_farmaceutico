
<?php
require_once 'config.php';

if ($method === 'GET') {
    try {
        $sql = "SELECT mov.*, med.nome as medication_name, u.nome_completo as operator_name 
                FROM movimentacoes mov 
                JOIN medicamentos med ON mov.medicamento_id = med.id 
                LEFT JOIN usuarios u ON mov.operador_id = u.id 
                ORDER BY mov.data_movimento DESC";
        echo json_encode($pdo->query($sql)->fetchAll());
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao listar movimentos: ' . $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    // Validar se o medicamento existe e tem stock suficiente em caso de SAÍDA
    $medId = $input['medicamento_id'];
    $tipo = $input['tipo'];
    $qtd = (int)$input['quantidade'];

    if ($tipo === 'SAÍDA') {
        $stmt = $pdo->prepare("SELECT quantidade FROM medicamentos WHERE id = ?");
        $stmt->execute([$medId]);
        $atual = $stmt->fetchColumn();
        
        if ($atual < $qtd) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Stock insuficiente para esta operação.']);
            exit;
        }
    }

    $pdo->beginTransaction();
    try {
        $st = $pdo->prepare("INSERT INTO movimentacoes (medicamento_id, tipo, quantidade, referencia, operador_id) VALUES (?, ?, ?, ?, ?)");
        $st->execute([$medId, $tipo, $qtd, $input['referencia'] ?? '', $input['operador_id'] ?? 1]);

        $signal = ($tipo === 'ENTRADA') ? '+' : '-';
        $updateSql = "UPDATE medicamentos SET quantidade = quantidade $signal ? WHERE id = ?";
        $pdo->prepare($updateSql)->execute([$qtd, $medId]);

        $pdo->commit();
        echo json_encode(['success' => true, 'message' => 'Movimento registado com sucesso']);
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Erro no servidor: ' . $e->getMessage()]);
    }
}
?>
