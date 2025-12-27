/**
 * Safely formats a role string by capitalizing the first letter
 * @param role - The role string to format
 * @returns Formatted role string or 'User' if role is undefined/null
 */
export const formatRole = (role?: string | null): string => {
  if (!role) return 'User';
  return role.charAt(0).toUpperCase() + role.slice(1);
};

/**
 * Safely formats a string by capitalizing the first letter
 * @param str - The string to format
 * @returns Formatted string or empty string if str is undefined/null
 */
export const capitalize = (str?: string | null): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

