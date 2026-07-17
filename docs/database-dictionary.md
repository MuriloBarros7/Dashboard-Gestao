# Dicionário de Dados — Dashboard de Gestão (Corporativo)

**Documento:** DD-001  
**Status:** Aprovado para Desenvolvimento  
**Data de Emissão:** 16 de julho de 2026  
**Convenção de Mapeamento:** As entidades seguem o padrão PascalCase no código-fonte, enquanto as tabelas no banco de dados utilizam o padrão snake_case, conforme definido pela diretiva `@@map` no ORM.

---

## 1. Entidade: `Organization` (Núcleo Corporativo)

Entidade raiz para segregação de dados (Multi-tenancy). Todos os registros operacionais são vinculados a uma organização.

| Atributos     | Tipos de Dados | Tamanho  | Restrições       | Descrição                                        |
| :------------ | :------------- | :------- | :--------------- | :----------------------------------------------- |
| **id**        | UUID           | 16 bytes | PK, DEFAULT UUID | Identificador único da empresa.                  |
| **name**      | VARCHAR        | 100      | NOT NULL         | Nome fantasia da empresa cliente.                |
| **cnpj**      | CHAR           | 14       | UNIQUE, NOT NULL | CNPJ sanitizado da organização (apenas números). |
| **createdAt** | TIMESTAMP      | 8 bytes  | NOT NULL         | Data de criação da conta corporativa.            |

---

## 2. Entidade: `User` (Módulo de Autenticação)

Responsável pelas credenciais. Vinculada obrigatoriamente a uma `Organization`.

| Atributos          | Tipos de Dados | Tamanho  | Restrições       | Descrição                                       |
| :----------------- | :------------- | :------- | :--------------- | :---------------------------------------------- |
| **id**             | UUID           | 16 bytes | PK, DEFAULT UUID | Identificador único do usuário.                 |
| **email**          | VARCHAR        | 255      | UNIQUE, NOT NULL | E-mail corporativo para login.                  |
| **password**       | CHAR           | 60       | NOT NULL         | Hash Bcrypt.                                    |
| **organizationId** | UUID           | 16 bytes | FK, NOT NULL     | Vínculo obrigatório com a empresa proprietária. |

---

## 3. Entidade: `Client` (Módulo de Gestão)

Armazena os clientes, isolados pelo `organizationId`.

| Atributos          | Tipos de Dados | Tamanho  | Restrições       | Descrição                                         |
| :----------------- | :------------- | :------- | :--------------- | :------------------------------------------------ |
| **id**             | UUID           | 16 bytes | PK, DEFAULT UUID | Identificador único do cliente.                   |
| **organizationId** | UUID           | 16 bytes | FK, NOT NULL     | **Chave de isolamento (Multi-tenancy).**          |
| **name**           | VARCHAR        | 255      | NOT NULL         | Nome do cliente corporativo.                      |
| **email**          | VARCHAR        | 255      | NULL             | E-mail de contato do cliente.                     |
| **phone**          | VARCHAR        | 20       | NULL             | Telefone de contato do cliente.                   |
| **cnpj**           | CHAR           | 14       | UNIQUE, NOT NULL | CNPJ sanitizado do cliente (apenas números).      |
| **status**         | ENUM           | -        | DEFAULT 'ACTIVE' | Máquina de estados (ACTIVE, INACTIVE, SUSPENDED). |
| **deletedAt**      | TIMESTAMP      | 8 bytes  | NULL             | Exclusão lógica (Soft Delete).                    |
| **userId**         | UUID           | 16 bytes | FK, NULL         | Gestor responsável (ON DELETE SET NULL).          |

### 3.1. Índices e Regras de Otimização

- **Isolamento de Dados (B2B):** Todo índice composto ou consulta deve incluir `organizationId` como o primeiro filtro para garantir alta performance e segurança lógica entre empresas.
- **Índice de Segregação:** Índice criado em `[organizationId, cnpj]` para acelerar a busca de clientes dentro do escopo de cada empresa.

---

## 4. Nota de Arquitetura (Importante)

Para manter o padrão, todas as novas entidades (Product, Order, etc.) devem obrigatoriamente conter a coluna **`organizationId`** com vínculo `FK` para a tabela `Organization`, garantindo que o sistema cumpra o requisito de isolamento de dados definido nas **BR-CRUD-04** e **BR-COLAB-02**.
