import type { UserRole } from '@/types'

export const ADMIN_MODULES = [
  'dashboard',
  'products',
  'categories',
  'brands',
  'orders',
  'customers',
  'coupons',
  'reviews',
  'analytics',
  'inventory',
  'media',
  'settings',
  'roles',
] as const

export type AdminModule = (typeof ADMIN_MODULES)[number]

const MANAGER_MODULES: AdminModule[] = [
  'dashboard',
  'products',
  'categories',
  'brands',
  'orders',
  'coupons',
  'reviews',
  'analytics',
  'inventory',
  'media',
]

const EMPLOYEE_MODULES: AdminModule[] = [
  'dashboard',
  'orders',
  'inventory',
  'media',
]

export const ROLE_ADMIN_PERMISSIONS: Record<UserRole, readonly AdminModule[]> = {
  super_admin: ADMIN_MODULES,
  admin: ADMIN_MODULES,
  manager: MANAGER_MODULES,
  employee: EMPLOYEE_MODULES,
  customer: [],
}

export const STAFF_ROLES: UserRole[] = ['super_admin', 'admin', 'manager', 'employee']

export function hasAdminPermission(role: UserRole | null | undefined, module: AdminModule): boolean {
  return role ? ROLE_ADMIN_PERMISSIONS[role].includes(module) : false
}

export function isStaffRole(role: UserRole | null | undefined): boolean {
  return role ? STAFF_ROLES.includes(role) : false
}
