import { mock } from 'jest-mock-extended';
import type { Logger } from '@n8n/backend-common';

import type { TaskManagerRepository } from '../task-manager.repository';
import { TaskManagerService } from '../task-manager.service';
import { TaskManagerConfig } from '../task-manager.config';
import { Task } from '../task-manager.entity';

describe('TaskManagerService', () => {
	let service: TaskManagerService;
	let mockRepository: jest.Mocked<TaskManagerRepository>;
	let mockConfig: TaskManagerConfig;
	let mockLogger: jest.Mocked<Logger>;

	beforeEach(() => {
		mockRepository = mock<TaskManagerRepository>();
		mockConfig = new TaskManagerConfig();
		mockConfig.checkInterval = 15;
		mockConfig.maxPageSize = 50;

		// Mock logger with scoped method
		mockLogger = mock<Logger>();
		mockLogger.scoped.mockReturnValue(mockLogger);

		service = new TaskManagerService(mockRepository, mockLogger, mockConfig);
	});

	afterEach(async () => {
		await service.shutdown();
	});

	describe('createTask', () => {
		it('should create a task with default values', async () => {
			const taskData = {
				title: 'Test Task',
			};

			const expectedTask = new Task();
			expectedTask.id = '123';
			expectedTask.title = 'Test Task';
			expectedTask.status = 'pending';
			expectedTask.priority = 'medium';

			mockRepository.create.mockReturnValue(expectedTask);
			mockRepository.save.mockResolvedValue(expectedTask);

			const result = await service.createTask(taskData);

			expect(mockRepository.create).toHaveBeenCalledWith({
				title: 'Test Task',
				description: null,
				priority: 'medium',
				status: 'pending',
				dueDate: null,
				assignedTo: null,
			});
			expect(mockRepository.save).toHaveBeenCalledWith(expectedTask);
			expect(result.title).toBe('Test Task');
			expect(result.status).toBe('pending');
		});

		it('should create a task with custom values', async () => {
			const dueDate = new Date('2026-12-31');
			const taskData = {
				title: 'Important Task',
				description: 'This is important',
				priority: 'high' as const,
				dueDate,
				assignedTo: 'user@example.com',
			};

			const expectedTask = new Task();
			expectedTask.id = '456';
			expectedTask.title = 'Important Task';
			expectedTask.description = 'This is important';
			expectedTask.status = 'pending';
			expectedTask.priority = 'high';
			expectedTask.dueDate = dueDate;
			expectedTask.assignedTo = 'user@example.com';

			mockRepository.create.mockReturnValue(expectedTask);
			mockRepository.save.mockResolvedValue(expectedTask);

			const result = await service.createTask(taskData);

			expect(result.title).toBe('Important Task');
			expect(result.priority).toBe('high');
			expect(result.assignedTo).toBe('user@example.com');
		});
	});

	describe('getTask', () => {
		it('should return a task by id', async () => {
			const task = new Task();
			task.id = '123';
			task.title = 'Test Task';

			mockRepository.findOne.mockResolvedValue(task);

			const result = await service.getTask('123');

			expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '123' } });
			expect(result.id).toBe('123');
		});

		it('should throw error if task not found', async () => {
			mockRepository.findOne.mockResolvedValue(null);

			await expect(service.getTask('nonexistent')).rejects.toThrow(
				'Task with id nonexistent not found',
			);
		});
	});

	describe('updateTask', () => {
		it('should update task status and set completedAt when completed', async () => {
			const task = new Task();
			task.id = '123';
			task.title = 'Test Task';
			task.status = 'in_progress';
			task.completedAt = null;

			mockRepository.findOne.mockResolvedValue(task);
			mockRepository.save.mockResolvedValue(task);

			const result = await service.updateTask('123', { status: 'completed' });

			expect(result.status).toBe('completed');
			expect(result.completedAt).toBeInstanceOf(Date);
		});

		it('should update multiple fields', async () => {
			const task = new Task();
			task.id = '123';
			task.title = 'Old Title';
			task.priority = 'low';

			mockRepository.findOne.mockResolvedValue(task);
			mockRepository.save.mockResolvedValue(task);

			const result = await service.updateTask('123', {
				title: 'New Title',
				priority: 'urgent',
			});

			expect(result.title).toBe('New Title');
			expect(result.priority).toBe('urgent');
		});
	});

	describe('deleteTask', () => {
		it('should delete a task', async () => {
			const task = new Task();
			task.id = '123';

			mockRepository.findOne.mockResolvedValue(task);
			mockRepository.remove.mockResolvedValue(task);

			await service.deleteTask('123');

			expect(mockRepository.remove).toHaveBeenCalledWith(task);
		});
	});

	describe('getTasks', () => {
		it('should get tasks with filters', async () => {
			const tasks = [new Task(), new Task()];
			mockRepository.findWithFilters.mockResolvedValue(tasks);

			const result = await service.getTasks({ status: 'pending' }, 0, 10);

			expect(mockRepository.findWithFilters).toHaveBeenCalledWith({ status: 'pending' }, 0, 10);
			expect(result).toHaveLength(2);
		});

		it('should limit page size to maxPageSize', async () => {
			const tasks: Task[] = [];
			mockRepository.findWithFilters.mockResolvedValue(tasks);

			await service.getTasks({}, 0, 1000);

			expect(mockRepository.findWithFilters).toHaveBeenCalledWith({}, 0, 50);
		});
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

			mockRepository.getSummary.mockResolvedValue(summary);

			const result = await service.getSummary();

			expect(result.total).toBe(10);
			expect(result.overdueCount).toBe(1);
		});
	});
});
