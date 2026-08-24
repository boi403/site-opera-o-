-- Araguaia Palace Hotel - migracao: tabela de sessoes do painel admin do site
-- Nao apaga nenhuma tabela existente. Rode isso UMA VEZ no banco ja existente
-- (o mesmo banco compartilhado com a gestao operacional) via phpMyAdmin do KingHost.
--
-- Motivo: o backend do site agora e um script PHP sem estado (auth.php),
-- entao a sessao do admin precisa ficar no banco em vez de em memoria.

CREATE TABLE IF NOT EXISTS admin_sessions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id VARCHAR(36) NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admin_sessions_token_hash (token_hash),
  KEY idx_admin_sessions_user (user_id),
  KEY idx_admin_sessions_expires (expires_at),
  CONSTRAINT fk_admin_sessions_user FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
