export function allowRoles(...allowed) {
  return (user) => {
    if (!allowed.includes(user.role)) {
      return { error: "Access denied", status: 403 };
    }
    return { user };
  };
}
