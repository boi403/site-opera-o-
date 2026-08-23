-- Araguaia Palace Hotel - banco inicial para KingHost/phpMyAdmin
-- Banco/usuario KingHost: araguaiapalace01
-- Host para conexao: mysql05-farm88.kinghost.net
-- Servidor informado: MariaDB 10.6
-- Como usar: selecione o banco criado no painel da KingHost e importe este arquivo.
-- Compatível com MySQL/MariaDB usando InnoDB e utf8mb4.
--
-- Se for importar via terminal e seu usuario tiver permissao, voce pode descomentar:
-- CREATE DATABASE IF NOT EXISTS `araguaiapalace01` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE `araguaiapalace01`;

SET NAMES utf8mb4;
SET time_zone = '-03:00';
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS ai_events;
DROP TABLE IF EXISTS system_settings;
DROP TABLE IF EXISTS logbook_entries;
DROP TABLE IF EXISTS minibar_transactions;
DROP TABLE IF EXISTS minibar_items;
DROP TABLE IF EXISTS maintenance_tasks;
DROP TABLE IF EXISTS stock_items;
DROP TABLE IF EXISTS room_history;
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS app_users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE app_users (
  id VARCHAR(36) NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  password_salt VARCHAR(64) NOT NULL,
  password_hash CHAR(64) NOT NULL,
  role ENUM('ADMIN','CAMAREIRA','MANUTENCAO','RECEPCAO','GOVERNANCA') NOT NULL DEFAULT 'RECEPCAO',
  contact VARCHAR(40) DEFAULT NULL,
  photo_url VARCHAR(500) DEFAULT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  permissions TEXT NOT NULL,
  last_login_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_app_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE password_reset_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id VARCHAR(36) NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_password_reset_token_hash (token_hash),
  KEY idx_password_reset_user (user_id),
  KEY idx_password_reset_expires (expires_at),
  CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE rooms (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  number VARCHAR(10) NOT NULL,
  floor TINYINT UNSIGNED NOT NULL,
  category VARCHAR(80) NOT NULL,
  status ENUM('LIBERADO','EM LIMPEZA','VISTORIA','OCUPADO','BLOQUEADO','MANUTENCAO','SUJO') NOT NULL DEFAULT 'LIBERADO',
  last_cleaning DATETIME DEFAULT NULL,
  last_maintenance DATETIME DEFAULT NULL,
  last_ac_cleaning DATETIME DEFAULT NULL,
  responsible VARCHAR(120) DEFAULT NULL,
  guest_name VARCHAR(160) DEFAULT NULL,
  photos TEXT DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_rooms_number (number),
  KEY idx_rooms_floor (floor),
  KEY idx_rooms_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reservations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  room_id INT UNSIGNED DEFAULT NULL,
  guest_name VARCHAR(160) NOT NULL,
  guest_document VARCHAR(40) DEFAULT NULL,
  guest_phone VARCHAR(40) DEFAULT NULL,
  guest_email VARCHAR(190) DEFAULT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  adults TINYINT UNSIGNED NOT NULL DEFAULT 1,
  children TINYINT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('PENDING','CONFIRMED','CHECKED_IN','CHECKED_OUT','CANCELLED','NO_SHOW') NOT NULL DEFAULT 'PENDING',
  source VARCHAR(80) DEFAULT 'site',
  notes TEXT DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_reservations_dates (check_in, check_out),
  KEY idx_reservations_status (status),
  CONSTRAINT fk_reservations_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE room_history (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  room_id INT UNSIGNED NOT NULL,
  action VARCHAR(255) NOT NULL,
  user_name VARCHAR(120) NOT NULL,
  type ENUM('CLEANING','MAINTENANCE','SYSTEM','INSPECTION','AC_CLEANING') NOT NULL DEFAULT 'SYSTEM',
  occurred_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_room_history_room (room_id),
  KEY idx_room_history_type (type),
  CONSTRAINT fk_room_history_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE stock_items (
  id VARCHAR(36) NOT NULL,
  name VARCHAR(140) NOT NULL,
  category ENUM('CLEANING','MAINTENANCE','AMENITIES') NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  min_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit VARCHAR(30) NOT NULL DEFAULT 'un',
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  photo_url VARCHAR(500) DEFAULT NULL,
  location VARCHAR(120) DEFAULT NULL,
  supplier_contact VARCHAR(160) DEFAULT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_stock_category (category),
  KEY idx_stock_low (quantity, min_quantity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE maintenance_tasks (
  id VARCHAR(36) NOT NULL,
  room_id INT UNSIGNED DEFAULT NULL,
  type VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  priority ENUM('Baixa','Media','Alta','Urgente') NOT NULL DEFAULT 'Media',
  responsible VARCHAR(120) DEFAULT NULL,
  cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status ENUM('PENDING','IN_PROGRESS','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  due_at DATETIME DEFAULT NULL,
  completed_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_maintenance_room (room_id),
  KEY idx_maintenance_status (status),
  KEY idx_maintenance_priority (priority),
  CONSTRAINT fk_maintenance_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE minibar_items (
  id VARCHAR(36) NOT NULL,
  name VARCHAR(120) NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  category ENUM('BEVERAGE','SNACK','ALCOHOL') NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE minibar_transactions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  room_id INT UNSIGNED DEFAULT NULL,
  item_id VARCHAR(36) DEFAULT NULL,
  item_name VARCHAR(120) NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  registered_by VARCHAR(120) NOT NULL,
  status ENUM('CONSUMED','LOSS') NOT NULL DEFAULT 'CONSUMED',
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_minibar_room (room_id),
  KEY idx_minibar_item (item_id),
  CONSTRAINT fk_minibar_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
  CONSTRAINT fk_minibar_item FOREIGN KEY (item_id) REFERENCES minibar_items(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE logbook_entries (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  type ENUM('INFO','ALERT','MAINTENANCE','GUEST') NOT NULL DEFAULT 'INFO',
  text TEXT NOT NULL,
  author VARCHAR(120) NOT NULL,
  department VARCHAR(80) NOT NULL,
  turn VARCHAR(80) DEFAULT NULL,
  entry_date DATE NOT NULL,
  entry_time TIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_logbook_date (entry_date),
  KEY idx_logbook_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE system_settings (
  setting_key VARCHAR(80) NOT NULL,
  setting_value TEXT NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ai_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  scope ENUM('site','ops') NOT NULL,
  type VARCHAR(80) NOT NULL,
  label VARCHAR(255) NOT NULL,
  meta TEXT DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_ai_events_scope_type (scope, type),
  KEY idx_ai_events_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Troque cada SENHA_TEMPORARIA_* por uma senha forte e unica antes de rodar
-- este script. Nao deixe senhas reais neste arquivo (fica no controle de
-- versao).
INSERT INTO app_users
  (id, name, email, password_salt, password_hash, role, contact, photo_url, active, permissions)
VALUES
  ('owner', 'Mateus Rezende', 'mateus.orezende@gmail.com', 'araguaia-owner-2026', SHA2(CONCAT('araguaia-owner-2026', 'SENHA_TEMPORARIA_OWNER'), 256), 'ADMIN', '(62) 99999-9999', 'https://picsum.photos/seed/mateus/200', 1, '["dashboard","rooms","housekeeping","minibar","maintenance","inventory","logbook","reports","performance","team","ac_management","ai_insights"]'),
  ('admin', 'Admin Araguaia', 'admin@palacioaraguaia.com', 'araguaia-admin-2026', SHA2(CONCAT('araguaia-admin-2026', 'SENHA_TEMPORARIA_ADMIN'), 256), 'ADMIN', '(62) 99999-0001', 'https://picsum.photos/seed/admin/200', 1, '["dashboard","rooms","housekeeping","minibar","maintenance","inventory","logbook","reports","performance","team","ac_management","ai_insights"]'),
  ('user-2', 'Maria Silva', 'maria@palacioaraguaia.com', 'araguaia-maria-2026', SHA2(CONCAT('araguaia-maria-2026', 'SENHA_TEMPORARIA_MARIA'), 256), 'CAMAREIRA', '(62) 99999-0002', 'https://picsum.photos/seed/maria/200', 1, '["rooms","housekeeping","minibar","logbook"]'),
  ('user-3', 'Joao Santos', 'joao@palacioaraguaia.com', 'araguaia-joao-2026', SHA2(CONCAT('araguaia-joao-2026', 'SENHA_TEMPORARIA_JOAO'), 256), 'MANUTENCAO', '(62) 99999-0003', 'https://picsum.photos/seed/joao/200', 1, '["rooms","maintenance","logbook"]');

INSERT INTO rooms
  (number, floor, category, status, last_cleaning, last_maintenance, last_ac_cleaning, responsible, guest_name, photos)
VALUES
  ('101', 1, 'Standard', 'LIBERADO', NOW(), NULL, NOW(), 'Joana Pereira', NULL, '[]'),
  ('102', 1, 'Standard', 'LIBERADO', NOW(), NULL, NOW(), 'Joana Pereira', NULL, '[]'),
  ('103', 1, 'Standard', 'LIBERADO', NOW(), NULL, NOW(), 'Joana Pereira', NULL, '[]'),
  ('104', 1, 'Standard', 'LIBERADO', NOW(), NULL, NOW(), 'Joana Pereira', NULL, '[]'),
  ('105', 1, 'Standard', 'OCUPADO', NOW(), NULL, NOW(), 'Joana Pereira', 'Hospede', '[]'),
  ('106', 1, 'Standard', 'LIBERADO', NOW(), NULL, NOW(), 'Joana Pereira', NULL, '[]'),
  ('107', 1, 'Standard', 'LIBERADO', NOW(), NULL, NOW(), 'Joana Pereira', NULL, '[]'),
  ('108', 1, 'Standard', 'LIBERADO', NOW(), NULL, NOW(), 'Joana Pereira', NULL, '[]'),
  ('109', 1, 'Standard', 'LIBERADO', NOW(), NULL, NOW(), 'Joana Pereira', NULL, '[]'),
  ('110', 1, 'Standard', 'OCUPADO', NOW(), NULL, NOW(), 'Joana Pereira', 'Hospede', '[]'),
  ('111', 1, 'Standard', 'LIBERADO', NOW(), NULL, NOW(), 'Joana Pereira', NULL, '[]'),
  ('112', 1, 'Standard', 'LIBERADO', NOW(), NULL, NOW(), 'Joana Pereira', NULL, '[]'),
  ('113', 1, 'Standard', 'LIBERADO', NOW(), NULL, NOW(), 'Joana Pereira', NULL, '[]'),
  ('114', 1, 'Standard', 'LIBERADO', NOW(), NULL, NOW(), 'Joana Pereira', NULL, '[]'),
  ('115', 1, 'Standard', 'OCUPADO', NOW(), NULL, NOW(), 'Joana Pereira', 'Hospede', '[]'),
  ('116', 1, 'Standard', 'LIBERADO', NOW(), NULL, NOW(), 'Joana Pereira', NULL, '[]'),
  ('117', 1, 'Standard', 'LIBERADO', NOW(), NULL, NOW(), 'Joana Pereira', NULL, '[]'),
  ('118', 1, 'Standard', 'LIBERADO', NOW(), NULL, NOW(), 'Joana Pereira', NULL, '[]'),
  ('119', 1, 'Standard', 'LIBERADO', NOW(), NULL, NOW(), 'Joana Pereira', NULL, '[]'),
  ('120', 1, 'Standard', 'OCUPADO', NOW(), NULL, NOW(), 'Joana Pereira', 'Hospede', '[]'),
  ('122', 1, 'Standard', 'LIBERADO', NOW(), NULL, NOW(), 'Joana Pereira', NULL, '[]'),
  ('124', 1, 'Standard', 'LIBERADO', NOW(), NULL, NOW(), 'Joana Pereira', NULL, '[]'),
  ('201', 2, 'Superior', 'LIBERADO', NOW(), NULL, NOW(), 'Ana Costa', NULL, '[]'),
  ('202', 2, 'Superior', 'LIBERADO', NOW(), NULL, NOW(), 'Ana Costa', NULL, '[]'),
  ('203', 2, 'Superior', 'LIBERADO', NOW(), NULL, NOW(), 'Ana Costa', NULL, '[]'),
  ('204', 2, 'Superior', 'LIBERADO', NOW(), NULL, NOW(), 'Ana Costa', NULL, '[]'),
  ('205', 2, 'Superior', 'LIBERADO', NOW(), NULL, NOW(), 'Ana Costa', NULL, '[]'),
  ('206', 2, 'Superior', 'LIBERADO', NOW(), NULL, NOW(), 'Ana Costa', NULL, '[]'),
  ('207', 2, 'Superior', 'EM LIMPEZA', NOW(), NULL, NOW(), 'Ana Costa', NULL, '[]'),
  ('208', 2, 'Superior', 'LIBERADO', NOW(), NULL, NOW(), 'Ana Costa', NULL, '[]'),
  ('209', 2, 'Superior', 'LIBERADO', NOW(), NULL, NOW(), 'Ana Costa', NULL, '[]'),
  ('210', 2, 'Superior', 'LIBERADO', NOW(), NULL, NOW(), 'Ana Costa', NULL, '[]'),
  ('211', 2, 'Superior', 'LIBERADO', NOW(), NULL, NOW(), 'Ana Costa', NULL, '[]'),
  ('212', 2, 'Superior', 'LIBERADO', NOW(), NULL, NOW(), 'Ana Costa', NULL, '[]'),
  ('213', 2, 'Superior', 'LIBERADO', NOW(), NULL, NOW(), 'Ana Costa', NULL, '[]'),
  ('214', 2, 'Superior', 'EM LIMPEZA', NOW(), NULL, NOW(), 'Ana Costa', NULL, '[]'),
  ('215', 2, 'Superior', 'LIBERADO', NOW(), NULL, NOW(), 'Ana Costa', NULL, '[]'),
  ('216', 2, 'Superior', 'LIBERADO', NOW(), NULL, NOW(), 'Ana Costa', NULL, '[]'),
  ('217', 2, 'Superior', 'LIBERADO', NOW(), NULL, NOW(), 'Ana Costa', NULL, '[]'),
  ('218', 2, 'Superior', 'LIBERADO', NOW(), NULL, NOW(), 'Ana Costa', NULL, '[]'),
  ('219', 2, 'Superior', 'LIBERADO', NOW(), NULL, NOW(), 'Ana Costa', NULL, '[]'),
  ('220', 2, 'Superior', 'LIBERADO', NOW(), NULL, NOW(), 'Ana Costa', NULL, '[]'),
  ('221', 2, 'Superior', 'EM LIMPEZA', NOW(), NULL, NOW(), 'Ana Costa', NULL, '[]'),
  ('222', 2, 'Superior', 'LIBERADO', NOW(), NULL, NOW(), 'Ana Costa', NULL, '[]'),
  ('223', 2, 'Superior', 'LIBERADO', NOW(), NULL, NOW(), 'Ana Costa', NULL, '[]'),
  ('224', 2, 'Superior', 'LIBERADO', NOW(), NULL, NOW(), 'Ana Costa', NULL, '[]'),
  ('225', 2, 'Superior', 'LIBERADO', NOW(), NULL, NOW(), 'Ana Costa', NULL, '[]'),
  ('226', 2, 'Superior', 'LIBERADO', NOW(), NULL, NOW(), 'Ana Costa', NULL, '[]'),
  ('227', 2, 'Superior', 'LIBERADO', NOW(), NULL, NOW(), 'Ana Costa', NULL, '[]'),
  ('301', 3, 'Suite', 'LIBERADO', DATE_SUB(NOW(), INTERVAL 4 DAY), NULL, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Maria Silva', NULL, '[]'),
  ('302', 3, 'Suite', 'LIBERADO', DATE_SUB(NOW(), INTERVAL 4 DAY), NULL, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Maria Silva', NULL, '[]'),
  ('303', 3, 'Suite', 'BLOQUEADO', DATE_SUB(NOW(), INTERVAL 4 DAY), NULL, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Maria Silva', NULL, '[]'),
  ('304', 3, 'Suite', 'LIBERADO', DATE_SUB(NOW(), INTERVAL 4 DAY), NULL, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Maria Silva', NULL, '[]'),
  ('305', 3, 'Suite', 'LIBERADO', DATE_SUB(NOW(), INTERVAL 4 DAY), NULL, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Maria Silva', NULL, '[]'),
  ('306', 3, 'Suite', 'LIBERADO', DATE_SUB(NOW(), INTERVAL 4 DAY), NULL, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Maria Silva', NULL, '[]'),
  ('307', 3, 'Suite', 'LIBERADO', DATE_SUB(NOW(), INTERVAL 4 DAY), NULL, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Maria Silva', NULL, '[]'),
  ('308', 3, 'Suite', 'LIBERADO', DATE_SUB(NOW(), INTERVAL 4 DAY), NULL, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Maria Silva', NULL, '[]'),
  ('309', 3, 'Suite', 'LIBERADO', DATE_SUB(NOW(), INTERVAL 4 DAY), NULL, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Maria Silva', NULL, '[]'),
  ('310', 3, 'Suite', 'LIBERADO', DATE_SUB(NOW(), INTERVAL 4 DAY), NULL, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Maria Silva', NULL, '[]'),
  ('311', 3, 'Suite', 'LIBERADO', DATE_SUB(NOW(), INTERVAL 4 DAY), NULL, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Maria Silva', NULL, '[]'),
  ('312', 3, 'Suite', 'LIBERADO', DATE_SUB(NOW(), INTERVAL 4 DAY), NULL, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Maria Silva', NULL, '[]'),
  ('313', 3, 'Suite', 'LIBERADO', DATE_SUB(NOW(), INTERVAL 4 DAY), NULL, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Maria Silva', NULL, '[]'),
  ('314', 3, 'Suite', 'LIBERADO', DATE_SUB(NOW(), INTERVAL 4 DAY), NULL, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Maria Silva', NULL, '[]'),
  ('315', 3, 'Suite', 'BLOQUEADO', DATE_SUB(NOW(), INTERVAL 4 DAY), NULL, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Maria Silva', NULL, '[]'),
  ('316', 3, 'Suite', 'LIBERADO', DATE_SUB(NOW(), INTERVAL 4 DAY), NULL, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Maria Silva', NULL, '[]'),
  ('317', 3, 'Suite', 'LIBERADO', DATE_SUB(NOW(), INTERVAL 4 DAY), NULL, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Maria Silva', NULL, '[]'),
  ('318', 3, 'Suite', 'LIBERADO', DATE_SUB(NOW(), INTERVAL 4 DAY), NULL, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Maria Silva', NULL, '[]'),
  ('319', 3, 'Suite', 'LIBERADO', DATE_SUB(NOW(), INTERVAL 4 DAY), NULL, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Maria Silva', NULL, '[]'),
  ('320', 3, 'Suite', 'LIBERADO', DATE_SUB(NOW(), INTERVAL 4 DAY), NULL, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Maria Silva', NULL, '[]'),
  ('321', 3, 'Suite', 'LIBERADO', DATE_SUB(NOW(), INTERVAL 4 DAY), NULL, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Maria Silva', NULL, '[]'),
  ('322', 3, 'Suite', 'LIBERADO', DATE_SUB(NOW(), INTERVAL 4 DAY), NULL, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Maria Silva', NULL, '[]'),
  ('323', 3, 'Suite', 'LIBERADO', DATE_SUB(NOW(), INTERVAL 4 DAY), NULL, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Maria Silva', NULL, '[]'),
  ('324', 3, 'Suite', 'LIBERADO', DATE_SUB(NOW(), INTERVAL 4 DAY), NULL, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Maria Silva', NULL, '[]'),
  ('325', 3, 'Suite', 'LIBERADO', DATE_SUB(NOW(), INTERVAL 4 DAY), NULL, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Maria Silva', NULL, '[]'),
  ('326', 3, 'Suite', 'LIBERADO', DATE_SUB(NOW(), INTERVAL 4 DAY), NULL, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Maria Silva', NULL, '[]'),
  ('327', 3, 'Suite', 'LIBERADO', DATE_SUB(NOW(), INTERVAL 4 DAY), NULL, DATE_SUB(NOW(), INTERVAL 4 DAY), 'Maria Silva', NULL, '[]');

INSERT INTO room_history (room_id, action, user_name, type, occurred_at)
SELECT id, 'Limpeza de rotina concluida', 'Maria Silva', 'CLEANING', NOW()
FROM rooms
WHERE number IN ('101','102','201','203');

INSERT INTO room_history (room_id, action, user_name, type, occurred_at)
SELECT id, 'Bloqueio preventivo', 'Admin Araguaia', 'SYSTEM', NOW()
FROM rooms
WHERE number IN ('303','315');

INSERT INTO stock_items
  (id, name, category, quantity, min_quantity, unit, unit_price, photo_url, location)
VALUES
  ('stock-1', 'Sabonete 20g', 'AMENITIES', 150, 50, 'un', 0.85, 'https://picsum.photos/seed/soap/200', 'Deposito A'),
  ('stock-2', 'Detergente 5L', 'CLEANING', 12, 5, 'galao', 45.00, 'https://picsum.photos/seed/det/200', 'Deposito B'),
  ('stock-3', 'Lampada LED 9W', 'MAINTENANCE', 8, 10, 'un', 12.90, 'https://picsum.photos/seed/bulb/200', 'Manutencao'),
  ('stock-4', 'Toalha de Banho', 'AMENITIES', 200, 100, 'un', 28.00, 'https://picsum.photos/seed/towel/200', 'Rouparia');

INSERT INTO maintenance_tasks
  (id, room_id, type, description, priority, responsible, cost, status, due_at)
VALUES
  ('m1', (SELECT id FROM rooms WHERE number = '101'), 'Ar Condicionado', 'Troca de gas', 'Urgente', 'mateus.o.rezende@unesp.br', 150.00, 'PENDING', NOW()),
  ('m2', (SELECT id FROM rooms WHERE number = '204'), 'Vazamento Banheiro', 'Troca de sifao', 'Alta', 'joao.santos@hotel.com', 85.50, 'IN_PROGRESS', DATE_ADD(NOW(), INTERVAL 1 DAY));

INSERT INTO minibar_items (id, name, price, category)
VALUES
  ('c1', 'Agua Mineral 500ml', 4.00, 'BEVERAGE'),
  ('c2', 'Cerveja Heineken', 15.00, 'ALCOHOL'),
  ('c3', 'Coca-Cola lata', 8.00, 'BEVERAGE'),
  ('c4', 'Chocolate Lindt', 15.00, 'SNACK'),
  ('c5', 'Vinho Tinto Mini', 35.00, 'ALCOHOL'),
  ('c6', 'Mix de Castanhas', 12.00, 'SNACK');

INSERT INTO minibar_transactions
  (room_id, item_id, item_name, quantity, value, registered_by, status, registered_at)
VALUES
  ((SELECT id FROM rooms WHERE number = '301'), 'c1', 'Agua Mineral 500ml', 2, 8.00, 'Maria Silva', 'CONSUMED', NOW()),
  ((SELECT id FROM rooms WHERE number = '205'), 'c2', 'Cerveja Heineken', 3, 45.00, 'Ana Costa', 'CONSUMED', NOW()),
  ((SELECT id FROM rooms WHERE number = '102'), 'c3', 'Coca-Cola lata', 1, 8.00, 'Maria Silva', 'CONSUMED', NOW()),
  ((SELECT id FROM rooms WHERE number = '305'), 'c4', 'Chocolate Lindt', 2, 30.00, 'Joana Pereira', 'LOSS', DATE_SUB(NOW(), INTERVAL 1 DAY));

INSERT INTO logbook_entries
  (type, text, author, department, turn, entry_date, entry_time)
VALUES
  ('ALERT', 'Hospede do 305 reclamou de barulho no corredor. Verificar as 22h.', 'Carlos Souza', 'Recepcao', 'Tarde (15h-23h)', CURDATE(), '14:30:00'),
  ('MAINTENANCE', 'Elevador 2 em manutencao preventiva amanha das 8h as 12h.', 'Jose Ferreira', 'Manutencao', 'Tarde (15h-23h)', CURDATE(), '12:15:00'),
  ('GUEST', 'VIP chegando amanha - Sr. Roberto Campos. Preparar welcome drink e frutas no 301.', 'Ana Paula', 'Gerencia', 'Manha (07h-15h)', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '11:00:00');

INSERT INTO system_settings (setting_key, setting_value)
VALUES
  ('hotel_name', 'Araguaia Palace Hotel'),
  ('hotel_phone', '(66) 9 9602-9294'),
  ('hotel_email', 'palacehotelaraguaia@gmail.com'),
  ('timezone', 'America/Sao_Paulo'),
  ('schema_version', '2026-04-13-001');
