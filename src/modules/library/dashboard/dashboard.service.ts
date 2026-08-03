import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LibraryDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Aggregate counts for the librarian dashboard's stat tiles. No caching —
   * these are plain COUNT/SUM queries, cheap enough to run on every request
   * at this scale (a college library's row counts, not a public catalogue).
   */
  async summary() {
    const now = new Date();

    const [
      copyTotals,
      totalEbooks,
      activeBorrowings,
      overdueBooks,
      lostBooks,
      damagedBooks,
    ] = await this.prisma.$transaction([
      this.prisma.books.aggregate({
        _sum: { total_copies: true, available_copies: true },
      }),
      this.prisma.e_resources.count(),
      this.prisma.book_borrow_records.count({ where: { status: 'borrowed' } }),
      this.prisma.book_borrow_records.count({
        where: { status: 'borrowed', due_date: { lt: now } },
      }),
      this.prisma.book_borrow_records.count({ where: { status: 'lost' } }),
      this.prisma.book_borrow_records.count({ where: { status: 'damaged' } }),
    ]);

    return {
      total_books: copyTotals._sum.total_copies ?? 0,
      available_books: copyTotals._sum.available_copies ?? 0,
      total_ebooks: totalEbooks,
      active_borrowings: activeBorrowings,
      overdue_books: overdueBooks,
      lost_books: lostBooks,
      damaged_books: damagedBooks,
    };
  }
}
