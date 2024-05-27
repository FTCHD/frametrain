DROP TABLE IF EXISTS `frame`;
--> statement-breakpoint
CREATE TABLE `frame` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT 'This is my Frame, forged on Frametrain.' NOT NULL,
	`template` text NOT NULL,
	`state` text DEFAULT '{}',
	`config` text DEFAULT '{}',
	`draftConfig` text DEFAULT '{}',
	`currentMonthCalls` integer DEFAULT 0 NOT NULL,
	`createdAt` integer DEFAULT (unix_epoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unix_epoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `frame_id_unique` ON `frame` (`id`);