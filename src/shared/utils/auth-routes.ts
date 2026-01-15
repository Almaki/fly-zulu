import type { UserRole } from '../types'

/**
 * Mapa de roles a sus dashboards específicos (para funcionalidades específicas del rol)
 */
export const ROLE_ROUTES: Record<UserRole, string> = {
  PILOT: '/pilot',
  FA: '/fa',
  OPS: '/ops',
  TRAFICO: '/trafico',
  MANTTO: '/mantto',
  SUPERADMIN: '/admin',
}

/**
 * Ruta principal después del login/registro (Home con cards de navegación)
 */
export const HOME_ROUTE = '/home'

/**
 * Ruta por defecto cuando no se encuentra el rol
 */
export const DEFAULT_DASHBOARD = '/home'

/**
 * Obtiene la ruta del dashboard según el rol del usuario
 * Todos los usuarios van a /home después de login/registro
 * @param role - Rol del usuario
 * @returns URL del dashboard correspondiente
 */
export function getDashboardRoute(role: UserRole | string): string {
  // Todos van a /home ahora, excepto SUPERADMIN que va a admin
  if (role === 'SUPERADMIN') {
    return '/admin'
  }
  return HOME_ROUTE
}

/**
 * Verifica si una ruta es pública (no requiere autenticación)
 * @param pathname - Ruta a verificar
 * @returns true si la ruta es pública
 */
export function isPublicRoute(pathname: string): boolean {
  const publicPaths = ['/login', '/register', '/api/auth/callback']
  return publicPaths.some(path => pathname.startsWith(path))
}

/**
 * Verifica si una ruta es de autenticación (login/register)
 * @param pathname - Ruta a verificar
 * @returns true si es ruta de auth
 */
export function isAuthRoute(pathname: string): boolean {
  return pathname === '/login' || pathname === '/register'
}
