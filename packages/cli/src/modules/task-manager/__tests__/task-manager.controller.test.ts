import { mock } from 'jest-mock-extended';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '@n8n/db';

import { TaskManagerController } from '../task-manager.controller';
import type { TaskManagerService } from '../task-manager.service';
import { Task } from '../task-manager.entity';

describe('TaskManagerController', () => {
	let controller: TaskManagerController;
	let mockService: jest.Mocked<TaskManagerService>;
	let mockRequest: AuthenticatedRequest;
	let mockResponse: Response;

	beforeEach(() => {
		mockService = mock<TaskManagerService>();
		controller = new TaskManagerController(mockService);
		mockRequest = mock<AuthenticatedRequest>();
		mockResponse = mock<Response>();
	});

	describe('getSummary', () => {
		it('should return task summary', async () => {
			const summary = {
				total: 10,
				byStatus: {
					pending: 3,
					in_progress: 2,
					completed: 4,
					cancelled: 1,
				},
				byPriority: {
					low: 2,
					medium: 5,
					high: 2,
					urgent: 1,
				},
				overdueCount: 1,
			};

			mockService.getSummary.mockResolvedValue(summary);

			const result = await controller.getSummary(mockRequest, mockResponse);

			expect(mockService.getSummary).toHaveBeenCalled();
			expect(result).toEqual(summary);
		});
	});

	describe('createTask', () => {
		it('should create a new task', async () => {
			const taskData = {
				title: 'New Task',
				description: 'Task description',
			};

			const createdTask = new Task();
			createdTask.id = '123';
			createdTask.title = 'New Task';

			mockService.createTask.mockResolvedValue(createdTask);

			const result = await controller.createTask(mockRequest, mockResponse, taskData);

			expect(mockService.createTask).toHaveBeenCalledWith(taskData);
			expect(result.id).toBe('123');
		});
	});

	describe('getTasks', () => {
		it('should get tasks with filters', async () => {
			const tasks = [new Task(), new Task()];
			mockService.getTasks.mockResolvedValue(tasks);

			const query = {
				status: 'pending',
				priority: 'high',
				skip: '0',
				take: '10',
			};

			const result = await controller.getTasks(mockRequest, mockResponse, query);

			expect(mockService.getTasks).toHaveBeenCalledWith(
				{
					status: 'pending',
					priority: 'high',
					assignedTo: undefined,
					overdue: false,
				},
				0,
				10,
			);
			expect(result).toHaveLength(2);
		});

		it('should handle overdue filter', async () => {
			const tasks: Task[] = [];
			mockService.getTasks.mockResolvedValue(tasks);

			const query = {
				overdue: 'true',
			};

			await controller.getTasks(mockRequest, mockResponse, query);

			expect(mockService.getTasks).toHaveBeenCalledWith(
				{
					status: undefined,
					priority: undefined,
					assignedTo: undefined,
					overdue: true,
				},
				0,
				50,
			);
		});
	});

	describe('getTask', () => {
		it('should get a task by id', async () => {
			const task = new Task();
			task.id = '123';
			task.title = 'Test Task';

			mockService.getTask.mockResolvedValue(task);

			const result = await controller.getTask(mockRequest, mockResponse, '123');

			expect(mockService.getTask).toHaveBeenCalledWith('123');
			expect(result.id).toBe('123');
		});
	});

	describe('updateTask', () => {
		it('should update a task', async () => {
			const updateData = {
				title: 'Updated Title',
				status: 'completed' as const,
			};

			const updatedTask = new Task();
			updatedTask.id = '123';
			updatedTask.title = 'Updated Title';
			updatedTask.status = 'completed';

			mockService.updateTask.mockResolvedValue(updatedTask);

			const result = await controller.updateTask(mockRequest, mockResponse, '123', updateData);

			expect(mockService.updateTask).toHaveBeenCalledWith('123', updateData);
			expect(result.title).toBe('Updated Title');
			expect(result.status).toBe('completed');
		});
	});

	describe('deleteTask', () => {
		it('should delete a task', async () => {
			mockService.deleteTask.mockResolvedValue();

			const result = await controller.deleteTask(mockRequest, mockResponse, '123');

			expect(mockService.deleteTask).toHaveBeenCalledWith('123');
			expect(result).toEqual({ success: true });
		});
	});
});
