import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'node:crypto';
import { PrismaService } from 'src/prisma/prisma.service';

// Crockford's Base32 alphabet — excludes I, L, O, U to avoid transcription
// ambiguity when a code is shared verbally or by text between teammates.
const CODE_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const CODE_LENGTH = 6;
const MAX_GENERATION_ATTEMPTS = 5;

function generateUniqueCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)];
  }
  return code;
}

@Injectable()
export class MeOdTeamsService {
  private readonly logger = new Logger(MeOdTeamsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * POST /me/od-teams
   *
   * Self-scoped: created_by_student_id resolved from the JWT, never
   * accepted from the request (the DTO has no properties at all — see
   * dto/create-od-team.dto.ts — so there is nothing for a client to inject;
   * the global ValidationPipe's forbidNonWhitelisted rejects any attempt).
   *
   * The spec (todo.md/9-POST-me-od-teams.md §3, §8, §12) explicitly flags
   * whether the creator is auto-joined into od_team_members as unresolved
   * ("Pending from Backend Implementation"). The Sequence Flow diagram, the
   * DB Operations section's recommended transaction, and the "Future
   * Improvements" note ("likely auto-join") all point the same direction,
   * so this implementation auto-joins the creator as the team's first
   * od_team_members row, atomically with the od_teams insert — a team is
   * never left without its founding member.
   *
   * unique_code is a 6-character code generated server-side with a
   * collision-check retry loop; collisions are never surfaced to the
   * client (per spec §5's explicit note), only ever a 500 if retries are
   * exhausted (astronomically unlikely given the code space).
   *
   * Error cases:
   *  404 STUDENT_NOT_FOUND – authenticated user has no linked student
   *                          record (spec marks this "not applicable" but
   *                          kept for consistency with every sibling
   *                          /me/* endpoint)
   *  500 INTERNAL_ERROR    – unexpected DB failure, or unique_code
   *                          collision retries exhausted
   */
  async createOdTeam(userId: number) {
    const student = await this.prisma.students.findUnique({
      where: { user_id: userId },
      select: { id: true },
    });
    if (!student) {
      throw new NotFoundException({
        message: 'Student profile not found for this account',
        errorCode: 'STUDENT_NOT_FOUND',
      });
    }

    for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt++) {
      const uniqueCode = generateUniqueCode();
      try {
        const team = await this.prisma.$transaction(async (tx) => {
          const createdTeam = await tx.od_teams.create({
            data: {
              created_by_student_id: student.id,
              unique_code: uniqueCode,
              is_locked: false,
            },
          });
          await tx.od_team_members.create({
            data: {
              team_id: createdTeam.id,
              student_id: student.id,
            },
          });
          return createdTeam;
        });

        return {
          id: team.id,
          created_by_student_id: team.created_by_student_id,
          unique_code: team.unique_code,
          is_locked: team.is_locked,
          created_at: team.created_at,
        };
      } catch (err) {
        if (
          this.isUniqueCodeConflict(err) &&
          attempt < MAX_GENERATION_ATTEMPTS
        ) {
          continue;
        }
        this.logger.error(`Failed to create OD team for user ${userId}`, err);
        throw new InternalServerErrorException({
          message: 'Something went wrong. Please try again.',
          errorCode: 'INTERNAL_ERROR',
        });
      }
    }

    // Unreachable: the loop above always returns or throws. Kept only to
    // satisfy TypeScript's control-flow analysis of the for-loop.
    throw new InternalServerErrorException({
      message: 'Something went wrong. Please try again.',
      errorCode: 'INTERNAL_ERROR',
    });
  }

  private isUniqueCodeConflict(err: unknown): boolean {
    return (
      typeof err === 'object' &&
      err !== null &&
      (err as { code?: string }).code === 'P2002'
    );
  }
}
