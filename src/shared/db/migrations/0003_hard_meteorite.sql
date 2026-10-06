CREATE TABLE `deleted_rows` (
	`table_name` text NOT NULL,
	`row_id` text NOT NULL,
	`deleted_at` integer NOT NULL,
	PRIMARY KEY(`table_name`, `row_id`)
);
