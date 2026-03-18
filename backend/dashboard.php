<?php
require_once 'config.php';

if ($method === 'GET') {
    $stats = [];
    $stats['total_items'] = $pdo->query("SELECT SUM(quantidade) FROM medicamentos")->fetchColumn() ?: 0;
    $stats['rupturas'] = $pdo->query("SELECT COUNT(*) FROM medicamentos WHERE quantidade <= quantidade_minima")->fetchColumn();
    $stats['validade_critica'] = $pdo->query("SELECT COUNT(*) FROM medicamentos WHERE data_validade <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)")->fetchColumn();
    $stats['movimentos_hoje'] = $pdo->query("SELECT COUNT(*) FROM movimentacoes WHERE DATE(data_movimento) = CURDATE()")->fetchColumn();
    
    $graph = $pdo->query("SELECT DATE(data_movimento) as dia, tipo, SUM(quantidade) as total 
                         FROM movimentacoes 
                         WHERE data_movimento >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                         GROUP BY dia, tipo")->fetchAll();

    echo json_encode(['stats' => $stats, 'graph' => $graph]);
}
?>