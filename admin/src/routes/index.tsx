import { createFileRoute, redirect } from "@tanstack/react-router";
import { store } from "@/lib/store";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: store.getState().authed ? "/admin" : "/login" });
  },
});
