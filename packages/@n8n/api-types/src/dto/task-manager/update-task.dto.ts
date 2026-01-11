import { z } from 'zod';
import { Z } from 'zod-class';

import { taskPrioritySchema, taskStatusSchema } from '../../schemas/task-manager.schema';

export class UpdateTaskDto extends Z.class({
	title: z.string().min(1).max(255).optional(),
	description: z.string().optional(),
	status: taskStatusSchema.optional(),
	priority: taskPrioritySchema.optional(),
	dueDate: z.coerce.date().optional(),
	assignedTo: z.string().max(255).optional(),
}) {}
