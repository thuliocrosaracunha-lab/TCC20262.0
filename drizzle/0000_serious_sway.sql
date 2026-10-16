CREATE TABLE "categoria" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(80) NOT NULL,
	"tipo" varchar(10) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meta" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario_id" integer NOT NULL,
	"valor_alvo" numeric(12, 2) NOT NULL,
	"data_inicio" date NOT NULL,
	"data_fim" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movimentacao" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario_id" integer NOT NULL,
	"categoria_id" integer NOT NULL,
	"tipo" varchar(10) NOT NULL,
	"valor" numeric(12, 2) NOT NULL,
	"data" date NOT NULL,
	"descricao" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "token_recuperacao_senha" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario_id" integer NOT NULL,
	"token" varchar(255) NOT NULL,
	"expira_em" timestamp NOT NULL,
	"usado" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuario" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" varchar(120) NOT NULL,
	"email" varchar(160) NOT NULL,
	"senha" varchar(255) NOT NULL,
	CONSTRAINT "usuario_nome_unique" UNIQUE("nome"),
	CONSTRAINT "usuario_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "meta" ADD CONSTRAINT "meta_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimentacao" ADD CONSTRAINT "movimentacao_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimentacao" ADD CONSTRAINT "movimentacao_categoria_id_categoria_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categoria"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token_recuperacao_senha" ADD CONSTRAINT "token_recuperacao_senha_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE no action ON UPDATE no action;