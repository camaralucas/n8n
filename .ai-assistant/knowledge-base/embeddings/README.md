# Vector Embeddings

Este diretório armazena embeddings vetoriais do código e documentação para busca semântica.

## Arquivos

- `index.json`: Índice de todos os embeddings com metadados
- `vectors.db`: SQLite database com embeddings e VSS extension
- `model-info.json`: Informações sobre o modelo de embedding usado

## Modelo

- **Nome**: all-MiniLM-L6-v2
- **Dimensões**: 384
- **Framework**: ONNX Runtime (@xenova/transformers)
- **Tamanho**: ~23MB
- **Performance**: ~500 docs/segundo em CPU moderna

## Estrutura do Índice

```json
{
  "version": "0.1.0",
  "model": "all-MiniLM-L6-v2",
  "total_chunks": 0,
  "indexed_files": [],
  "last_indexed": null,
  "index": []
}
```

## Como Funciona

1. **Chunking**: Código é dividido em chunks semânticos
2. **Embedding**: Cada chunk é transformado em vetor de 384 dimensões
3. **Storage**: Vetores são armazenados no SQLite com VSS
4. **Search**: Queries são transformadas em vetores e comparadas por similaridade

## Status

- [ ] Modelo ONNX baixado
- [ ] SQLite VSS configurado
- [ ] Scripts de indexação criados
- [ ] Documentação indexada
- [ ] Código exemplo indexado

**Próximo**: Implementar scripts de indexação
