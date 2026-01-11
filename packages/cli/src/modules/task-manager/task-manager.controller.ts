import type { AuthenticatedRequest } from '@n8n/db';
import { Body, Delete, Get, Param, Post, Put, Query, RestController } from '@n8n/decorators';
import type { Response } from 'express';

import type { CreateTaskDto, UpdateTaskDto } from './task-manager.service';
import { TaskManagerService } from './task-manager.service';

interface GetTasksQuery {
	status?: string;
	priority?: string;
	assignedTo?: string;
	overdue?: string;
	skip?: string;
	take?: string;
}

@RestController('/task-manager')
export class TaskManagerController {
	constructor(private readonly taskManagerService: TaskManagerService) {}

	@Get('/summary')
	async getSummary(_req: AuthenticatedRequest, _res: Response) {
		return await this.taskManagerService.getSummary();
	}

	@Post('/tasks')
	async createTask(
		_req: AuthenticatedRequest,
		_res: Response,
		@Body payload: CreateTaskDto,
	) {
		return await this.taskManagerService.createTask(payload);
	}

	@Get('/tasks')
	async getTasks(_req: AuthenticatedRequest, _res: Response, @Query query: GetTasksQuery) {
		const filters = {
			status: query.status as any,
			priority: query.priority as any,
			assignedTo: query.assignedTo,
			overdue: query.overdue === 'true',
		};

		const skip = query.skip ? parseInt(query.skip, 10) : 0;
		const take = query.take ? parseInt(query.take, 10) : 50;

		return await this.taskManagerService.getTasks(filters, skip, take);
	}

	@Get('/tasks/:id')
	async getTask(_req: AuthenticatedRequest, _res: Response, @Param('id') id: string) {
		return await this.taskManagerService.getTask(id);
	}

	@Put('/tasks/:id')
	async updateTask(
		_req: AuthenticatedRequest,
		_res: Response,
		@Param('id') id: string,
		@Body payload: UpdateTaskDto,
	) {
		return await this.taskManagerService.updateTask(id, payload);
	}

	@Delete('/tasks/:id')
	async deleteTask(_req: AuthenticatedRequest, _res: Response, @Param('id') id: string) {
		await this.taskManagerService.deleteTask(id);
		return { success: true };
	}
}
