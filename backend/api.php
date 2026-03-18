
<?php
/**
 * CORE API v1.3 - Pharmaceutical Stock Management
 * Designed for XAMPP (Apache + MySQL)
 */

error_reporting(E_ALL & ~E_NOTICE);
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$config = [
    'host' => 'localhost',
    'db'   => 'farmacia_vida_saudavel',
    'user' => 'root',
    'pass' => ''
];

try {
    $pdo = new PDO(
        "mysql:host={$config['host']};dbname={$config['db']};charset=utf8mb4",
        $config['user'],
        $config['pass'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    die(json_encode(['error' => 'Falha na conexão: ' . $e->getMessage()]));
}

$endpoint = $_GET['endpoint'] ?? null;
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($endpoint) {
    case 'login':
        if ($method === 'POST') {
            $sql = "SELECT * FROM usuarios WHERE username = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$input['username']]);
            $user = $stmt->fetch();

            if ($user && password_verify($input['password'], $user['senha'])) {
                unset($user['senha']);
                echo json_encode(['success' => true, 'user' => $user]);
            } else {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Credenciais inválidas']);
            }
        }
        break;

    case 'dashboard':
        if ($method === 'GET') {
            $stats = [];
            // Total Itens
            $stats['total_items'] = $pdo->query("SELECT SUM(quantidade) FROM medicamentos")->fetchColumn() ?: 0;
            // Rupturas (Abaixo do minimo)
            $stats['rupturas'] = $pdo->query("SELECT COUNT(*) FROM medicamentos WHERE quantidade <= quantidade_minima")->fetchColumn();
            // Perto do fim (Validade < 30 dias)
            $stats['validade_critica'] = $pdo->query("SELECT COUNT(*) FROM medicamentos WHERE data_validade <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)")->fetchColumn();
            // Movimentos hoje
            $stats['movimentos_hoje'] = $pdo->query("SELECT COUNT(*) FROM movimentacoes WHERE DATE(data_movimento) = CURDATE()")->fetchColumn();
            
            // Dados para o gráfico (últimos 7 dias)
            $graph = $pdo->query("SELECT DATE(data_movimento) as dia, tipo, SUM(quantidade) as total 
                                 FROM movimentacoes 
                                 WHERE data_movimento >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                                 GROUP BY dia, tipo")->fetchAll();

            echo json_encode(['stats' => $stats, 'graph' => $graph]);
        }
        break;

    case 'alerts':
        if ($method === 'GET') {
            $alerts = [];
            // Stock baixo
            $lowStock = $pdo->query("SELECT nome, quantidade, 'LowStock' as type FROM medicamentos WHERE quantidade <= quantidade_minima")->fetchAll();
            // Validade
            $expiring = $pdo->query("SELECT nome, data_validade, 'Expiry' as type FROM medicamentos WHERE data_validade <= DATE_ADD(CURDATE(), INTERVAL 60 DAY)")->fetchAll();
            
            echo json_encode(['lowStock' => $lowStock, 'expiring' => $expiring]);
        }
        break;

    case 'users':
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
        break;

    case 'medications':
        if ($method === 'GET') {
            $sql = "SELECT m.*, f.nome as supplier_name FROM medicamentos m LEFT JOIN fornecedores f ON m.fornecedor_id = f.id ORDER BY m.nome ASC";
            echo json_encode($pdo->query($sql)->fetchAll());
        } elseif ($method === 'POST') {
            $sql = "INSERT INTO medicamentos (nome, categoria, lote, quantidade, quantidade_minima, preco_venda, data_validade, fornecedor_id) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            $pdo->prepare($sql)->execute([
                $input['nome'], $input['categoria'], $input['lote'], 
                $input['quantidade'], $input['quantidade_minima'], 
                $input['preco_venda'], $input['data_validade'], $input['fornecedor_id'] ?: null
            ]);
            echo json_encode(['success' => true]);
        }
        break;

    case 'suppliers':
        if ($method === 'GET') {
            echo json_encode($pdo->query("SELECT * FROM fornecedores ORDER BY nome ASC")->fetchAll());
        } elseif ($method === 'POST') {
            $sql = "INSERT INTO fornecedores (nome, contacto, email, endereco) VALUES (?, ?, ?, ?)";
            $pdo->prepare($sql)->execute([$input['nome'], $input['contacto'], $input['email'], $input['endereco']]);
            echo json_encode(['success' => true]);
        }
        break;

    case 'movements':
        if ($method === 'GET') {
            $sql = "SELECT mov.*, med.nome as medication_name, u.nome_completo as operator_name 
                    FROM movimentacoes mov 
                    JOIN medicamentos med ON mov.medicamento_id = med.id 
                    LEFT JOIN usuarios u ON mov.operador_id = u.id 
                    ORDER BY mov.data_movimento DESC";
            echo json_encode($pdo->query($sql)->fetchAll());
        } elseif ($method === 'POST') {
            $pdo->beginTransaction();
            try {
                $st = $pdo->prepare("INSERT INTO movimentacoes (medicamento_id, tipo, quantidade, referencia, operador_id) VALUES (?, ?, ?, ?, ?)");
                $st->execute([$input['medicamento_id'], $input['tipo'], $input['quantidade'], $input['referencia'], $input['operador_id']]);

                $signal = ($input['tipo'] === 'ENTRADA') ? '+' : '-';
                $pdo->prepare("UPDATE medicamentos SET quantidade = quantidade $signal ? WHERE id = ?")->execute([$input['quantidade'], $input['medicamento_id']]);

                $pdo->commit();
                echo json_encode(['success' => true]);
            } catch (Exception $e) {
                $pdo->rollBack();
                http_response_code(400);
                echo json_encode(['error' => $e->getMessage()]);
            }
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint mismatch']);
}
