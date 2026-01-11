import { Config, Env } from '@n8n/config';

@Config
export class TaskManagerConfig {
	/**
	 * How often in minutes to check for overdue tasks.
	 * @default 15
	 */
	@Env('N8N_TASK_MANAGER_CHECK_INTERVAL')
	checkInterval: number = 15;

	/**
	 * Maximum number of tasks to return per page.
	 * @default 50
	 */
	@Env('N8N_TASK_MANAGER_MAX_PAGE_SIZE')
	maxPageSize: number = 50;
}
