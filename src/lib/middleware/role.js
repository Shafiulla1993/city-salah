export function allowRoles(...allowed) {
  return (user) => {
    if (!user || !allowed.includes(user.role)) {
      return { error: "Forbidden", status: 403 };
    }
    return { ok: true };
  };
}
