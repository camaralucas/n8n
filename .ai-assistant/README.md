# n8n Specialist AI System

## 🎯 Overview

This system implements an AI assistant specialized in n8n with:
- **Persistent Memory**: Maintains context between sessions
- **RAG (Retrieval Augmented Generation)**: Intelligent knowledge retrieval
- **Auto-Learning**: Learns from each implementation
- **100% Local**: No external API dependencies

## 📁 Structure

```
.ai-assistant/
├── README.md                      # This file
├── BRAINSTORMING.md               # Complete architecture documentation
├── config.json                    # Configuration
├── memory/                        # Persistent memory
│   ├── session_history.jsonl      # Interaction history
│   ├── context.json               # Current context
│   ├── learnings.json             # Learned patterns
│   └── decisions.json             # Architectural decisions
├── knowledge-base/                # Knowledge base
│   ├── embeddings/                # Vectors for semantic search
│   ├── documentation/             # Structured docs
│   └── code-examples/             # Categorized examples
├── tasks/                         # Task management
└── logs/                          # Activity logs
```

## 🚀 How It Works

### 1. When you make a request:
```
"Create a node to integrate with API X"
```

### 2. The system:
1. **Consults memory** to understand context
2. **Searches for relevant knowledge** via RAG:
   - Documentation about nodes
   - Similar examples
   - Known patterns
3. **Creates an implementation plan**
4. **Executes** the tasks
5. **Learns** from the implementation

### 3. Result:
- ✅ Code implemented following n8n patterns
- ✅ Tests added
- ✅ Knowledge updated for future implementations

## 💡 Capabilities

### ✅ What the system can do:

- **Create Nodes**: New nodes with credentials, API calls, polling/webhooks
- **Backend Features**: Controllers, services, repositories following DI pattern
- **Frontend Features**: Vue 3 components, Pinia stores, i18n
- **Refactoring**: Modernize code following best practices
- **Debugging**: Find and fix issues based on history
- **Documentation**: Generate docs based on implementations

### 🎓 What the system learns:

- Code patterns in your project
- Architectural decisions
- Common problems and solutions
- Team conventions
- Performance tips

## 📊 Project Status

### Phase 1: Foundation (IN PROGRESS)
- [x] Directory structure created
- [x] Architecture documentation
- [ ] Memory manager implemented
- [ ] Documentation indexing
- [ ] Initial code examples

### Phase 2: Basic RAG (NEXT)
- [ ] Vector embeddings (ONNX)
- [ ] Semantic search
- [ ] Memory integration

### Phase 3+: See BRAINSTORMING.md

## 🔧 Usage

### Main Commands (To be implemented)

```bash
# Index documentation
pnpm ai:index-docs

# Index code examples
pnpm ai:index-examples

# Query knowledge base
pnpm ai:query "How to create a node?"

# View current context
pnpm ai:context

# View learnings
pnpm ai:learnings
```

### Chat Integration

The system is designed to work natively with AI assistants like Claude through Cursor, maintaining memory and context between conversations.

## 📚 Documentation

- **BRAINSTORMING.md**: Complete architecture and technical decisions
- **memory/**: Schemas and data formats
- **knowledge-base/documentation/**: Structured knowledge

## 🎯 Next Steps

1. Implement memory manager
2. Add curated code examples
3. Create indexing script
4. Test end-to-end flow
5. Implement vector search

## 🤝 Contributing

This system learns automatically from each successful implementation. The more you use it, the better it gets!

---

**Created**: 2026-01-11  
**Status**: In active development  
**Goal**: Make n8n implementations 10x faster and more consistent
