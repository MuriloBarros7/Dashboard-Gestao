# ADR 01: Mecanismo de Autenticação, Persistência de Sessão e Isolamento de Dados

## Status

Aprovado

## Contexto

Para dar cumprimento às exigências de segurança, integridade e restrição de acesso descritas nas regras de negócio **BR-AUTH-02**, **BR-AUTH-03** e a nova diretriz de isolamento **BR-AUTH-04**, o sistema requer uma camada de autenticação robusta.

Os desafios incluem a proteção contra ataques de injeção (_XSS_), a garantia de validações de permissão rápidas e, crucialmente, a implementação de um **isolamento de dados (Multi-tenancy)** rigoroso, garantindo que usuários de uma organização jamais acessem dados de outra.

## Decisão

Fica estipulada a adoção das seguintes tecnologias e padrões arquiteturais:

1. **Ofuscação de Credenciais (Resolução da BR-AUTH-02):**
   As senhas serão processadas via **Bcrypt** com fator de custo 10, na camada de serviço antes da persistência no banco de dados.

2. **Gerenciamento de Sessão Stateless e Contexto Corporativo (Resolução da BR-AUTH-04):**
   A persistência adotará **JSON Web Tokens (JWT)**. O payload do token, além de identificar o usuário, conterá obrigatoriamente o `organizationId`. Isso garante que o contexto da empresa esteja disponível em todas as requisições, facilitando a aplicação dos filtros obrigatórios de isolamento de dados.

3. **Armazenamento Seguro e Mitigação de XSS:**
   O token JWT será armazenado em um **Cookie HTTP-only** com as diretivas `Secure` e `SameSite=Strict`. Isso impede o acesso por scripts maliciosos.

4. **Intercepção de Rotas e Validação de Escopo (Resolução da BR-AUTH-03 e BR-AUTH-04):**
   O **Middleware do Next.js** centralizará a segurança. Ele não apenas validará a existência da sessão, mas também verificará se o usuário possui permissão para o escopo da organização solicitada na URL ou na requisição, disparando redirecionamento para `/login` em caso de falha de autenticação ou violação de escopo.

5. **Camada de Serviço e Filtro de Segurança (Resolução da BR-CRUD-04):**
   Todas as _Server Actions_ e _Route Handlers_ utilizarão o `organizationId` contido no contexto da sessão para compor automaticamente as consultas ao banco de dados via Prisma, garantindo que o filtro `where: { organizationId: ... }` seja aplicado invariavelmente em toda operação CRUD.

6. **Evolução do Modelo de Dados (Ajuste Técnico - Julho/2026):**
   Para atender às necessidades de comunicação B2B, foram adicionados campos de `email` e `phone` à entidade `Client` e campos de `name` e `cnpj` à entidade `Organization`. As operações de persistência e validação devem considerar estes atributos como parte da estrutura de dados consolidada.

## Consequências

- **Positivo:** Proteção nativa contra roubo de credenciais via XSS.
- **Positivo:** Isolamento de dados garantido por arquitetura, impedindo vazamentos entre diferentes CNPJs (Multi-tenancy).
- **Positivo:** Latência reduzida nas validações de segurança devido à execução no Middleware (Edge).
- **Negativo:** Aumento da responsabilidade do Middleware e das _Server Actions_, que devem tratar rigorosamente a propagação e validação do `organizationId` em cada chamada de serviço.
