# Especificação - Document Management System

## 1. Objetivo

Fornecer um sistema web simples para upload, listagem e download de
documentos, com armazenamento estritamente local e gestão básica por usuário.

## 2. Escopo

### Dentro do escopo

- Upload de documentos via formulário multipart
- Listagem dos documentos enviados
- Download de um documento pelo identificador
- Associação de cada documento a um usuário (owner) simples, sem autenticação completa

### Fora do escopo

- Armazenamento externo ou em nuvem
- Versionamento de documentos
- Autenticação/autorização completa (login, sessões, permissões granulares)
- Persistência em banco de dados (metadados ficam em memória nesta fase)

## 3. Requisitos funcionais

| ID    | Requisito                                                          |
| ----- | ------------------------------------------------------------------- |
| RF-01 | O usuário pode enviar um documento via `POST /upload`               |
| RF-02 | O usuário pode listar os documentos enviados via `GET /documents`   |
| RF-03 | O usuário pode baixar um documento pelo id via `GET /documents/:id/download` |
| RF-04 | O sistema associa cada documento enviado a um `owner` informado na requisição |
| RF-05 | O sistema rejeita upload sem arquivo anexado, retornando erro claro |
| RF-06 | O sistema retorna 404 ao tentar baixar/listar um documento com id inexistente |

## 4. Requisitos não funcionais

| ID     | Requisito                                                             |
| ------ | ---------------------------------------------------------------------- |
| RNF-01 | Arquivos gravados no filesystem local via `multer` com `diskStorage`, na pasta `backend/storage` |
| RNF-02 | Metadados dos documentos mantidos em memória (sem banco de dados) nesta fase |
| RNF-03 | Configuração via variáveis de ambiente (porta, diretório de storage), seguindo 12-Factor |
| RNF-04 | Nome de arquivo em disco gerado (ex.: UUID), nunca o nome original enviado pelo cliente, para evitar colisão e path traversal |
| RNF-05 | O identificador (`id`) usado no download deve ser validado antes de resolver o caminho no disco, impedindo acesso a arquivos fora de `backend/storage` |
| RNF-06 | Erros de entrada/leitura/escrita tratados nos limites do sistema (controllers/repositories), sem vazar stack traces ao cliente |

## 5. Modelo de dados (metadados do documento)

| Campo        | Tipo   | Descrição                          |
| ------------ | ------ | ----------------------------------- |
| id           | string | Identificador único do documento (UUID) |
| originalName | string | Nome original do arquivo enviado    |
| storedName   | string | Nome do arquivo gravado em disco (gerado, não exposto ao cliente) |
| mimeType     | string | Tipo MIME do arquivo enviado        |
| size         | number | Tamanho em bytes                    |
| uploadedAt   | string | Data/hora do upload (ISO 8601)      |
| owner        | string | Identificador do usuário dono       |

O repositório de metadados guarda essa estrutura em memória (ex.: `Map` por `id`), sem persistência em banco de dados nesta fase.

## 6. Contratos de API

### `POST /upload`

- **Entrada:** `multipart/form-data`
  - Campo de arquivo: `file`
  - Campo `owner` (string, obrigatório) identificando o usuário
- **Sucesso (201):**
  ```json
  {
    "id": "uuid",
    "originalName": "contrato.pdf",
    "mimeType": "application/pdf",
    "size": 20480,
    "uploadedAt": "2026-08-05T12:00:00.000Z",
    "owner": "user-1"
  }
  ```
- **Erros:**
  - `400 Bad Request` — arquivo (`file`) ausente
  - `400 Bad Request` — campo `owner` ausente ou vazio

### `GET /documents`

- **Entrada:** query string opcional `owner` para filtrar por dono
- **Sucesso (200):**
  ```json
  [
    {
      "id": "uuid",
      "originalName": "contrato.pdf",
      "mimeType": "application/pdf",
      "size": 20480,
      "uploadedAt": "2026-08-05T12:00:00.000Z",
      "owner": "user-1"
    }
  ]
  ```
  (o campo `storedName` não é exposto na resposta, por ser um detalhe interno de armazenamento)

### `GET /documents/:id/download`

- **Entrada:** `id` do documento na URL
- **Sucesso (200):** conteúdo binário do arquivo, com cabeçalho
  `Content-Disposition: attachment; filename="<originalName>"` e
  `Content-Type` correspondente ao `mimeType` armazenado
- **Erros:**
  - `404 Not Found` — nenhum documento com o `id` informado

## 7. Decisões arquiteturais

- Backend em Clean Architecture simples, com quatro camadas em `backend/src`:
  - `routes/` define os endpoints e delega para os controllers
  - `controllers/` tratam entrada/saída HTTP e validação básica
  - `services/` concentram as regras de negócio
  - `repositories/` cuidam da persistência (arquivos em disco + metadados em memória)
  - Fluxo de dependência: `routes -> controllers -> services -> repositories`;
    camadas internas não conhecem camadas externas
- Upload de arquivos via `multer` com `diskStorage` apontando para
  `backend/storage`; nenhum provedor de armazenamento externo é utilizado
- Metadados dos documentos mantidos em memória (ex.: `Map`), sem banco de dados
  nesta fase
- Frontend em React organizado por `components/`, `pages/` e `services/`,
  consumindo a API via `fetch` com prefixo `/api` (proxy do Vite)
- Configuração sensível a ambiente (porta, diretório de storage) via variáveis
  de ambiente, seguindo 12-Factor App

## 8. Plano de execução

1. Construir as quatro camadas em `backend/src`:
   - `routes/` define os endpoints e delega aos controllers
   - `controllers/` tratam entrada/saída HTTP e validação básica
   - `services/` concentram as regras de negócio
   - `repositories/` cuidam da persistência
2. Implementar os endpoints:
   - `POST /upload`
   - `GET /documents`
   - `GET /documents/:id/download`
3. Escrever testes automatizados (`node:test`) cobrindo upload, listagem,
   download e os casos de erro (arquivo ausente, `owner` ausente, id inexistente)
4. Integrar o frontend (páginas de upload, listagem e download) consumindo a
   API via `/api`, reutilizando componentes existentes
5. Validar o fluxo completo (upload → listagem → download) manualmente e via
   testes, revisando tratamento de erros e mensagens ao usuário
  }