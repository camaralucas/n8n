import type { ModuleInterface } from '@n8n/decorators';
import { BackendModule, OnShutdown } from '@n8n/decorators';
import { Container } from '@n8n/di';

/**
 * Task Manager Module
 * A sample feature demonstrating n8n backend module architecture
 * with CRUD operations for task management.
 */
@BackendModule({ name: 'task-manager' })
export class TaskManagerModule implements ModuleInterface {
	async init() {
		await import('./task-manager.controller');

		const { TaskManagerService } = await import('./task-manager.service');
		Container.get(TaskManagerService).start();
	}

	@OnShutdown()
	async shutdown() {
		const { TaskManagerService } = await import('./task-manager.service');

		await Container.get(TaskManagerService).shutdown();
	}

	async entities() {
		const { Task } = await import('./task-manager.entity');

		return [Task];
	}
}
