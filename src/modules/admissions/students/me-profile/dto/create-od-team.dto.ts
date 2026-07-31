/**
 * Intentionally empty — todo.md/9-POST-me-od-teams.md's own request body is
 * `{}` (no client-insertable fields; created_by_student_id/unique_code/
 * is_locked are all system-resolved or system-generated). Still declared
 * (rather than omitting @Body() entirely) so the global ValidationPipe's
 * `forbidNonWhitelisted: true` hard-rejects any attempt to smuggle those
 * fields in, matching the whitelist guarantee every other endpoint in this
 * module relies on for self-scoping.
 */
export class CreateOdTeamDto {}
