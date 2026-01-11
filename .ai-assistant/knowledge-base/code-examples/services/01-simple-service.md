# Simple Service Example: TagService

**Category**: Backend Services  
**Complexity**: Intermediate  
**Purpose**: Business logic service with dependency injection and repository pattern

## Overview

The TagService demonstrates:
- `@Service` decorator for DI container
- Constructor-based dependency injection
- Repository pattern for data access
- Business logic encapsulation
- External hooks integration
- Generic type usage

## Source File

`packages/cli/src/services/tag.service.ts`

## Complete Code

```typescript
import type { TagEntity, ITagWithCountDb } from '@n8n/db';
import { TagRepository } from '@n8n/db';
import { Service } from '@n8n/di';

import { ExternalHooks } from '@/external-hooks';
import { validateEntity } from '@/generic-helpers';

type GetAllResult<T> = T extends { withUsageCount: true } ? ITagWithCountDb[] : TagEntity[];

type Action = 'Create' | 'Update';

@Service()
export class TagService {
	constructor(
		private externalHooks: ExternalHooks,
		private tagRepository: TagRepository,
	) {}

	toEntity(attrs: { name: string; id?: string }) {
		attrs.name = attrs.name.trim();

		return this.tagRepository.create(attrs);
	}

	async save(tag: TagEntity, actionKind: 'create' | 'update') {
		await validateEntity(tag);

		const action = (actionKind[0].toUpperCase() + actionKind.slice(1)) as Action;

		await this.externalHooks.run(`tag.before${action}`, [tag]);

		const savedTag = this.tagRepository.save(tag, { transaction: false });

		await this.externalHooks.run(`tag.after${action}`, [tag]);

		return await savedTag;
	}

	async delete(id: string) {
		await this.externalHooks.run('tag.beforeDelete', [id]);

		const deleteResult = this.tagRepository.delete(id);

		await this.externalHooks.run('tag.afterDelete', [id]);

		return await deleteResult;
	}

	async getAll<T extends { withUsageCount: boolean }>(options?: T): Promise<GetAllResult<T>> {
		if (options?.withUsageCount) {
			const tags = await this.tagRepository
				.createQueryBuilder('tag')
				.select(['tag.id', 'tag.name', 'tag.createdAt', 'tag.updatedAt'])
				.loadRelationCountAndMap('tag.usageCount', 'tag.workflowMappings', 'wm', (qb) =>
					qb.leftJoin('wm.workflows', 'workflow').where('workflow.isArchived = :isArchived', {
						isArchived: false,
					}),
				)
				.getMany();

			return tags as GetAllResult<T>;
		}

		return await (this.tagRepository.find({
			select: ['id', 'name', 'createdAt', 'updatedAt'],
		}) as Promise<GetAllResult<T>>);
	}

	async getById(id: string) {
		return await this.tagRepository.findOneOrFail({
			where: { id },
		});
	}

	/**
	 * Sort tags based on the order of the tag IDs in the request.
	 */
	sortByRequestOrder(tags: TagEntity[], { requestOrder }: { requestOrder: string[] }) {
		const tagMap = tags.reduce<Record<string, TagEntity>>((acc, tag) => {
			acc[tag.id] = tag;
			return acc;
		}, {});

		return requestOrder.map((tagId) => tagMap[tagId]);
	}
}
```

## Key Patterns

### 1. **@Service Decorator**

```typescript
@Service()
export class TagService {
	// Registered in DI container
	// Can be injected into controllers and other services
}
```

- Marks class for dependency injection
- Singleton by default
- Automatically discovered and registered

### 2. **Dependency Injection**

```typescript
constructor(
	private externalHooks: ExternalHooks,
	private tagRepository: TagRepository,
) {}
```

**Best practices:**
- Use `private` or `private readonly` for dependencies
- Don't use `public` unless necessary
- Don't instantiate dependencies manually
- Let the DI container handle lifecycle

### 3. **Repository Pattern**

```typescript
// ✅ Good - Use repository methods
await this.tagRepository.find({ where: { id } });
await this.tagRepository.save(entity);
await this.tagRepository.delete(id);

// ❌ Bad - Direct database queries
await this.connection.query('SELECT * FROM tags');
```

