import { z } from 'zod';
import { Z } from 'zod-class';

import { taskPrioritySchema, taskStatusSchema } from '../../schemas/task-manager.schema';

export class ListTasksQueryDto extends Z.class({
	status: taskStatusSchema.optional(),
	priority: taskPrioritySchema.optional(),
	assignedTo: z.string().optional(),
	overdue: z.coerce.boolean().optional(),
	skip: z.coerce.number().min(0).optional(),
	take: z.coerce.number().min(1).max(100).optional(),
}) {}
