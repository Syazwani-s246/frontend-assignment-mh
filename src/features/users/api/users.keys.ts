export const usersKeys = {
  all: ["user"] as const,
  list: (params?: unknown) => [...usersKeys.all, "list", params] as const,
  detail: (id: string) => [...usersKeys.all, "detail", id] as const,
};
