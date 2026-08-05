---
description: Revisa um arquivo ou diff do backend/frontend quanto à conformidade com as convenções do projeto (Clean Architecture, SOLID, tratamento de erros).
name: revisar-conformidade
argument-hint: caminho do arquivo ou trecho a revisar (ex. backend/src/services/documents.service.js)
agent: agent
---

# Revisar conformidade com as convenções do projeto

Revise `${input:alvo:caminho do arquivo ou trecho a revisar}` verificando aderência às regras definidas em `.github/copilot-instructions.md`.

Verifique especificamente:

- Fluxo de dependência `routes -> controllers -> services -> repositories`, sem uma camada pular ou conhecer camadas externas.
- Ausência de acesso a armazenamento externo/serviços de terceiros para upload (apenas filesystem local em `backend/storage`).
- Tratamento de erros nos limites do sistema (entrada HTTP, leitura/escrita de arquivos), sem vazar stack traces ao cliente.
- Aplicação de SOLID, DRY, KISS, YAGNI e ausência de overengineering.
- Nomes de símbolos em inglês e mensagens/comentários voltados ao usuário em português.
- Funções pequenas com responsabilidade única.

Ao final, liste os problemas encontrados (se houver) em ordem de prioridade e sugira a correção para cada um. Se o código estiver conforme, informe isso explicitamente sem sugerir mudanças desnecessárias.
