# Scripts - n8n Specialist AI System

Utility scripts for managing the AI assistant's knowledge base and memory.

---

## 📁 Available Scripts

### 1. memory-manager.ts
**Purpose**: Query and manage the persistent memory system

**Features**:
- Search patterns by category or keyword
- Query conventions by area
- View gotchas by category/severity
- Display current context
- View learnings summary
- Search entire knowledge base

**Usage**:
```bash
# View current context
node memory-manager.ts context

# View learnings summary
node memory-manager.ts learnings

# Search knowledge base
node memory-manager.ts search "create node"

# List patterns (all or by category)
node memory-manager.ts patterns
node memory-manager.ts patterns nodes

# List conventions (all or by area)
node memory-manager.ts conventions
node memory-manager.ts conventions typescript

# List gotchas
node memory-manager.ts gotchas

# Show help
node memory-manager.ts help
```

**Examples**:
```bash
# Find all node-related patterns
node memory-manager.ts patterns nodes

# Search for error handling info
node memory-manager.ts search "error handling"

# View TypeScript conventions
node memory-manager.ts conventions typescript

# Check current session context
node memory-manager.ts context
```

---

### 2. index-docs.ts
**Purpose**: Index documentation files for semantic search

**Features**:
- Parse markdown files
- Extract sections and headings
- Generate keywords
- Create searchable index
- Search indexed documentation

**Usage**:
```bash
# Index all documentation
node index-docs.ts

# Search indexed documentation
node index-docs.ts search "node creation"
node index-docs.ts search "testing"
node index-docs.ts search "TypeScript"
```

**Indexed Files**:
- AGENTS.md
- CLAUDE.md
- packages/cli/BREAKING-CHANGES.md
- packages/nodes-base/AGENTS.md
- packages/nodes-base/CLAUDE.md
- packages/nodes-base/TESTING.MD
- packages/frontend/AGENTS.md
- packages/frontend/CLAUDE.md
- scripts/backend-module/backend-module-guide.md

**Output**:
- Creates: `knowledge-base/documentation/docs-index.json`
- Contains: Document metadata, sections, keywords

---

### 3. test-rag-flow.md
**Purpose**: Manual verification of RAG flow

**Contents**:
- 5 test scenarios
- Expected knowledge retrieval
- Query processes
- Results verification
- Coverage assessment

**Test Scenarios**:
1. "How do I create a simple node?"
2. "How do I create a REST API endpoint?"
3. "How do I create a Vue component with Pinia store?"
4. "What are the TypeScript best practices?"
5. "What gotchas should I know about building?"

**Status**: ✅ All tests passed

---

## 🚀 Quick Start

### First Time Setup

1. **Navigate to scripts directory**:
```bash
cd .ai-assistant/scripts
```

2. **Index documentation** (optional, for semantic search later):
```bash
node index-docs.ts
```

3. **Test the system**:
```bash
# View current context
node memory-manager.ts context

# Search for something
node memory-manager.ts search "node"

# View patterns
node memory-manager.ts patterns
```

---

## 📚 Common Workflows

### Workflow 1: Learning n8n Patterns

```bash
# 1. View all patterns
node memory-manager.ts patterns

# 2. View specific category
node memory-manager.ts patterns nodes

# 3. Search for specific topic
node memory-manager.ts search "error handling"

# 4. View conventions
node memory-manager.ts conventions
```

### Workflow 2: Before Starting a Feature

```bash
# 1. Search for similar implementations
node memory-manager.ts search "create API endpoint"

# 2. Check relevant conventions
node memory-manager.ts conventions backend

# 3. Check for gotchas
node memory-manager.ts gotchas

# 4. View current context
node memory-manager.ts context
```

### Workflow 3: After Completing a Feature

```bash
# 1. Document new patterns (manually edit learnings.json)
# 2. Add code example (create new .md file)
# 3. Update context (manually or via script)
# 4. Log to session history
```

---

## 🔧 Script Details

### memory-manager.ts

