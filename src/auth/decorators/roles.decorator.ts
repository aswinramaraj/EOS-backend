import { SetMetadata } from '@nestjs/common';
import { RoleKey } from 'src/common/constants/roles.constant';

export const ROLES_KEY = 'roles';

/**
 * Declare which roles are allowed to access a route.
 *
 * Usage:
 *   @Roles(ROLES.ADMIN, ROLES.HOD)
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   findAll() { ... }
 */
export const Roles = (...roles: RoleKey[]) => SetMetadata(ROLES_KEY, roles);
