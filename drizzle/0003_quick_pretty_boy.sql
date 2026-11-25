ALTER TABLE "token_recuperacao_senha" DROP CONSTRAINT "token_recuperacao_senha_usuario_id_usuario_id_fk";
--> statement-breakpoint
ALTER TABLE "token_recuperacao_senha" ADD CONSTRAINT "token_recuperacao_senha_usuario_id_usuario_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE cascade ON UPDATE no action;