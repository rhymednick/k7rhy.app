import { defineCollection, defineConfig } from "@content-collections/core";

const blog = defineCollection({
  name: "blog",
  directory: "content", // Directory where your blog posts are stored
  include: "blog/**/*.mdx", // Pattern to include MDX files
  schema: (z) => ({
    title: z.string(),
    date: z.string().date(),
    summary: z.string().optional(),
    tags: z.array(z.string()).optional(),
    publish: z.boolean().optional().default(false),
  }),

});

export default defineConfig({
  collections: [blog],
});