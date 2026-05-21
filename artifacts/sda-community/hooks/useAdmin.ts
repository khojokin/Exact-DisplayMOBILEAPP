export function useAdmin() {
  return {
    isAdmin: false,
    role: "member",
    email: undefined as string | undefined,
  };
}
