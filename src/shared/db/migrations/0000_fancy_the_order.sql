CREATE TABLE `exercise_muscles` (
	`id` text PRIMARY KEY NOT NULL,
	`exercise_id` text NOT NULL,
	`muscle_group` text NOT NULL,
	`view` text NOT NULL,
	`role` text NOT NULL,
	`basis` text NOT NULL,
	`source_ids` text DEFAULT '[]' NOT NULL,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `exercise_muscles_exercise_idx` ON `exercise_muscles` (`exercise_id`);--> statement-breakpoint
CREATE TABLE `exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`source_id` text,
	`name_es` text NOT NULL,
	`name_en` text NOT NULL,
	`instructions_es` text,
	`instructions_en` text,
	`pattern` text,
	`equipment` text NOT NULL,
	`default_load_type` text NOT NULL,
	`aliases` text DEFAULT '[]' NOT NULL,
	`evidence_level` text,
	`status` text DEFAULT 'claude_draft' NOT NULL,
	`reviewed_by` text,
	`reviewed_at` integer,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sources` (
	`id` text PRIMARY KEY NOT NULL,
	`citation` text NOT NULL,
	`url` text NOT NULL,
	`year` integer,
	`strength` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `plan_days` (
	`id` text PRIMARY KEY NOT NULL,
	`plan_id` text NOT NULL,
	`weekday` integer NOT NULL,
	`name` text NOT NULL,
	`sort_order` integer NOT NULL,
	`default_sets` integer NOT NULL,
	`default_reps` integer NOT NULL,
	`default_rest_sec` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `plan_days_plan_idx` ON `plan_days` (`plan_id`);--> statement-breakpoint
CREATE TABLE `plan_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`plan_day_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`sort_order` integer NOT NULL,
	`sets` integer NOT NULL,
	`reps` integer,
	`seconds` integer,
	`rest_sec` integer NOT NULL,
	`target_weight` real,
	`unit` text NOT NULL,
	`load_type` text NOT NULL,
	`progression_rule` text,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`plan_day_id`) REFERENCES `plan_days`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `plan_exercises_day_idx` ON `plan_exercises` (`plan_day_id`);--> statement-breakpoint
CREATE TABLE `plans` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`repeats_weekly` integer DEFAULT true NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`plan_day_id` text,
	`date` text NOT NULL,
	`started_at` integer NOT NULL,
	`ended_at` integer,
	`origin` text DEFAULT 'app' NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`plan_day_id`) REFERENCES `plan_days`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `set_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`set_index` integer NOT NULL,
	`weight` real,
	`unit` text NOT NULL,
	`load_type` text NOT NULL,
	`reps` integer,
	`seconds` integer,
	`rpe` real,
	`completed` integer DEFAULT false NOT NULL,
	`is_pr` integer DEFAULT false NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `set_logs_session_idx` ON `set_logs` (`session_id`);--> statement-breakpoint
CREATE INDEX `set_logs_exercise_idx` ON `set_logs` (`exercise_id`);--> statement-breakpoint
CREATE TABLE `equipment_increments` (
	`id` text PRIMARY KEY NOT NULL,
	`equipment` text NOT NULL,
	`unit` text NOT NULL,
	`step` real NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
