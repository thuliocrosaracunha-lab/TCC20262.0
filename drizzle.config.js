import { defineConfig } from "drizzle-kit";
import "dotenv/config"

export default defineConfig({
  out: "./drizzle",
  dialect: "postgresql",
  schema: "./src/db/schema",
  driver: "pglite",
  dbCredentials: {
    url: process.env.DATABASE_URl,
  },

  extensionsFilters: ["postgis"],
  schemaFilter: "public",
  tablesFilter: "*",

  introspect: {
    casing: "camel",
  },

  migrations: {
    table: "__drizzle_migrations__",
    schema: "drizzle",
  },

  entities: {
    roles: {
      provider: '',
      exclude: [],
      include: []
    }
  },

  breakpoints: true,
  verbose: true,
});