### 4. **External Hooks (Event-Driven)**

```typescript
async save(tag: TagEntity, actionKind: 'create' | 'update') {
	// Before hook - can modify or validate
	await this.externalHooks.run(`tag.before${action}`, [tag]);

	// Main operation
	const savedTag = this.tagRepository.save(tag, { transaction: false });

	// After hook - can trigger side effects
	await this.externalHooks.run(`tag.after${action}`, [tag]);

	return await savedTag;
}
```

**Benefits:**
- Decoupled architecture
- Extensibility without modifying core code
- Audit logging
- Integration with external systems

### 5. **Generic Types for Conditional Returns**

```typescript
type GetAllResult<T> = T extends { withUsageCount: true } 
	? ITagWithCountDb[]      // Return with count
	: TagEntity[];           // Return without count

async getAll<T extends { withUsageCount: boolean }>(
	options?: T
): Promise<GetAllResult<T>> {
	if (options?.withUsageCount) {
		// Return tags with usage count
		return tags as GetAllResult<T>;
	}
	// Return simple tags
	return await this.tagRepository.find() as Promise<GetAllResult<T>>;
}
```

### 6. **Entity Transformation**

```typescript
toEntity(attrs: { name: string; id?: string }) {
	// Normalize data
	attrs.name = attrs.name.trim();

	// Use repository to create entity instance
	return this.tagRepository.create(attrs);
}
```

## Service Layers

### Typical Service Structure

```
Controller
    ↓
  Service (Business Logic)
    ↓
  Repository (Data Access)
    ↓
  Database
```

### Responsibility Separation

```typescript
// Controller - HTTP concerns
@Post('/')
async create(@Body payload: CreateDto) {
	return await this.service.create(payload);
}

// Service - Business logic
async create(data: CreateDto) {
	// Validate business rules
	await this.validateUniqueName(data.name);
	
	// Transform data
	const entity = this.toEntity(data);
	
	// Save to database
	const saved = await this.repository.save(entity);
	
	// Trigger events
	await this.eventService.emit('created', saved);
	
	return saved;
}

// Repository - Data access
async save(entity: TagEntity) {
	return await this.repository.save(entity);
}
```

## Common Service Patterns

### 1. **CRUD Operations**

```typescript
@Service()
export class ExampleService {
	constructor(private repository: ExampleRepository) {}

	async create(data: CreateDto) {
		const entity = this.repository.create(data);
		return await this.repository.save(entity);
	}

	async getAll() {
		return await this.repository.find();
	}

	async getById(id: string) {
		return await this.repository.findOneOrFail({ where: { id } });
	}

	async update(id: string, data: UpdateDto) {
		const entity = await this.getById(id);
		Object.assign(entity, data);
		return await this.repository.save(entity);
	}

	async delete(id: string) {
		return await this.repository.delete(id);
	}
}
```

### 2. **Validation**

```typescript
async save(tag: TagEntity, actionKind: 'create' | 'update') {
	// Entity validation (TypeORM decorators)
	await validateEntity(tag);
	
	// Business rules validation
	if (actionKind === 'create') {
		const exists = await this.repository.findOne({ where: { name: tag.name } });
		if (exists) {
			throw new OperationalError('Tag with this name already exists');
		}
	}
	
	return await this.repository.save(tag);
}
```

### 3. **Complex Queries**

```typescript
async getAll<T extends { withUsageCount: boolean }>(options?: T) {
	if (options?.withUsageCount) {
		// Complex query with relations and counts
		return await this.repository
			.createQueryBuilder('tag')
			.select(['tag.id', 'tag.name'])
			.loadRelationCountAndMap('tag.usageCount', 'tag.workflowMappings')
			.getMany();
	}
	
	// Simple query
	return await this.repository.find();
}
```

### 4. **Transaction Handling**

```typescript
async transferOwnership(fromUserId: string, toUserId: string) {
	return await this.connection.transaction(async (manager) => {
		const workflows = await manager.find(Workflow, { where: { ownerId: fromUserId } });
		
		for (const workflow of workflows) {
			workflow.ownerId = toUserId;
			await manager.save(workflow);
		}
		
		return workflows.length;
	});
}
```

