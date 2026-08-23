# Banco KingHost

Arquivo para importar:

```text
database/kinghost_import.sql
```

Dados informados da KingHost:

```text
Servidor: mysql05-farm88.kinghost.net
Banco: araguaiapalace01
Usuario: araguaiapalace01
Versao: MariaDB 10.6
```

## Importar pelo phpMyAdmin

1. Entre no painel da KingHost e abra o phpMyAdmin.
2. Selecione o banco `araguaiapalace01` no menu lateral.
3. Clique em `Importar`.
4. Escolha o arquivo `database/kinghost_import.sql`.
5. Mantenha o formato como `SQL`.
6. Clique em `Executar`.

## Importar por terminal, se tiver SSH

```bash
mysql -h mysql05-farm88.kinghost.net -u araguaiapalace01 -p araguaiapalace01 < database/kinghost_import.sql
```

O arquivo nao inclui a senha do banco. Use a senha definida no painel da KingHost.

## Observacao importante

O app de gestao ainda salva dados no navegador por `localStorage`. Este banco deixa a estrutura pronta para a API/PHP, mas para o painel gravar no MySQL ainda precisa conectar o frontend a endpoints PHP ou Node que usem essas tabelas.
