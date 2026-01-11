import { z } from 'zod';
import { Z } from 'zod-class';

import { taskPrioritySchema } from '../../schemas/task-manager.schema';

export class CreateTaskDto extends Z.class({
	title: z.string().min(1).max(255),
	description: z.string().optional(),
	priority: taskPrioritySchema.optional(),
	dueDate: z.coerce.date().optional(),
	assignedTo: z.string().max(255).optional(),
}) {}
