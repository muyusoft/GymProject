CREATE TABLE `exercise_swaps` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`plan_exercise_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`target_weight` real,
	`unit` text NOT NULL,
	`load_type` text NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`plan_exercise_id`) REFERENCES `plan_exercises`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exercise_swaps_slot_idx` ON `exercise_swaps` (`date`,`plan_exercise_id`);