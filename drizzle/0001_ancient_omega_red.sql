CREATE TABLE "financial_wisdom" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(20) NOT NULL,
	"text" text NOT NULL,
	"source" varchar(100) NOT NULL,
	"theme" varchar(50),
	"created_at" timestamp DEFAULT now()
);
