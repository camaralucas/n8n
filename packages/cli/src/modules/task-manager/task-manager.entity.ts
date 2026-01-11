import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from '@n8n/typeorm';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

@Entity()
export class Task extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ type: 'varchar', length: 255 })
	title: string;

	@Column({ type: 'text', nullable: true })
	description: string | null;

	@Column({ type: 'varchar', length: 50, default: 'pending' })
	status: TaskStatus;

	@Column({ type: 'varchar', length: 50, default: 'medium' })
	priority: TaskPriority;

	@Column({ type: 'timestamp', nullable: true })
	dueDate: Date | null;

	@Column({ type: 'varchar', length: 255, nullable: true })
	assignedTo: string | null;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@Column({ type: 'timestamp', nullable: true })
	completedAt: Date | null;
}
