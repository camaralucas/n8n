import { z } from 'zod';

export const taskStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'cancelled']);
export type TaskStatus = z.infer<typeof taskStatusSchema>;

export const taskPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);
export type TaskPriority = z.infer<typeof taskPrioritySchema>;

export const taskSchema = z
	.object({
		id: z.string().uuid(),
		title: z.string().min(1).max(255),
		description: z.string().nullable(),
		status: taskStatusSchema,
		priority: taskPrioritySchema,
		dueDate: z.coerce.date().nullable(),
		assignedTo: z.string().max(255).nullable(),
		createdAt: z.coerce.date(),
		updatedAt: z.coerce.date(),
		completedAt: z.coerce.date().nullable(),
	})
	.strict();
export type Task = z.infer<typeof taskSchema>;

export const taskSummarySchema = z
	.object({
		total: z.number(),
		byStatus: z.object({
			pending: z.number(),
			in_progress: z.number(),
			completed: z.number(),
			cancelled: z.number(),
		}),
		byPriority: z.object({
			low: z.number(),
			medium: z.number(),
			high: z.number(),
			urgent: z.number(),
		}),
		overdueCount: z.number(),
	})
	.strict();
export type TaskSummary = z.infer<typeof taskSummarySchema>;
