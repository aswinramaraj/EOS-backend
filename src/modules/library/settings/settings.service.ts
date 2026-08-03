import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateLibrarySettingsDto } from './dto/update-library-settings.dto';

function toResponse(row: {
  id: number;
  books_per_student: number;
  default_borrowing_days: number;
  max_renewals: number;
  renewal_extension_days: number;
  fine_per_day: unknown;
  lost_book_processing_fee: unknown;
  damaged_book_charge_rate: unknown;
  grace_period_days: number;
  block_issue_above_fine: unknown;
  barcode_format: string | null;
  spine_label_prefix: string | null;
  counter_opens_at: string | null;
  counter_closes_at: string | null;
  updated_at: Date;
}) {
  return {
    id: row.id,
    books_per_student: row.books_per_student,
    default_borrowing_days: row.default_borrowing_days,
    max_renewals: row.max_renewals,
    renewal_extension_days: row.renewal_extension_days,
    fine_per_day: Number(row.fine_per_day),
    lost_book_processing_fee: Number(row.lost_book_processing_fee),
    damaged_book_charge_rate: Number(row.damaged_book_charge_rate),
    grace_period_days: row.grace_period_days,
    block_issue_above_fine: Number(row.block_issue_above_fine),
    barcode_format: row.barcode_format,
    spine_label_prefix: row.spine_label_prefix,
    counter_opens_at: row.counter_opens_at,
    counter_closes_at: row.counter_closes_at,
    updated_at: row.updated_at,
  };
}

@Injectable()
export class LibrarySettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * There is exactly one library-wide config row, ever — created lazily on
   * first read/write with schema defaults, rather than requiring a seed
   * migration.
   */
  private async getOrCreateRow() {
    const existing = await this.prisma.library_settings.findFirst();
    if (existing) return existing;
    return this.prisma.library_settings.create({ data: {} });
  }

  async get() {
    return toResponse(await this.getOrCreateRow());
  }

  async update(dto: UpdateLibrarySettingsDto) {
    const row = await this.getOrCreateRow();
    const updated = await this.prisma.library_settings.update({
      where: { id: row.id },
      data: dto,
    });
    return toResponse(updated);
  }

  /**
   * Typed accessor for other library services (borrow-records) that need
   * the actual business-rule values rather than the API response shape.
   */
  async getRules() {
    const row = await this.getOrCreateRow();
    return {
      booksPerStudent: row.books_per_student,
      defaultBorrowingDays: row.default_borrowing_days,
      maxRenewals: row.max_renewals,
      renewalExtensionDays: row.renewal_extension_days,
      finePerDay: Number(row.fine_per_day),
      lostBookProcessingFee: Number(row.lost_book_processing_fee),
      damagedBookChargeRate: Number(row.damaged_book_charge_rate),
      gracePeriodDays: row.grace_period_days,
      blockIssueAboveFine: Number(row.block_issue_above_fine),
    };
  }
}
