# ADR 01: Mecanismo de Autenticação, Persistência de Sessão e Isolamento de Dados Multi-Tenant

## Status

Aprovado

## Contexto

Para dar cumprimento às exigências de segurança, integridade e restrição de acesso descritas nas regras de negócio **BR-AUTH-02**, **BR-AUTH-03** e **BR-AUTH-04**, o sistema requer uma camada de autenticação robusta e isolamento estrito de dados por cliente/empresa (B2B SaaS).

Os desafios incluem a proteção contra ataques de injeção (_XSS_), a garantia de validações de permissão rápidas e o controle multi-tenant seguro da fábrica (estoque, produtos, clientes corporativos, finanças e faturamento de vendas), garantindo que cada usuário/empresa visualize e manipule exclusivamente os seus próprios registros.

## Decisão

Fica estipulada a adoção das seguintes tecnologias e padrões arquiteturais:

1. **Ofuscação de Credenciais (Resolução da BR-AUTH-02):**
   As senhas serão processadas via **Bcrypt** com fator de custo 10, na camada de serviço antes da persistência no banco de dados.

2. **Gerenciamento de Sessão Stateless Exclusivo:**
   A persistência adotará **JSON Web Tokens (JWT)**. O payload do token identificará de forma estrita o ID do usuário/tenant autenticado (`userId`), garantindo que o contexto do operador esteja disponível em todas as Server Actions e requisições internas do sistema.

3. **Armazenamento Seguro e Mitigação de XSS:**
   O token JWT será armazenado em um **Cookie HTTP-only** (`b2b_session`) com as diretivas `Secure` e `SameSite=Strict`. Isso impede o acesso por scripts maliciosos.

4. **Intercepção de Rotas e Validação de Escopo (Resolução da BR-AUTH-03):**
   O **Middleware do Next.js** e a função `getCurrentUser()` centralizarão a segurança. Eles validarão a existência e a integridade da sessão do usuário, disparando redirecionamento imediato para `/login` em caso de falha de autenticação ou credenciais expiradas.

5. **Isolamento de Dados Multi-Tenant por Tenant ID (Adequação B2B SaaS):**
   Todas as consultas e operações do ORM (Prisma) foram refatoradas para incluir compulsoriamente a chave de segregação de usuário (`where: { userId: session.userId }`), garantindo que nenhuma informação de estoque, faturamento ou carteira B2B seja compartilhada entre contas distintas.

6. **Evolução Estrutural do Modelo de Dados (Resolução da BR-CLI-01, BR-CLI-02 e BR-AUTH-05):**
   Para atender às necessidades logísticas e operacionais, todas as tabelas dependentes (`Client`, `Product`, `Order`, `FinancialTransaction` e `CompanySettings`) incorporam obrigatoriamente a chave estrangeira `userId` com deleção física em cascata (`onDelete: Cascade`). No ato do registro (`registerAction`), a Razão Social enviada inicializa automaticamente a tabela de configurações da empresa (`CompanySettings`), personalizando os relatórios operacionais em PDF e a saudação do painel.

## Consequências

- **Positivo:** Proteção nativa contra roubo de credenciais e invasão de escopo entre empresas via XSS e isolamento por `userId`.
- **Positivo:** Sigilo total de dados corporativos e faturamento entre diferentes contas cadastradas na plataforma.
- **Positivo:** Latência reduzida nas validações de segurança devido à execução leve do token JWT em cookies seguros.
- **Positivo:** Automação e consistência no fluxo de integração, onde novos usuários já nascem com o perfil institucional e relatórios totalmente configurados.
