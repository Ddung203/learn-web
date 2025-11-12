export const STATUS_CODE = {
  SUCCESS: 0,
};

export const ROLE = {
  ROOT: 'R',
  ADMIN: 'A',
  USER: 'U',
  INTERVIEWER: 'I',
  OTHER: 'O',
} as const;

export type RoleKey = keyof typeof ROLE;
export type RoleValue = (typeof ROLE)[RoleKey];

export const hasPermission = (
  userRole: RoleValue,
  allowedRoles: RoleValue[]
): boolean => {
  return allowedRoles.includes(userRole);
};

export * from './vue-ref';
