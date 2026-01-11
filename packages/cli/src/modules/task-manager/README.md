# Task Manager Module

A sample n8n backend module demonstrating the complete architecture pattern for building modular features in n8n.

## Overview

The Task Manager module provides a simple task management system with CRUD operations, demonstrating:
- Backend module architecture
- RESTful API endpoints
- Database entities and repositories
- Service layer with business logic
- Configuration management
- Unit testing

## Features

- ✅ Create, read, update, and delete tasks
- ✅ Task status tracking (pending, in_progress, completed, cancelled)
- ✅ Priority levels (low, medium, high, urgent)
- ✅ Due date management
- ✅ Task assignment
- ✅ Summary statistics
- ✅ Filtering and pagination
- ✅ Automatic overdue task detection

## API Endpoints

### GET `/task-manager/summary`
Get task statistics summary.

**Response:**
```json
{
  "total": 10,
  "byStatus": {
    "pending": 3,
    "in_progress": 2,
    "completed": 4,
    "cancelled": 1
  },
  "byPriority": {
    "low": 2,
    "medium": 5,
    "high": 2,
    "urgent": 1
  },
  "overdueCount": 1
}
```

### POST `/task-manager/tasks`
Create a new task.

**Request Body:**
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive docs",
  "priority": "high",
  "dueDate": "2026-12-31T00:00:00Z",
  "assignedTo": "user@example.com"
}
```

### GET `/task-manager/tasks`
List tasks with optional filters.

**Query Parameters:**
- `status` - Filter by status (pending, in_progress, completed, cancelled)
- `priority` - Filter by priority (low, medium, high, urgent)
- `assignedTo` - Filter by assignee
- `overdue` - Filter overdue tasks (true/false)
- `skip` - Pagination offset (default: 0)
- `take` - Number of items (default: 50, max: 100)

### GET `/task-manager/tasks/:id`
Get a specific task by ID.

### PUT `/task-manager/tasks/:id`
Update a task.

**Request Body:**
```json
{
  "title": "Updated title",
  "status": "completed",
  "priority": "urgent"
}
```

### DELETE `/task-manager/tasks/:id`
Delete a task.

## Configuration

Environment variables:

- `N8N_TASK_MANAGER_CHECK_INTERVAL` - How often (in minutes) to check for overdue tasks (default: 15)
- `N8N_TASK_MANAGER_MAX_PAGE_SIZE` - Maximum number of tasks per page (default: 50)

## Module Structure

```
task-manager/
├── __tests__/
│   ├── task-manager.service.test.ts
│   └── task-manager.controller.test.ts
├── task-manager.config.ts          # Configuration
├── task-manager.controller.ts      # REST API endpoints
├── task-manager.entity.ts          # Database model
├── task-manager.module.ts          # Module entrypoint
├── task-manager.repository.ts      # Database access
├── task-manager.service.ts         # Business logic
└── README.md
```

## Running Tests

From the CLI package directory:

```bash
cd packages/cli
pnpm test task-manager
```

## Development Notes

This module demonstrates:

1. **Dependency Injection**: Using `@Service()` decorator and constructor injection
2. **TypeORM**: Entity definitions, repositories, and query builders
3. **REST Controllers**: Using `@RestController()`, `@Get()`, `@Post()`, etc.
4. **Configuration**: Environment variable management with `@Config` and `@Env`
5. **Error Handling**: Using `OperationalError` for expected errors
6. **Testing**: Unit tests with mocked dependencies
7. **Type Safety**: Shared types between frontend and backend via `@n8n/api-types`

## Learning Resources

- [Backend Module Guide](../../../../../scripts/backend-module/backend-module-guide.md)
- [n8n Architecture](../../../../../AGENTS.md)
- [TypeScript Best Practices](../../../../../AGENTS.md#typescript-best-practices)

## License

This is a sample module for demonstration purposes.
