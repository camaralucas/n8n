import { Logger } from '@n8n/backend-common';
import { Service } from '@n8n/di';
import { OperationalError } from 'n8n-workflow';

import { TaskManagerConfig } from './task-manager.config';
import type { TaskPriority, TaskStatus } from './task-manager.entity';
import { Task } from './task-manager.entity';
import type { TaskFilters, TaskSummary } from './task-manager.repository';
import { TaskManagerRepository } from './task-manager.repository';

export interface CreateTaskDto {
	title: string;
	description?: string;
	priority?: TaskPriority;
	dueDate?: Date;
	assignedTo?: string;
}

export interface UpdateTaskDto {
	title?: string;
	description?: string;
	status?: TaskStatus;
	priority?: TaskPriority;
	dueDate?: Date;
	assignedTo?: string;
}

@Service()
export class TaskManagerService {
	private intervalId?: NodeJS.Timeout;

	constructor(
		private readonly taskManagerRepository: TaskManagerRepository,
		private readonly logger: Logger,
		private readonly config: TaskManagerConfig,
	) {
		this.logger = this.logger.scoped('task-manager');
	}

	start() {
		this.logger.debug('Starting Task Manager service...');

		// Check for overdue tasks periodically
		this.intervalId = setInterval(
			() => {
				void this.checkOverdueTasks();
			},
			this.config.checkInterval * 60 * 1000,
		);
	}

	async shutdown() {
		this.logger.debug('Shutting down Task Manager service...');

		if (this.intervalId) {
			clearInterval(this.intervalId);
		}
	}

	async createTask(data: CreateTaskDto): Promise<Task> {
		this.logger.debug('Creating new task', { title: data.title });

		const task = this.taskManagerRepository.create({
			title: data.title,
			description: data.description ?? null,
			priority: data.priority ?? 'medium',
			status: 'pending',
			dueDate: data.dueDate ?? null,
			assignedTo: data.assignedTo ?? null,
		});

		return await this.taskManagerRepository.save(task);
	}

	async getTask(id: string): Promise<Task> {
		const task = await this.taskManagerRepository.findOne({ where: { id } });

		if (!task) {
			throw new OperationalError(`Task with id ${id} not found`);
		}

		return task;
	}

	async getTasks(filters: TaskFilters = {}, skip = 0, take = 50): Promise<Task[]> {
		const maxTake = Math.min(take, this.config.maxPageSize);
		return await this.taskManagerRepository.findWithFilters(filters, skip, maxTake);
	}

	async updateTask(id: string, data: UpdateTaskDto): Promise<Task> {
		this.logger.debug('Updating task', { id });

		const task = await this.getTask(id);

		if (data.title !== undefined) task.title = data.title;
		if (data.description !== undefined) task.description = data.description;
		if (data.status !== undefined) {
			task.status = data.status;
			if (data.status === 'completed') {
				task.completedAt = new Date();
			}
		}
		if (data.priority !== undefined) task.priority = data.priority;
		if (data.dueDate !== undefined) task.dueDate = data.dueDate;
		if (data.assignedTo !== undefined) task.assignedTo = data.assignedTo;

		return await this.taskManagerRepository.save(task);
	}

	async deleteTask(id: string): Promise<void> {
		this.logger.debug('Deleting task', { id });

		const task = await this.getTask(id);
		await this.taskManagerRepository.remove(task);
	}

	async getSummary(): Promise<TaskSummary> {
		return await this.taskManagerRepository.getSummary();
	}

	private async checkOverdueTasks(): Promise<void> {
		try {
			const overdueTasks = await this.taskManagerRepository.findOverdueTasks();

			if (overdueTasks.length > 0) {
				this.logger.warn(`Found ${overdueTasks.length} overdue tasks`, {
					taskIds: overdueTasks.map((t) => t.id),
				});
			}
		} catch (error) {
			this.logger.error('Error checking overdue tasks', { error });
		}
	}
}
