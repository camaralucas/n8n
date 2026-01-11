# Simple Controller Example: TagsController

**Category**: Backend Controllers  
**Complexity**: Intermediate  
**Purpose**: RESTful CRUD controller with dependency injection

## Overview

The TagsController demonstrates:
- `@RestController` decorator for routing
- Dependency injection with constructor
- HTTP method decorators (`@Get`, `@Post`, `@Patch`, `@Delete`)
- Parameter extraction (`@Param`, `@Query`, `@Body`)
- Global scope permissions
- Service layer delegation

## Source File

`packages/cli/src/controllers/tags.controller.ts`

## Complete Code

```typescript
import { CreateOrUpdateTagRequestDto, RetrieveTagQueryDto } from '@n8n/api-types';
import { AuthenticatedRequest } from '@n8n/db';
import {
	Delete,
	Get,
	Patch,
	Post,
	RestController,
	GlobalScope,
	Body,
	Param,
	Query,
} from '@n8n/decorators';
import { Response } from 'express';

import { TagService } from '@/services/tag.service';

@RestController('/tags')
export class TagsController {
	constructor(private readonly tagService: TagService) {}

	@Get('/')
	@GlobalScope('tag:list')
	async getAll(_req: AuthenticatedRequest, _res: Response, @Query query: RetrieveTagQueryDto) {
		return await this.tagService.getAll({ withUsageCount: query.withUsageCount });
	}

	@Post('/')
	@GlobalScope('tag:create')
	async createTag(
		_req: AuthenticatedRequest,
		_res: Response,
		@Body payload: CreateOrUpdateTagRequestDto,
	) {
		const { name } = payload;
		const tag = this.tagService.toEntity({ name });

		return await this.tagService.save(tag, 'create');
	}

	@Patch('/:id')
	@GlobalScope('tag:update')
	async updateTag(
		_req: AuthenticatedRequest,
		_res: Response,
		@Param('id') tagId: string,
		@Body payload: CreateOrUpdateTagRequestDto,
	) {
		const newTag = this.tagService.toEntity({ id: tagId, name: payload.name });

		return await this.tagService.save(newTag, 'update');
	}

	@Delete('/:id')
	@GlobalScope('tag:delete')
	async deleteTag(_req: AuthenticatedRequest, _res: Response, @Param('id') tagId: string) {
		await this.tagService.delete(tagId);
		return true;
	}
}
```

## Key Patterns

### 1. **@RestController Decorator**

```typescript
@RestController('/tags')
export class TagsController {
	// Base path is /tags
	// All routes defined here will be relative to /tags
}
```

- Defines the base path for all routes in this controller
- Automatically registers with Express
- Enables automatic route discovery

### 2. **Dependency Injection**

```typescript
constructor(private readonly tagService: TagService) {}
```

- Services are injected via constructor
- Use `private readonly` for clean code
- No manual instantiation needed
- Framework handles dependency resolution

### 3. **HTTP Method Decorators**

```typescript
@Get('/')              // GET /tags
@Post('/')             // POST /tags
@Patch('/:id')         // PATCH /tags/:id
@Delete('/:id')        // DELETE /tags/:id
```

Available decorators:
- `@Get(path)`
- `@Post(path)`
- `@Put(path)`
- `@Patch(path)`
- `@Delete(path)`

### 4. **Parameter Extraction**

```typescript
async updateTag(
	_req: AuthenticatedRequest,        // Full request (prefixed with _ if unused)
	_res: Response,                    // Full response
	@Param('id') tagId: string,        // Extract :id from URL
	@Body payload: CreateOrUpdateTagRequestDto,  // Extract body and validate
) {
	// tagId is already extracted and typed
	// payload is validated against DTO schema
}
```

**Available extractors:**
```typescript
@Param('name')        // URL parameter
@Query               // Query parameters
@Body                // Request body
```

### 5. **Permission Scopes**

```typescript
@GlobalScope('tag:list')      // Requires 'tag:list' permission
@GlobalScope('tag:create')    // Requires 'tag:create' permission
```

- Enforces role-based access control
- Checked before route handler executes
- Automatically returns 403 if unauthorized

### 6. **Service Layer Delegation**

```typescript
@Get('/')
async getAll(_req: AuthenticatedRequest, _res: Response, @Query query: RetrieveTagQueryDto) {
	// Controller delegates to service
	return await this.tagService.getAll({ withUsageCount: query.withUsageCount });
}
```

**Pattern**: Controller handles HTTP concerns, Service handles business logic

## Complete CRUD Pattern

### CREATE (POST)
```typescript
@Post('/')
@GlobalScope('tag:create')
async create(_req: AuthenticatedRequest, _res: Response, @Body payload: CreateDto) {
	const entity = this.service.toEntity(payload);
	return await this.service.save(entity);
}
```

### READ (GET)
```typescript
@Get('/')
async getAll() {
	return await this.service.getAll();
}

@Get('/:id')
async getById(@Param('id') id: string) {
	return await this.service.getById(id);
}
```

### UPDATE (PATCH/PUT)
```typescript
@Patch('/:id')
@GlobalScope('resource:update')
async update(
	@Param('id') id: string,
	@Body payload: UpdateDto,
) {
	const entity = await this.service.getById(id);
	Object.assign(entity, payload);
	return await this.service.save(entity);
}
```

