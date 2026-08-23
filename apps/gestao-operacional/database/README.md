# Banco da Gestao Operacional

Arquivo SQL:

```text
database/gestao_operacional_kinghost.sql
```

Atualizacao para banco ja importado:

```text
database/update_password_recovery.sql
```

Dados da KingHost:

```text
Servidor: mysql05-farm88.kinghost.net
Base destino: araguaiapalace01
Usuario: araguaiapalace01
Charset: UTF 8
```

No phpMyAdmin, selecione a base `araguaiapalace01`, importe o arquivo `gestao_operacional_kinghost.sql` e marque `Remover tabelas existentes` somente se a base ainda nao tiver dados reais.

Tabelas criadas para o sistema:

- `app_users`
- `rooms`
- `reservations`
- `room_history`
- `stock_items`
- `maintenance_tasks`
- `minibar_items`
- `minibar_transactions`
- `logbook_entries`
- `system_settings`
- `ai_events`
- `password_reset_tokens`

Observacao: este arquivo cria a estrutura do banco. O app ainda precisa de uma API PHP/Node para gravar e ler esses dados no MySQL em vez de usar `localStorage`.

## Recuperacao de senha

1. Envie a pasta `api` para o servidor junto do sistema.
2. Copie `api/config.example.php` para `api/config.php`.
3. Preencha `db_pass` com a senha do banco da KingHost.
4. Confirme se `app_base_url` aponta para a URL onde a gestao operacional foi publicada.
5. Importe `update_password_recovery.sql` se o banco ja existia antes desta alteracao.

O link de recuperacao enviado por e-mail usa:

```text
https://araguaiapalacehotel.com.br/gestao/#/reset-password?token=TOKEN
```
