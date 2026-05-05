import { createFileRoute } from "@tanstack/react-router";
import { BlogEditor } from "./admin.blog.$id";

export const Route = createFileRoute("/admin/blog/new")({
  head: () => ({ meta: [{ title: "Nuevo artículo | AGENTIKA Admin" }] }),
  component: () => <BlogEditor newPost />,
});
