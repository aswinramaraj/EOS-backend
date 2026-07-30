import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AcademicCalendarModule } from './modules/academic-structure/academic-calendar/academic-calendar.module';
import { AcademicCalendarEventsModule } from './modules/academic-structure/academic-calendar-events/academic-calendar-events.module';
import { BatchesModule } from './modules/academic-structure/batches/batches.module';
import { CoursesModule } from './modules/academic-structure/courses/courses.module';
import { ClassesModule } from './modules/academic-structure/classes/classes.module';
import { DepartmentsModule } from './modules/academic-structure/departments/departments.module';
import { SubjectsModule } from './modules/academic-structure/subjects/subjects.module';
import { BonafideModule } from './modules/admissions/bonafide/bonafide.module';
import { CertificatesModule } from './modules/admissions/certificates/certificates.module';
import { OdModule } from './modules/admissions/od/od.module';
import { SoaApplicationsModule } from './modules/admissions/soa-applications/soa-applications.module';
import { StudentLeavesModule } from './modules/admissions/student-leaves/student-leaves.module';
import { StudentsModule } from './modules/admissions/students/students.module';
import { AnnouncementsModule } from './modules/announcements/announcements/announcements.module';
import { ExamsModule } from './modules/exams/exams/exams.module';
import { ExamTypesModule } from './modules/exams/exam-types/exam-types.module';
import { HallPlansModule } from './modules/exams/hall-plans/hall-plans.module';
import { SeatingArrangementsModule } from './modules/exams/seating-arrangements/seating-arrangements.module';
import { InvigilationModule } from './modules/exams/invigilation/invigilation.module';
import { MarksModule } from './modules/exams/marks/marks.module';
import { ResultsModule } from './modules/exams/results/results.module';
import { RevaluationModule } from './modules/exams/revaluation/revaluation.module';
import { HallTicketsModule } from './modules/exams/hall-tickets/hall-tickets.module';
import { MarksheetsModule } from './modules/exams/marksheets/marksheets.module';
import { AppraisalModule } from './modules/faculty/appraisal/appraisal.module';
import { AttendanceModule } from './modules/faculty/attendance/attendance.module';
import { FacultyLeavesModule } from './modules/faculty/faculty-leaves/faculty-leaves.module';
import { FacultyMappingModule } from './modules/faculty/faculty-mapping/faculty-mapping.module';
import { FacultyModule } from './modules/faculty/faculty/faculty.module';
import { HrPayrollModule } from './modules/faculty/hr-payroll/hr-payroll.module';
import { LessonPlansModule } from './modules/faculty/lesson-plans/lesson-plans.module';
import { LmsNotesModule } from './modules/faculty/lms-notes/lms-notes.module';
import { MediaRequestsModule } from './modules/faculty/media-requests/media-requests.module';
import { TimetableModule } from './modules/faculty/timetable/timetable.module';
import { BillingModule } from './modules/fees-billing/billing/billing.module';
import { EducationLoanModule } from './modules/fees-billing/education-loan/education-loan.module';
import { FeeStructureModule } from './modules/fees-billing/fee-structure/fee-structure.module';
import { GateLedgerModule } from './modules/fees-billing/gate-ledger/gate-ledger.module';
import { HostelModule } from './modules/fees-billing/hostel/hostel.module';
import { TransportModule } from './modules/fees-billing/transport/transport.module';
import { BooksModule } from './modules/library/books/books.module';
import { BorrowRecordsModule } from './modules/library/borrow-records/borrow-records.module';
import { EResourcesModule } from './modules/library/e-resources/e-resources.module';
import { CompaniesModule } from './modules/placement/companies/companies.module';
import { DrivesModule } from './modules/placement/drives/drives.module';
import { StudentProfilesModule } from './modules/placement/student-profiles/student-profiles.module';
import { GrnModule } from './modules/procurement/grn/grn.module';
import { PurchaseOrdersModule } from './modules/procurement/purchase-orders/purchase-orders.module';
import { ServiceOrdersModule } from './modules/procurement/service-orders/service-orders.module';
import { VendorsModule } from './modules/procurement/vendors/vendors.module';
import { VenuesModule } from './modules/venues/venues/venues.module';
import { NotificationsModule } from './modules/notifications/notifications/notifications.module';
import { FeedbackModule } from './modules/feedback/feedback/feedback.module';

@Module({
  imports: [
    // ── Rate limiting (global) ──────────────────────────────────────────────
    // Default: 100 requests per 60 seconds per IP
    // Login endpoint overrides this to 5 attempts per 60 seconds (see AuthController)
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

    AuthModule, AcademicCalendarModule, AcademicCalendarEventsModule, BatchesModule, CoursesModule, ClassesModule, DepartmentsModule, SubjectsModule, BonafideModule, CertificatesModule, OdModule, SoaApplicationsModule, StudentLeavesModule, StudentsModule, AnnouncementsModule, ExamsModule, ExamTypesModule, HallPlansModule, SeatingArrangementsModule, InvigilationModule, MarksModule, ResultsModule, RevaluationModule,HallTicketsModule, MarksheetsModule, AppraisalModule, AttendanceModule, FacultyLeavesModule, FacultyMappingModule, FacultyModule, HrPayrollModule, LessonPlansModule, LmsNotesModule, MediaRequestsModule, TimetableModule, BillingModule, EducationLoanModule, FeeStructureModule, GateLedgerModule, HostelModule, TransportModule, BooksModule, BorrowRecordsModule, EResourcesModule, CompaniesModule, DrivesModule, StudentProfilesModule, GrnModule, PurchaseOrdersModule, ServiceOrdersModule, VendorsModule, VenuesModule, NotificationsModule, FeedbackModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply ThrottlerGuard to every route globally
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
