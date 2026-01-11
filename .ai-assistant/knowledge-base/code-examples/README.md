# Code Examples

Este diretório contém exemplos curados de código do n8n, organizados por categoria.

## Estrutura

```
code-examples/
├── nodes/           # Exemplos de nodes
├── controllers/     # Exemplos de controllers (backend)
├── services/        # Exemplos de services (backend)
├── repositories/    # Exemplos de repositories (backend)
└── frontend/        # Exemplos de componentes Vue 3
```

## Como Usar

Os exemplos são usados pelo sistema RAG para:
1. Encontrar padrões similares ao que você está tentando implementar
2. Gerar código consistente com o estilo do projeto
3. Aprender melhores práticas

## Adicionando Exemplos

Exemplos devem ser:
- ✅ **Completos**: Código funcional, não snippets
- ✅ **Bem documentados**: Comentários explicando decisões importantes
- ✅ **Representativos**: Padrões comuns e úteis
- ✅ **Atualizados**: Código seguindo práticas atuais

## Categorias

### Nodes
- **simple**: Nodes básicos sem API calls
- **api**: Nodes que fazem chamadas HTTP
- **credentials**: Nodes com autenticação
- **polling**: Nodes com trigger polling
- **webhook**: Nodes com webhooks

### Backend
- **controllers**: REST API controllers
- **services**: Business logic
- **repositories**: Data access layer
- **middleware**: Express middleware
- **validators**: Validation logic

### Frontend
- **components**: Vue 3 components
- **composables**: Composition API composables
- **stores**: Pinia stores
- **utils**: Utility functions
- **views**: Page views

## Status

- [x] Nodes examples (2/5) ✅
  - [x] Simple node (NoOp)
  - [x] Node with parameters (ExecuteCommand)
  - [ ] Node with API calls
  - [ ] Node with credentials
  - [ ] Node with polling/webhooks
- [x] Controllers examples (1/3) ✅
  - [x] Simple CRUD controller (TagsController)
  - [ ] Controller with complex routing
  - [ ] Controller with file upload
- [x] Services examples (1/3) ✅
  - [x] Simple service (TagService)
  - [ ] Service with transactions
  - [ ] Service with complex business logic
- [ ] Frontend examples (0/5)
  - [ ] Vue 3 component
  - [ ] Pinia store
  - [ ] Composable
  - [ ] Component with i18n
  - [ ] Form component

**Progress**: 4 examples completed  
**Next**: Add frontend examples and advanced backend patterns
