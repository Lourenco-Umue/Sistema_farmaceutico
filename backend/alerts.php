<?php
require_once 'config.php';

if ($method === 'GET') {
    $alerts = [];
    $lowStock = $pdo->query("SELECT nome, quantidade, 'LowStock' as type FROM medicamentos WHERE quantidade <= quantidade_minima")->fetchAll();
    $expiring = $pdo->query("SELECT nome, data_validade, 'Expiry' as type FROM medicamentos WHERE data_validade <= DATE_ADD(CURDATE(), INTERVAL 60 DAY)")->fetchAll();
    echo json_encode(['lowStock' => $lowStock, 'expiring' => $expiring]);
}
?>