### 5. **Utility Methods**

```typescript
sortByRequestOrder(tags: TagEntity[], { requestOrder }: { requestOrder: string[] }) {
	const tagMap = tags.reduce<Record<string, TagEntity>>((acc, tag) => {
		acc[tag.id] = tag;
		return acc;
	}, {});

	return requestOrder.map((tagId) => tagMap[tagId]);
}
```

## Error Handling

### Use Appropriate Error Classes

```typescript
import { OperationalError, UnexpectedError } from '@n8n/errors';

async getById(id: string) {
	const tag = await this.repository.findOne({ where: { id } });
	
	if (!tag) {
		// Expected error - user's fault
		throw new OperationalError(`Tag with ID ${id} not found`, {
			httpStatusCode: 404,
		});
	}
	
	return tag;
}

async complexOperation() {
	try {
		// Complex logic
	} catch (error) {
		// Unexpected error - system fault
		throw new UnexpectedError('Failed to process tags', { cause: error });
	}
}
```

## Testing

```typescript
// packages/cli/src/services/__tests__/tag.service.test.ts
import { TagService } from '../tag.service';
import { TagRepository } from '@n8n/db';
import { ExternalHooks } from '@/external-hooks';

describe('TagService', () => {
	let service: TagService;
	let repository: jest.Mocked<TagRepository>;
	let externalHooks: jest.Mocked<ExternalHooks>;

	beforeEach(() => {
		repository = {
			create: jest.fn(),
			save: jest.fn(),
			find: jest.fn(),
			findOne: jest.fn(),
			delete: jest.fn(),
		} as any;

		externalHooks = {
			run: jest.fn(),
		} as any;

		service = new TagService(externalHooks, repository);
	});

	describe('toEntity', () => {
		it('should trim name and create entity', () => {
			const attrs = { name: '  test  ' };
			repository.create.mockReturnValue({ name: 'test' } as any);

			const result = service.toEntity(attrs);

			expect(attrs.name).toBe('test');
			expect(repository.create).toHaveBeenCalledWith(attrs);
		});
	});

	describe('save', () => {
		it('should call before and after hooks', async () => {
			const tag = { name: 'test' } as any;
			repository.save.mockResolvedValue(tag);

			await service.save(tag, 'create');

			expect(externalHooks.run).toHaveBeenCalledWith('tag.beforeCreate', [tag]);
			expect(externalHooks.run).toHaveBeenCalledWith('tag.afterCreate', [tag]);
		});
	});
});
```

## Best Practices

### 1. **Single Responsibility**
```typescript
// ✅ Good - Service does one thing well
@Service()
export class TagService {
	// Only tag-related operations
}

// ❌ Bad - Service does too much
@Service()
export class MegaService {
	// Tags, workflows, users, credentials...
}
```

### 2. **Dependency Injection**
```typescript
// ✅ Good - Inject dependencies
constructor(private repository: TagRepository) {}

// ❌ Bad - Create dependencies
constructor() {
	this.repository = new TagRepository();  // ❌ Don't do this
}
```

### 3. **Async/Await**
```typescript
// ✅ Good - Use async/await
async save(tag: TagEntity) {
	return await this.repository.save(tag);
}

// ❌ Bad - Promise chains
save(tag: TagEntity) {
	return this.repository.save(tag).then(result => result);
}
```

### 4. **Error Context**
```typescript
// ✅ Good - Provide context
throw new OperationalError(`Tag "${name}" already exists`, {
	suggestion: 'Try a different name',
});

// ❌ Bad - Generic error
throw new Error('Tag exists');
```

## Key Takeaways

1. **@Service** decorator registers class in DI container
2. **Constructor injection** for dependencies
3. **Repository pattern** for data access
4. **External hooks** for event-driven architecture
5. **Business logic** stays in service layer
6. **Keep services focused** on single responsibility
7. **Use proper error types** (OperationalError, UnexpectedError)
8. **Test services** in isolation with mocks

---

**Complexity**: ⭐⭐ Intermediate  
**Lines of Code**: ~86  
**Key Patterns**: DI, Repository, Event-Driven  
**Last Updated**: 2026-01-11  
**Status**: Production-ready pattern