**Architecture**:
```typescript
class MemoryManager {
  // Query operations
  queryPatterns(keyword?, category?)
  getPattern(patternId)
  queryConventions(area?)
  queryGotchas(category?, minSeverity?)
  getContext()
  search(query)
  
  // Update operations
  updateSession(updates)
  addTouchedFile(filepath)
  updateStats(updates)
  addPattern(pattern)
  usePattern(patternId)
  addGotcha(gotcha)
  recordImplementation(implementation)
  
  // Display operations
  displayContext()
  displayLearnings()
}
```

**Files Accessed**:
- `memory/context.json` - Session context
- `memory/learnings.json` - Patterns, gotchas, conventions
- `memory/decisions.json` - Architectural decisions
- `memory/session_history.jsonl` - Interaction history
- `knowledge-base/documentation/*.json` - Structured docs

---

### index-docs.ts

**Architecture**:
```typescript
class DocumentationIndexer {
  // Parse markdown and extract sections
  parseMarkdown(filepath, content)
  
  // Index a single file
  indexFile(filepath)
  
  // Index all documentation
  indexAll()
  
  // Save index to file
  saveIndex(outputPath)
  
  // Search indexed documents
  static searchIndex(indexPath, query)
}
```

**Output Format**:
```json
{
  "indexed_at": "2026-01-11T...",
  "total_documents": 9,
  "total_sections": 150,
  "documents": [
    {
      "filepath": "AGENTS.md",
      "title": "...",
      "category": "general",
      "sections": [...],
      "keywords": [...]
    }
  ]
}
```

---

## 🎯 Tips & Best Practices

### Searching

1. **Use specific keywords**:
   - Good: "create node with parameters"
   - Bad: "node"

2. **Search by category first**:
   ```bash
   node memory-manager.ts patterns nodes
   ```

3. **Use full-text search for exploration**:
   ```bash
   node memory-manager.ts search "error handling"
   ```

### Adding Knowledge

1. **Add patterns** (edit `memory/learnings.json`):
   ```json
   {
     "id": "pattern_005",
     "name": "New Pattern Name",
     "category": "category",
     "description": "...",
     "source": "...",
     "confidence": "high",
     "last_updated": "2026-01-11",
     "usage_count": 0
   }
   ```

2. **Add code examples** (create new .md file):
   - Use existing examples as templates
   - Include complete code
   - Explain key patterns
   - Add testing examples
   - Update INDEX.md

3. **Add conventions** (edit `memory/learnings.json`):
   ```json
   {
     "area": "area-name",
     "rule": "Rule description",
     "source": "AGENTS.md",
     "mandatory": true
   }
   ```

---

## 🐛 Troubleshooting

### Script won't run
```bash
# Make sure you're in the right directory
pwd  # Should show: /path/to/n8n/.ai-assistant/scripts

# Check Node.js version
node --version  # Should be 18+

# Try with ts-node if installed
ts-node memory-manager.ts context
```

### "File not found" error
```bash
# Check if files exist
ls ../memory/
ls ../knowledge-base/documentation/

# Run from correct directory
cd .ai-assistant/scripts
```

### No results from search
```bash
# Try broader search terms
node memory-manager.ts search "node"

# List all patterns to see what's available
node memory-manager.ts patterns
```

---

## 📊 Statistics

### memory-manager.ts
- **Lines**: ~500
- **Functions**: 15+
- **Commands**: 7
- **Files accessed**: 7

### index-docs.ts
- **Lines**: ~300
- **Functions**: 5
- **Files indexed**: 9+
- **Output**: JSON index

---

## 🚀 Future Enhancements

### Planned for Phase 2
- [ ] Automatic pattern extraction
- [ ] Vector embedding generation
- [ ] Semantic search integration
- [ ] Relevance ranking
- [ ] Context assembly automation

### Planned for Phase 3
- [ ] Auto-learning from implementations
- [ ] Pattern detection
- [ ] Gotcha detection
- [ ] Success tracking

---

## 📝 Contributing

When adding new scripts:
1. Follow TypeScript best practices
2. Add comprehensive comments
3. Include CLI interface
4. Add to this README
5. Test thoroughly

---

**Last Updated**: 2026-01-11  
**Maintained by**: n8n Specialist AI System  
**Status**: Phase 1 Complete
