/**
 * PATCH /hall-ticket-clearance/:id/reject (HoD only).
 *
 * The spec's example body includes a `remarks` field, but
 * hall_ticket_clearance_exceptions has no column to store it — schema.prisma
 * is authoritative, so this is deliberately an empty body DTO rather than
 * silently accepting and discarding a field the client thinks was saved.
 * Add a `remarks` column to the schema first if that needs to persist.
 */
export class RejectClearanceDto {}
