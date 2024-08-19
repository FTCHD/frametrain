CREATE TABLE `interaction` (
	`id` text PRIMARY KEY NOT NULL,
	`frameId` text NOT NULL,
	`buttonIndex` text NOT NULL,
	`fid` text NOT NULL,
	`castHash` text NOT NULL,
	`castFid` text NOT NULL,
	`inputText` text,
	`state` text,
	`transactionHash` text,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `interaction_id_unique` ON `interaction` (`id`);