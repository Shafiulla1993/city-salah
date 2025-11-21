export function hasMasjidAccess(user, masjidId) {
  return user.masjidAdminFor?.some(
    (id) => id.toString() === masjidId.toString()
  );
}
