import { Service } from '@n8n/di';
import { DataSource, Repository } from '@n8n/typeorm';

import type { TaskPriority, TaskStatus } from './task-manager.entity';
import { Task } from './task-manager.entity';

export interface TaskFilters {
	status?: TaskStatus;
	priority?: TaskPriority;
	assignedTo?: string;
	overdue?: boolean;
}

export interface TaskSummary {
	total: number;
	byStatus: Record<TaskStatus, number>;
	byPriority: Record<TaskPriority, number>;
	overdueCount: number;
}

@Service()
export class TaskManagerRepository extends Repository<Task> {
	constructor(dataSource: DataSource) {
		super(Task, dataSource.manager);
	}

	async findWithFilters(filters: TaskFilters, skip = 0, take = 50): Promise<Task[]> {
		const query = this.createQueryBuilder('task');

		if (filters.status) {
			query.andWhere('task.status = :status', { status: filters.status });
		}

		if (filters.priority) {
			query.andWhere('task.priority = :priority', { priority: filters.priority });
		}

		if (filters.assignedTo) {
			query.andWhere('task.assignedTo = :assignedTo', { assignedTo: filters.assignedTo });
		}

		if (filters.overdue) {
			query.andWhere('task.dueDate < :now', { now: new Date() });
			query.andWhere('task.status != :completed', { completed: 'completed' });
		}

		return await query.skip(skip).take(take).orderBy('task.createdAt', 'DESC').getMany();
	}

	async getSummary(): Promise<TaskSummary> {
		const tasks = await this.find();
		const now = new Date();

		const summary: TaskSummary = {
			total: tasks.length,
			byStatus: {
				pending: 0,
				in_progress: 0,
				completed: 0,
				cancelled: 0,
			},
			byPriority: {
				low: 0,
				medium: 0,
				high: 0,
				urgent: 0,
			},
			overdueCount: 0,
		};

		for (const task of tasks) {
			summary.byStatus[task.status]++;
			summary.byPriority[task.priority]++;

			if (task.dueDate && task.dueDate < now && task.status !== 'completed') {
				summary.overdueCount++;
			}
		}

		return summary;
	}

	async findOverdueTasks(): Promise<Task[]> {
		return await this.createQueryBuilder('task')
			.where('task.dueDate < :now', { now: new Date() })
			.andWhere('task.status != :completed', { completed: 'completed' })
			.andWhere('task.status != :cancelled', { cancelled: 'cancelled' })
			.getMany();
	}
}
