# Dicionário de Dados — Dashboard de Gestão (Corporativo)

**Documento:** DD-001  
**Status:** Aprovado para Desenvolvimento  
**Data de Emissão:** 20 de julho de 2026  
**Convenção de Mapeamento:** As entidades seguem o padrão PascalCase no código-fonte, enquanto as tabelas no banco de dados utilizam o padrão snake_case, conforme definido pela diretiva `@@map` no ORM.

---

## 1. Entidade: `User` (Módulo de Autenticação e Multi-Tenancy)

Responsável pelas credenciais de acesso de gestores e identificação corporativa da empresa no sistema.

| Atributos     | Tipos de Dados | Tamanho  | Restrições            |
| :------------ | :------------- | :------- | :-------------------- |
| **id**        | UUID           | 16 bytes | PK, DEFAULT UUID      |
| **email**     | VARCHAR        | 255      | UNIQUE, NOT NULL      |
| **password**  | CHAR           | 60       | NOT NULL              |
| **name**      | VARCHAR        | 255      | NULL                  |
| **createdAt** | TIMESTAMP      | 8 bytes  | NOT NULL, DEFAULT NOW |
| **updatedAt** | TIMESTAMP      | 8 bytes  | NOT NULL              |

### Descrição dos Campos:

- **id**: Identificador único da empresa/usuário no sistema.
- **email**: E-mail corporativo para login de acesso.
- **password**: Hash criptográfico da senha (padrão Bcrypt).
- **name**: Razão Social ou nome do responsável da conta.
- **createdAt**: Data e hora da criação do cadastro do usuário.
- **updatedAt**: Data e hora da última modificação nas credenciais.

---

## 2. Entidade: `Client` (Módulo de Gestão B2B)

Armazena os compradores corporativos e distribuidores parceiros da cartela de clientes da fábrica.

| Atributos     | Tipos de Dados | Tamanho  | Restrições               |
| :------------ | :------------- | :------- | :----------------------- |
| **id**        | UUID           | 16 bytes | PK, DEFAULT UUID         |
| **userId**    | UUID           | 16 bytes | FK, NOT NULL             |
| **name**      | VARCHAR        | 255      | NOT NULL                 |
| **cnpj**      | CHAR           | 14       | NULL                     |
| **phone**     | VARCHAR        | 20       | NULL                     |
| **email**     | VARCHAR        | 255      | NULL                     |
| **status**    | ENUM           | —        | NOT NULL, DEFAULT ACTIVE |
| **createdAt** | TIMESTAMP      | 8 bytes  | NOT NULL, DEFAULT NOW    |
| **updatedAt** | TIMESTAMP      | 8 bytes  | NOT NULL                 |

### Descrição dos Campos:

- **id**: Identificador único do cliente corporativo.
- **userId**: Chave estrangeira ligada ao usuário/tenant detentor (`User`).
- **name**: Nome comercial ou Razão Social da empresa cliente.
- **cnpj**: CNPJ sanitizado do cliente (apenas números).
- **phone**: Telefone de contato comercial do comprador.
- **email**: E-mail de contato e faturamento do cliente.
- **status**: Situação cadastral do cliente (`ACTIVE`, `INACTIVE`).
- **createdAt**: Data e hora do cadastro do cliente no ERP.
- **updatedAt**: Data e hora da última alteração no registro do cliente.

---

## 3. Entidade: `Product` (Módulo de Catálogo e Inventário)

Responsável pelos produtos e itens produzidos no catálogo da fábrica, controlando o saldo em estoque físico local.

| Atributos     | Tipos de Dados | Tamanho  | Restrições            |
| :------------ | :------------- | :------- | :-------------------- |
| **id**        | UUID           | 16 bytes | PK, DEFAULT UUID      |
| **userId**    | UUID           | 16 bytes | FK, NOT NULL          |
| **name**      | VARCHAR        | 255      | NOT NULL              |
| **price**     | DECIMAL        | (10, 2)  | NOT NULL              |
| **stock**     | INT            | 4 bytes  | NOT NULL, DEFAULT 0   |
| **createdAt** | TIMESTAMP      | 8 bytes  | NOT NULL, DEFAULT NOW |
| **updatedAt** | TIMESTAMP      | 8 bytes  | NOT NULL              |

### Descrição dos Campos:

- **id**: Identificador único do produto no inventário.
- **userId**: Chave estrangeira ligada ao usuário/tenant detentor (`User`).
- **name**: Nome comercial do item produzido.
- **price**: Preço atual de tabela para comercialização.
- **stock**: Saldo atual disponível para pronta-entrega no estoque.
- **createdAt**: Data e hora da inserção do item no catálogo.
- **updatedAt**: Data e hora da última modificação de preço ou dados.

---

## 4. Entidade: `Order` (Módulo de Pedidos de Faturamento)

Registros consolidados de vendas, saídas comerciais e faturamentos da fábrica.

| Atributos     | Tipos de Dados | Tamanho  | Restrições                |
| :------------ | :------------- | :------- | :------------------------ |
| **id**        | UUID           | 16 bytes | PK, DEFAULT UUID          |
| **userId**    | UUID           | 16 bytes | FK, NOT NULL              |
| **clientId**  | UUID           | 16 bytes | FK, NOT NULL              |
| **total**     | DECIMAL        | (10, 2)  | NOT NULL                  |
| **status**    | ENUM           | —        | NOT NULL, DEFAULT PENDING |
| **createdAt** | TIMESTAMP      | 8 bytes  | NOT NULL, DEFAULT NOW     |
| **updatedAt** | TIMESTAMP      | 8 bytes  | NOT NULL                  |

