import { IsInt, IsPositive, Max } from 'class-validator';

// Postgres int4 max — bonafide_reasons.id is a plain Int column. Found
// during a recheck: a value between this and Number.MAX_SAFE_INTEGER
// passes @IsInt/@IsPositive (both are satisfied by any positive JS
// integer) but overflows int4 at the DB layer, and the existence-check
// query wasn't wrapped in a try/catch, so it surfaced as an unhandled
// 500 instead of a clean validation error. Confirmed this exact gap is
// systemic — the same thing happens on GET /me/od-requests/:id and any
// other ParseIntPipe-validated numeric id in this project — but it's
// closed here at the DTO level since that's a clean, well-scoped fix for
// this endpoint's own input surface.
const POSTGRES_INT4_MAX = 2147483647;

/**
 * reason_id arrives as a real JSON number in the request body (unlike
 * query-string params, which are always strings and need @Type(() =>
 * Number)) — the global pipe's transformOptions.enableImplicitConversion
 * is false, so a string "3" is correctly rejected here rather than
 * silently coerced.
 */
export class CreateBonafideRequestDto {
  @IsInt()
  @IsPositive()
  @Max(POSTGRES_INT4_MAX, {
    message: 'reason_id is too large to be a valid id',
  })
  reason_id: number;
}
