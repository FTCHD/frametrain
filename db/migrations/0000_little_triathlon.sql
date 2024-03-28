CREATE TABLE `frame` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT 'This is my Frame, forged on Frametrain.' NOT NULL,
	`template` text NOT NULL,
	`state` text DEFAULT '{}',
	`config` text DEFAULT '{}',
	`draftConfig` text DEFAULT '{}',
	`preview` text DEFAULT 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgMTI0IDEyNCIgZmlsbD0ibm9uZSI+CjxyZWN0IHdpZHRoPSIxMjQiIGhlaWdodD0iMTI0IiByeD0iMjQiIGZpbGw9IiNGOTczMTYiLz4KPHBhdGggZD0iTTE5LjM3NSAzNi43ODE4VjEwMC42MjVDMTkuMzc1IDEwMi44MzQgMjEuMTY1OSAxMDQuNjI1IDIzLjM3NSAxMDQuNjI1SDg3LjIxODFDOTAuNzgxOCAxMDQuNjI1IDkyLjU2NjQgMTAwLjMxNiA5MC4wNDY2IDk3Ljc5NjZMMjYuMjAzNCAzMy45NTM0QzIzLjY4MzYgMzEuNDMzNiAxOS4zNzUgMzMuMjE4MiAxOS4zNzUgMzYuNzgxOFoiIGZpbGw9IndoaXRlIi8+CjxjaXJjbGUgY3g9IjYzLjIxMDkiIGN5PSIzNy41MzkxIiByPSIxOC4xNjQxIiBmaWxsPSJibGFjayIvPgo8cmVjdCBvcGFjaXR5PSIwLjQiIHg9IjgxLjEzMjgiIHk9IjgwLjcxOTgiIHdpZHRoPSIxNy41Njg3IiBoZWlnaHQ9IjE3LjM4NzYiIHJ4PSI0IiB0cmFuc2Zvcm09InJvdGF0ZSgtNDUgODEuMTMyOCA4MC43MTk4KSIgZmlsbD0iI0ZEQkE3NCIvPgo8L3N2Zz4=',
	`currentMonthCalls` integer DEFAULT 0 NOT NULL,
	`createdAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `frame_id_unique` ON `frame` (`id`);