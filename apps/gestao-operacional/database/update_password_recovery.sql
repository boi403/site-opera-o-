-- Atualizacao para base ja importada: senha do Mateus + recuperacao por e-mail.
-- Execute no phpMyAdmin selecionando a base araguaiapalace01.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
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

-- Troque SUA_SENHA_AQUI por uma senha forte antes de rodar este script.
-- Nao deixe a senha real neste arquivo (ele fica no controle de versao).
UPDATE app_users
SET
  password_salt = 'araguaia-owner-2026',
  password_hash = SHA2(CONCAT('araguaia-owner-2026', 'SUA_SENHA_AQUI'), 256),
  updated_at = NOW()
WHERE email = 'mateus.orezende@gmail.com';
