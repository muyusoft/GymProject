CREATE TABLE `body_weights` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`weight` real NOT NULL,
	`unit` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `body_weights_date_unique` ON `body_weights` (`date`);