### Descrição dos Campos:

- **id**: Identificador único da ordem de venda.
- **userId**: Chave estrangeira ligada ao usuário/tenant detentor (`User`).
- **clientId**: Vínculo com a conta corporativa (`Client`).
- **total**: Valor total bruto acumulado do faturamento.
- **status**: Situação atual do pedido (`PENDING`, `DELIVERED`, `CANCELED`).
- **createdAt**: Data e hora da emissão e lançamento da ordem.
- **updatedAt**: Data e hora da última alteração de status da venda.

---

## 5. Entidade: `OrderItem` (Itens do Pedido)

Tabela intermediária contendo as linhas de produtos vinculadas e quantificadas em cada pedido de venda.

| Atributos     | Tipos de Dados | Tamanho  | Restrições       |
| :------------ | :------------- | :------- | :--------------- |
| **id**        | UUID           | 16 bytes | PK, DEFAULT UUID |
| **orderId**   | UUID           | 16 bytes | FK, NOT NULL     |
| **productId** | UUID           | 16 bytes | FK, NOT NULL     |
| **quantity**  | INT            | 4 bytes  | NOT NULL         |
| **price**     | DECIMAL        | (10, 2)  | NOT NULL         |

### Descrição dos Campos:

- **id**: Identificador único do item no pedido.
- **orderId**: Chave estrangeira ligada ao pedido principal (`Order`).
- **productId**: Chave estrangeira ligada ao item vendido (`Product`).
- **quantity**: Quantidade total de unidades faturadas na linha.
- **price**: Preço unitário praticado e gravado no ato da venda.

---

## 6. Entidade: `CompanySettings` (Módulo de Configuração Institucional)

Armazena as informações e dados comerciais da empresa emissora para personalização de relatórios e faturamentos.

| Atributos       | Tipos de Dados | Tamanho  | Restrições           |
| :-------------- | :------------- | :------- | :------------------- |
| **id**          | UUID           | 16 bytes | PK, DEFAULT UUID     |
| **userId**      | UUID           | 16 bytes | FK, UNIQUE, NOT NULL |
| **companyName** | VARCHAR        | 255      | NOT NULL             |
| **tradeName**   | VARCHAR        | 255      | NOT NULL             |
| **cnpj**        | VARCHAR        | 20       | NOT NULL             |
| **phone**       | VARCHAR        | 20       | NULL                 |
| **email**       | VARCHAR        | 255      | NULL                 |
| **address**     | VARCHAR        | 500      | NULL                 |
| **updatedAt**   | TIMESTAMP      | 8 bytes  | NOT NULL             |

### Descrição dos Campos:

- **id**: Identificador único da configuração institucional.
- **userId**: Chave estrangeira única vinculada à conta do usuário (`User`).
- **companyName**: Razão Social corporativa registrada.
- **tradeName**: Nome Fantasia comercial da empresa.
- **cnpj**: CNPJ comercial cadastrado.
- **phone**: Telefone institucional para contato corporativo.
- **email**: E-mail corporativo ou de faturamento oficial.
- **address**: Endereço físico completo da fábrica ou depósito.
- **updatedAt**: Data e hora do último salvamento de configurações.

---

## 7. Entidade: `FinancialTransaction` (Módulo de Gestão Financeira)

Registros do fluxo de caixa interno, consolidação de despesas operacionais e receitas de faturamentos.

| Atributos       | Tipos de Dados | Tamanho  | Restrições            |
| :-------------- | :------------- | :------- | :-------------------- |
| **id**          | UUID           | 16 bytes | PK, DEFAULT UUID      |
| **userId**      | UUID           | 16 bytes | FK, NOT NULL          |
| **description** | VARCHAR        | 500      | NOT NULL              |
| **amount**      | DECIMAL        | (10, 2)  | NOT NULL              |
| **type**        | ENUM           | —        | NOT NULL              |
| **category**    | ENUM           | —        | NOT NULL              |
| **date**        | TIMESTAMP      | 8 bytes  | NOT NULL, DEFAULT NOW |
| **createdAt**   | TIMESTAMP      | 8 bytes  | NOT NULL, DEFAULT NOW |

### Descrição dos Campos:

- **id**: Identificador único do lançamento financeiro.
- **userId**: Chave estrangeira ligada ao usuário/tenant detentor (`User`).
- **description**: Descrição clara ou histórico do lançamento.
- **amount**: Valor financeiro da movimentação de caixa.
- **type**: Tipo de transação bancária realizada (`INCOME`, `EXPENSE`).
- **category**: Categoria contábil (`SALE`, `TAX`, `SALARY`, `SUPPLIES`, `MAINTENANCE`, `OTHER`).
- **date**: Data de competência informada do fato financeiro.
- **createdAt**: Registro cronológico da inserção no sistema.

---

## 8. Nota de Arquitetura (Importante)

A modelagem de dados foi refinada para focar no **isolamento estrito multi-tenant (B2B SaaS)** em um ambiente de alta performance. Todas as entidades de domínio possuem vinculo direto via chave estrangeira (`userId`) com a tabela de usuários, assegurando que operações de consulta e gravação fiquem totalmente segregadas por tenant. As relações estruturais são protegidas nas chaves estrangeiras (`FK`) do PostgreSQL com deleção física em cascata (`onDelete: Cascade`) nas tabelas dependentes (`Order` e `OrderItem`), impedindo registros órfãos ou inconsistências contábeis. A manipulação de valores monetários utiliza o tipo estrito `DECIMAL(10,2)` no banco de dados, garantindo precisão matemática absoluta contra erros de arredondamento de ponto flutuante no JavaScript/TypeScript.
