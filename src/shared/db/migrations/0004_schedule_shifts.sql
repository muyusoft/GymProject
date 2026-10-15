CREATE TABLE `schedule_shifts` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`target_date` text,
	`updated_at` integer NOT NULL
);
