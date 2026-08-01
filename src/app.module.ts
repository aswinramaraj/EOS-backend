import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AcademicCalendarModule } from './modules/academic-structure/academic-calendar/academic-calendar.module';
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
import { InvigilationModule } from './modules/exams/invigilation/invigilation.module';
import { MarksModule } from './modules/exams/marks/marks.module';
import { ResultsModule } from './modules/exams/results/results.module';
import { RevaluationModule } from './modules/exams/revaluation/revaluation.module';
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
import { FeeStructureModule } from './modules/fees-billing/fee-structure/fee-structure.module';
import { GateLedgerModule } from './modules/fees-billing/gate-ledger/gate-ledger.module';
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
import { DemandModule } from './modules/fees-billing/demand/demand.module';
import { EducationLoanDdModule } from './modules/fees-billing/education-loan-dd/education-loan-dd.module';
import { BusesModule } from './modules/fees-billing/buses/buses.module';
import { FeeConcessionModule } from './modules/fees-billing/fee-concessions/fee-concession.module';
import { FeePaymentModule } from './modules/fees-billing/fee-payments/fee-payment.module';
import { FeeStructureItemModule } from './modules/fees-billing/fee-structure-items/fee-structure-item.module';
import { HostelRoomModule } from './modules/fees-billing/hostel-rooms/hostel-room.module';
import { HostelRoomTypeModule } from './modules/fees-billing/hostel-room-types/hostel-room-type.module';
import { QuotaModule } from './modules/fees-billing/quota/quota.module';
import { StudentFeeDemandMappingModule } from './modules/fees-billing/student-fee-demand-mapping/student-fee-demand-mapping.module';
import { TransportRouteModule } from './modules/fees-billing/transport-routes/transport-route.module';
import { TransportStageModule } from './modules/fees-billing/transport-stages/transport-stage.module';
import { PurchaseIndentsModule } from './modules/procurement/purchase-indents/purchase-indents.module';
import { PurchaseOrderProposalsModule } from './modules/procurement/purchase-order-proposals/purchase-order-proposals.module';
import { ServiceIndentsModule } from './modules/procurement/service-indents/service-indents.module';
import { ServiceOrderProposalsModule } from './modules/procurement/service-order-proposals/service-order-proposals.module';
import { VendorQuotationsModule } from './modules/procurement/vendor-quotations/vendor-quotations.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    ScheduleModule.forRoot(),

    AuthModule,
    AcademicCalendarModule,
    BatchesModule,
    CoursesModule,
    ClassesModule,
    DepartmentsModule,
    SubjectsModule,

    BonafideModule,
    CertificatesModule,
    OdModule,
    SoaApplicationsModule,
    StudentLeavesModule,
    StudentsModule,

    AnnouncementsModule,

    ExamsModule,
    ExamTypesModule,
    HallPlansModule,
    InvigilationModule,
    MarksModule,
    ResultsModule,
    RevaluationModule,

    AppraisalModule,
    AttendanceModule,
    FacultyLeavesModule,
    FacultyMappingModule,
    FacultyModule,
    HrPayrollModule,
    LessonPlansModule,
    LmsNotesModule,
    MediaRequestsModule,
    TimetableModule,

    BusesModule,
    DemandModule,
    EducationLoanDdModule,
    FeeConcessionModule,
    FeePaymentModule,
    FeeStructureModule,
    FeeStructureItemModule,
    GateLedgerModule,
    HostelRoomModule,
    HostelRoomTypeModule,
    QuotaModule,
    StudentFeeDemandMappingModule,
    TransportRouteModule,
    TransportStageModule,

    BooksModule,
    BorrowRecordsModule,
    EResourcesModule,

    CompaniesModule,
    DrivesModule,
    StudentProfilesModule,

    GrnModule,
    PurchaseIndentsModule,
    PurchaseOrderProposalsModule,
    PurchaseOrdersModule,
    ServiceIndentsModule,
    ServiceOrderProposalsModule,
    ServiceOrdersModule,
    VendorQuotationsModule,
    VendorsModule,

    VenuesModule,
    NotificationsModule,
    FeedbackModule,
  ],

  controllers: [AppController],

  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}