### DELETE (DELETE)
```typescript
@Delete('/:id')
@GlobalScope('resource:delete')
async delete(@Param('id') id: string) {
	await this.service.delete(id);
	return true;  // Or return deleted entity
}
```

## DTOs (Data Transfer Objects)

### Define in @n8n/api-types

```typescript
// packages/@n8n/api-types/src/dto/tags.ts
import { z } from 'zod';

export const CreateOrUpdateTagRequestDto = z.object({
	name: z.string().min(1).max(24),
});

export type CreateOrUpdateTagRequestDto = z.infer<typeof CreateOrUpdateTagRequestDto>;

export const RetrieveTagQueryDto = z.object({
	withUsageCount: z.boolean().optional(),
});

export type RetrieveTagQueryDto = z.infer<typeof RetrieveTagQueryDto>;
```

### Benefits:
- Type safety at compile time
- Runtime validation
- Automatic 400 error on invalid data
- Shared between frontend and backend

## Error Handling

### Automatic Validation Errors
```typescript
// If DTO validation fails, automatic 400 response:
// {
//   "code": 400,
//   "message": "Validation failed",
//   "errors": [...]
// }
```

### Manual Error Throwing
```typescript
import { OperationalError } from '@n8n/errors';

@Get('/:id')
async getById(@Param('id') id: string) {
	const item = await this.service.getById(id);
	
	if (!item) {
		throw new OperationalError('Tag not found', { httpStatusCode: 404 });
	}
	
	return item;
}
```

## Testing

```typescript
// packages/cli/src/controllers/__tests__/tags.controller.test.ts
import { TagsController } from '../tags.controller';
import { TagService } from '@/services/tag.service';

describe('TagsController', () => {
	let controller: TagsController;
	let tagService: jest.Mocked<TagService>;

	beforeEach(() => {
		tagService = {
			getAll: jest.fn(),
			save: jest.fn(),
			delete: jest.fn(),
			toEntity: jest.fn(),
		} as any;
		
		controller = new TagsController(tagService);
	});

	describe('getAll', () => {
		it('should return all tags', async () => {
			const tags = [{ id: '1', name: 'Test' }];
			tagService.getAll.mockResolvedValue(tags);

			const req = {} as any;
			const res = {} as any;
			const query = { withUsageCount: false };

			const result = await controller.getAll(req, res, query);

			expect(result).toEqual(tags);
			expect(tagService.getAll).toHaveBeenCalledWith({ withUsageCount: false });
		});
	});
});
```

## Best Practices

### 1. **Keep Controllers Thin**
```typescript
// ✅ Good - Delegate to service
@Post('/')
async create(@Body payload: CreateDto) {
	return await this.service.create(payload);
}

// ❌ Bad - Business logic in controller
@Post('/')
async create(@Body payload: CreateDto) {
	const exists = await this.repository.findOne({ name: payload.name });
	if (exists) throw new Error('Already exists');
	const entity = this.repository.create(payload);
	await this.repository.save(entity);
	await this.eventService.emit('created', entity);
	return entity;
}
```

### 2. **Use Proper HTTP Methods**
- `GET` - Read, no side effects
- `POST` - Create new resource
- `PUT` - Replace entire resource
- `PATCH` - Update partial resource
- `DELETE` - Remove resource

### 3. **Return Appropriate Data**
```typescript
@Post('/')
async create(@Body payload: CreateDto) {
	const entity = await this.service.create(payload);
	return entity;  // Return created entity with ID
}

@Delete('/:id')
async delete(@Param('id') id: string) {
	await this.service.delete(id);
	return true;  // Or { success: true }
}
```

### 4. **Use TypeScript Properly**
```typescript
// ✅ Good - Proper types
async getById(@Param('id') id: string): Promise<Tag> {
	return await this.service.getById(id);
}

// ❌ Bad - No types
async getById(@Param('id') id) {
	return await this.service.getById(id);
}
```

## Common Patterns

### Pagination
```typescript
@Get('/')
async getAll(@Query query: PaginationQueryDto) {
	const { page = 1, limit = 10 } = query;
	return await this.service.getAll({ page, limit });
}
```

### Filtering
```typescript
@Get('/')
async getAll(@Query query: FilterQueryDto) {
	return await this.service.getAll(query);
}
```

### File Upload
```typescript
@Post('/upload')
async upload(@Body payload: UploadDto) {
	// File handling logic
}
```

## Key Takeaways

1. **@RestController** defines base path
2. **Constructor injection** for dependencies
3. **HTTP decorators** (`@Get`, `@Post`, etc.) define routes
4. **Parameter decorators** (`@Param`, `@Body`, `@Query`) extract data
5. **@GlobalScope** enforces permissions
6. **Controllers delegate** business logic to services
7. **DTOs provide** type safety and validation
8. **Keep controllers thin** - only HTTP concerns

---

**Complexity**: ⭐⭐ Intermediate  
**Lines of Code**: ~60  
**Key Patterns**: REST, Dependency Injection, CRUD  
**Last Updated**: 2026-01-11  
**Status**: Production-ready pattern
