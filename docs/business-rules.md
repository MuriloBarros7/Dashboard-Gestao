# Especificação de Regras de Negócio (BRs) — Dashboard de Gestão

**Documento:** BR-001
**Status:** Aprovado para Desenvolvimento
**Data de Emissão:** 16 de julho de 2026

## 1. Módulo de Segurança e Controle de Acesso (AUTH)

- **BR-AUTH-01 (Unicidade de Identidade):** O e-mail cadastrado é o identificador único. É vedada a coexistência de registros vinculados ao mesmo endereço.
- **BR-AUTH-02 (Ofuscação de Credenciais):** Senhas devem ser armazenadas com criptografia unidirecional irreversível (ex: Bcrypt) antes da persistência.
- **BR-AUTH-03 (Restrição de Escopo Privado):** Acesso estritamente privado. Tentativas de acesso não autorizadas ou com credenciais expiradas disparam redirecionamento imediato para a interface pública.

## 2. Módulo de Consolidação Analítica (DASHBOARD)

- **BR-DASH-01 (Consistência Estatística):** KPIs devem refletir, em tempo real, a agregação aritmética dos dados consolidados (Volume Total de Clientes, Ativos e Inativos). Nota: O cálculo deve considerar estritamente registros com `deletedAt IS NULL`, garantindo que clientes excluídos logicamente não inflem métricas operacionais.
- **BR-DASH-02 (Volumetria Cronológica):** Métricas de captação são agrupadas pela data oficial de registro (`createdAt`), segmentadas sequencialmente por mês do ano fiscal.

## 3. Módulo de Gestão de Clientes (CRUD)

- **BR-CRUD-01 (Fracionamento de Massa de Dados):** Listagens adotam paginação compulsória para mitigar sobrecargas de processamento. Teto de 10 registros por requisição.
- **BR-CRUD-02 (Validação Bifásica):** Validação sintática preliminar na camada de interface e validação semântica/estrutural compulsória na camada de serviço (ORM/Domain Layer).
- **BR-CRUD-03 (Preservação Histórica / Soft Delete):** Proibida a exclusão física e definitiva. A remoção de clientes ocorre exclusivamente via sinalização do campo deletedAt (Soft Delete). Caso o gestor (User) responsável seja removido, a relação com o cliente adota a regra ON DELETE SET NULL, preservando o registro do cliente na base para fins de auditoria e cálculos estatísticos, porém removendo o vínculo operacional.
- **BR-CRUD-04 (Segurança de Dados B2B):** Todas as operações de leitura e escrita (Create, Read, Update, Delete) devem obrigatoriamente incluir uma cláusula de filtro where: { organizationId: ... } para impedir o acesso cruzado de dados entre diferentes empresas/CNPJs.
- **BR-CLI-01 (Exclusividade Operacional B2B e Sanitização de Documentos):** O sistema opera sob um modelo de negócios estritamente B2B. O cadastro de clientes do tipo Pessoa Física (CPF) é vetado na camada de aplicação. Todo documento inserido deve ser um CNPJ válido. Antes da persistência, o back-end deve remover toda a máscara do CNPJ, garantindo que apenas os 14 dígitos numéricos sejam armazenados no banco de dados.
- **BR-CLI-02 (Máquina de Estados e Ciclo de Vida do Cliente):** O status operacional de um cliente não é de texto livre, sendo controlado por um enumerador estrito (ENUM) que dita sua disponibilidade no sistema:
  - **ACTIVE (Ativo):** Status padrão ao cadastrar. O cliente está elegível para novos pedidos, faturamento e aparece nas listagens de vendas.
  - **INACTIVE (Inativo):** Cliente com longo período sem movimentação ou descontinuado amigavelmente. Ocultado das telas de "Novo Pedido".
  - **SUSPENDED (Suspenso):** Cliente bloqueado por pendências financeiras. O sistema deve impedir a emissão de novos pedidos vinculados a este status.
- **BR-CLI-03 (Integridade de Contato):** O cadastro de clientes deve obrigatoriamente capturar e-mail e telefone de contato, garantindo a viabilidade de comunicação e integração do módulo de gestão.

## 4. Módulo de Gestão de Organizações (ORG)

- **BR-ORG-01 (Identificação Corporativa):** Toda organização cadastrada deve possuir Razão Social (name) e CNPJ válidos. Estes dados são mandatórios para a correta identificação da conta no ecossistema multi-tenant e para futuras integrações fiscais.

## 5. Módulo de Colaboração (B2B)

- **BR-COLAB-01 (Gestão de Acessos):** Empresas (proprietárias do CNPJ) possuem autoridade exclusiva para convidar e revogar o acesso de gestores externos (consultores) ao seu ambiente operacional.
- **BR-COLAB-02 (Privilégios de Acesso):** O sistema deve distinguir entre o proprietário do CNPJ (Admin) e o consultor vinculado. Operações destrutivas ou de configuração de conta podem ser restritas ao perfil Admin.

## 6. Módulo de Processamento de Relatórios (EXPORT)

- **BR-EXPORT-01 (Fidelidade de Estado na Exportação):** O motor de exportação deve herdar obrigatoriamente as diretrizes de filtragem (incluindo o descarte de deletedAt) e paginação ativas na interface do usuário.
