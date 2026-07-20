# Especificação de Regras de Negócio (BRs) — ERP de Gestão Interna (B2B SaaS)

**Documento:** BR-001  
**Status:** Aprovado para Desenvolvimento  
**Data de Emissão:** 20 de julho de 2026

---

## 1. Módulo de Segurança, Autenticação e Multi-Tenancy (AUTH)

- **BR-AUTH-01 (Unicidade de Identidade):** O e-mail cadastrado é o identificador único. É vedada a coexistência de registros vinculados ao mesmo endereço na plataforma.
- **BR-AUTH-02 (Ofuscação de Credenciais):** Senhas devem ser armazenadas com criptografia unidirecional irreversível (ex: Bcrypt) antes da persistência no banco de dados.
- **BR-AUTH-03 (Restrição de Escopo Privado e Sessão JWT):** Acesso estritamente privado às rotas operacionais do sistema. Tentativas de acesso não autorizadas ou sem cookie de sessão válido (`b2b_session`) disparam redirecionamento imediato para a interface pública de login.
- **BR-AUTH-04 (Isolamento Estrito Multi-Tenant):** Toda e qualquer requisição de leitura, criação, atualização ou exclusão nos módulos do sistema deve ser obrigatoriamente vinculada e filtrada pelo `userId` do usuário autenticado na sessão, garantindo sigilo e isolamento total entre empresas/tenants.
- **BR-AUTH-05 (Inicialização Automática de Tenant):** No ato do cadastro de um novo usuário (`registerAction`), o sistema deve gravar a Razão Social/Nome da Empresa no perfil principal e inicializar automaticamente a linha de configurações corporativas (`CompanySettings`) vinculada a esse novo `userId`.

---

## 2. Módulo de Consolidação Analítica (DASHBOARD)

- **BR-DASH-01 (Consistência Estatística e Segregação):** KPIs do painel analítico devem refletir, em tempo real, a agregação aritmética dos dados consolidados pertencentes exclusivamente ao tenant autenticado (Volume de Clientes, Faturamento Bruto e Movimentação de Estoque). O faturamento considera a somatória real de todos os pedidos com status concluído (`DELIVERED`).
- **BR-DASH-02 (Volumetria Cronológica do Tenant):** Métricas de captação e relatórios de desempenho comercial são agrupados pela data oficial de registro (`createdAt`), podendo ser filtrados por competência mensal (`YYYY-MM`) isolada no horário local.

---

## 3. Módulo de Gestão de Clientes (CRUD)

- **BR-CRUD-01 (Fracionamento de Massa de Dados):** Listagens adotam paginação compulsória para mitigar sobrecargas de processamento. Teto de 10 registros por requisição.
- **BR-CRUD-02 (Validação Bifásica):** Validação sintática preliminar na camada de interface e validação semântica/estrutural compulsória na camada de serviço via schemas de validação Zod.
- **BR-CRUD-03 (Integridade Referencial do Tenant):** A remoção de clientes adota a regra de exclusão física em cascata (`onDelete: Cascade`) para seus respectivos pedidos e itens associados, restrita estritamente aos registros pertencentes ao `userId` do usuário logado.
- **BR-CLI-01 (Exclusividade Operacional B2B e Sanitização de Documentos):** O sistema opera sob um modelo de negócios focado na cartela de compradores comerciais da fábrica. O cadastro de clientes do tipo Pessoa Física (CPF) é vetado na camada de aplicação. Todo documento inserido deve ser um CNPJ válido. Antes da persistência, o back-end deve remover toda a máscara do CNPJ, garantindo que apenas os 14 dígitos numéricos sejam armazenados no banco de dados.
- **BR-CLI-02 (Integridade de Contato):** O cadastro de clientes deve obrigatoriamente capturar e-mail e telefone de contato, garantindo a viabilidade de comunicação e a logística de entrega e faturamento do módulo de gestão.

---

## 4. Módulo de Catálogo e Inventário (PRODUCT)

- **BR-PROD-01 (Controle de Estoque Físico Isolado):** Todo produto cadastrado possui obrigatoriamente um controle de saldo em inventário integrado (estoque) pertencente ao tenant, atualizado dinamicamente com base nas saídas por faturamento de vendas ou estornos por cancelamento.
- **BR-PROD-02 (Precisão Monetária):** Os valores comerciais dos produtos devem utilizar representação decimal estrita de alta precisão (`@db.Decimal(10, 2)`) para mitigar erros de arredondamento de ponto flutuante.

---

## 5. Módulo de Pedidos e Vendas (ORDERS)

- **BR-ORD-01 (Consistência de Preço Histórico):** O preço unitário de um item contido em um pedido (`OrderItem.price`) deve ser gravado de forma estática e imutável no momento exato em que a venda é fechada. Alterações posteriores no preço do catálogo não alteram o faturamento de vendas passadas.
- **BR-ORD-02 (Atomicidade Transacional e Controle de Estoque):** A criação de um pedido, vinculação de itens e eventual baixa de estoque devem ser executadas sob uma transação isolada de banco de dados (`$transaction`). Se houver inconsistência ou estoque insuficiente, a operação inteira sofre rollback automático.

---

## 6. Módulo de Processamento de Relatórios e Exportação (EXPORT)

- **BR-EXPORT-01 (Fidelidade Institucional e de Escopo na Exportação):** O motor de exportação de relatórios (PDF) deve recuperar exclusivamente os dados consolidados do tenant logado, extraindo a Razão Social, CNPJ e endereço do cabeçalho diretamente do registro de `CompanySettings` pertencente ao `userId` autenticado.
