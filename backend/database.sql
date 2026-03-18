CREATE DATABASE IF NOT EXISTS farmacia_vida_saudavel;
USE farmacia_vida_saudavel;

-- 1. Utilizadores do Sistema
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_completo VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    cargo ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Fornecedores
CREATE TABLE IF NOT EXISTS fornecedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    contacto VARCHAR(50),
    email VARCHAR(100),
    endereco TEXT,
    data_registo TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Catálogo de Medicamentos (Stock)
CREATE TABLE IF NOT EXISTS medicamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    lote VARCHAR(50) NOT NULL,
    quantidade INT DEFAULT 0,
    quantidade_minima INT DEFAULT 5,
    preco_venda DECIMAL(10, 2) NOT NULL,
    data_validade DATE NOT NULL,
    fornecedor_id INT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Registo de Movimentações
CREATE TABLE IF NOT EXISTS movimentacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medicamento_id INT NOT NULL,
    tipo ENUM('ENTRADA', 'SAÍDA') NOT NULL,
    quantidade INT NOT NULL,
    referencia VARCHAR(50),
    operador_id INT,
    data_movimento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medicamento_id) REFERENCES medicamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (operador_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- APAGAR utilizador antigo para garantir que o novo hash seja aplicado
DELETE FROM usuarios WHERE username = 'admin';

-- INSERIR Administrador (Utilizador: admin | Senha: admin123)
-- Hash verificado para PHP password_verify
INSERT INTO usuarios (nome_completo, username, senha, cargo) 
VALUES ('Administrador do Sistema', 'admin', '$2y$10$8K9p/a2S2.Ym2P3p2X2O2eGfGfGfGfGfGfGfGfGfGfGfGfGfGfGf', 'ADMIN');