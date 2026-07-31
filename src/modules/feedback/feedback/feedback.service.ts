import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ROLES } from '../../../common/constants/roles.constant';
import { paginate } from '../../../common/dto/pagination.dto';
import type { JwtPayload } from '../../../auth/interfaces/jwt-payload.interface';
import {
  feedback_question_type_enum,
  feedback_rating_label_enum,
} from '../../../../generated/prisma/enums';
import { CreateFeedbackFormDto } from './dto/create-feedback-form.dto';
import { UpdateFeedbackFormDto } from './dto/update-feedback-form.dto';
import { CreateFeedbackQuestionDto } from './dto/create-feedback-question.dto';
import { UpdateFeedbackQuestionDto } from './dto/update-feedback-question.dto';
import { ListFeedbackFormsQueryDto } from './dto/list-feedback-forms-query.dto';
import { SubmitFeedbackResponsesDto } from './dto/submit-feedback-responses.dto';

/** Maps a 1-5 rating_value to its fixed label — derived server-side so the two can never disagree. */
const RATING_LABELS: Record<number, feedback_rating_label_enum> = {
  1: feedback_rating_label_enum.need_improvement,
  2: feedback_rating_label_enum.satisfactory,
  3: feedback_rating_label_enum.good,
  4: feedback_rating_label_enum.very_good,
  5: feedback_rating_label_enum.excellent,
};

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  // ───────────────────────────── Academic Coordinator / Admin: form management ─────────────────────────────

  async createForm(user: JwtPayload, dto: CreateFeedbackFormDto) {
    if (dto.class_id) await this.assertClassExists(dto.class_id);
    if (dto.batch_id) await this.assertBatchExists(dto.batch_id);

    return this.prisma.feedback_forms.create({
      data: {
        title: dto.title,
        class_id: dto.class_id,
        batch_id: dto.batch_id,
        created_by_user_id: user.sub,
        feedback_questions: {
          create: dto.questions.map((q, idx) => ({
            question_text: q.question_text,
            sequence_no: q.sequence_no ?? idx + 1,
            question_type: q.question_type,
          })),
        },
      },
      include: { feedback_questions: { orderBy: { sequence_no: 'asc' } } },
    });
  }

  async listForms(dto: ListFeedbackFormsQueryDto) {
    const where: Record<string, unknown> = {};
    if (dto.batch_id) where.batch_id = dto.batch_id;
    if (dto.class_id) where.class_id = dto.class_id;

    const [data, total] = await Promise.all([
      this.prisma.feedback_forms.findMany({
        where,
        skip: dto.skip,
        take: dto.limit,
        orderBy: { created_at: 'desc' },
        include: {
          batches: { select: { id: true, name: true } },
          classes: { select: { id: true, section: true } },
          _count: { select: { feedback_questions: true } },
        },
      }),
      this.prisma.feedback_forms.count({ where }),
    ]);

    return paginate(data, total, dto);
  }

  async getForm(id: number) {
    const form = await this.prisma.feedback_forms.findUnique({
      where: { id },
      include: {
        feedback_questions: { orderBy: { sequence_no: 'asc' } },
        batches: { select: { id: true, name: true } },
        classes: { select: { id: true, section: true } },
      },
    });
    if (!form) throw new NotFoundException(`Feedback form ${id} not found`);
    return form;
  }

  async updateForm(user: JwtPayload, id: number, dto: UpdateFeedbackFormDto) {
    const form = await this.findFormOrThrow(id);
    this.assertOwnerOrAdmin(user, form);

    if (dto.class_id) await this.assertClassExists(dto.class_id);
    if (dto.batch_id) await this.assertBatchExists(dto.batch_id);

    return this.prisma.feedback_forms.update({
      where: { id },
      data: {
        title: dto.title,
        class_id: dto.class_id,
        batch_id: dto.batch_id,
      },
    });
  }

  async deleteForm(user: JwtPayload, id: number) {
    const form = await this.findFormOrThrow(id);
    this.assertOwnerOrAdmin(user, form);

    const responseCount = await this.prisma.feedback_responses.count({
      where: { feedback_questions: { form_id: id } },
    });
    if (responseCount > 0) {
      throw new ConflictException(
        'Cannot delete a form that already has student responses',
      );
    }

    await this.prisma.feedback_forms.delete({ where: { id } });
    return { id };
  }

  async addQuestion(
    user: JwtPayload,
    formId: number,
    dto: CreateFeedbackQuestionDto,
  ) {
    const form = await this.findFormOrThrow(formId);
    this.assertOwnerOrAdmin(user, form);

    const maxSeq = await this.prisma.feedback_questions.aggregate({
      where: { form_id: formId },
      _max: { sequence_no: true },
    });

    return this.prisma.feedback_questions.create({
      data: {
        form_id: formId,
        question_text: dto.question_text,
        sequence_no: dto.sequence_no ?? (maxSeq._max.sequence_no ?? 0) + 1,
        question_type: dto.question_type,
      },
    });
  }

  async updateQuestion(
    user: JwtPayload,
    formId: number,
    questionId: number,
    dto: UpdateFeedbackQuestionDto,
  ) {
    const form = await this.findFormOrThrow(formId);
    this.assertOwnerOrAdmin(user, form);
    const question = await this.findQuestionOrThrow(formId, questionId);

    if (dto.question_type && dto.question_type !== question.question_type) {
      const responseCount = await this.prisma.feedback_responses.count({
        where: { question_id: questionId },
      });
      if (responseCount > 0) {
        throw new ConflictException(
          'Cannot change the type of a question that already has student responses',
        );
      }
    }

    return this.prisma.feedback_questions.update({
      where: { id: questionId },
      data: {
        question_text: dto.question_text,
        sequence_no: dto.sequence_no,
        question_type: dto.question_type,
      },
    });
  }

  async deleteQuestion(user: JwtPayload, formId: number, questionId: number) {
    const form = await this.findFormOrThrow(formId);
    this.assertOwnerOrAdmin(user, form);
    await this.findQuestionOrThrow(formId, questionId);

    const responseCount = await this.prisma.feedback_responses.count({
      where: { question_id: questionId },
    });
    if (responseCount > 0) {
      throw new ConflictException(
        'Cannot delete a question that already has student responses',
      );
    }

    await this.prisma.feedback_questions.delete({ where: { id: questionId } });
    return { id: questionId };
  }

  async getResults(id: number) {
    const form = await this.prisma.feedback_forms.findUnique({
      where: { id },
      include: {
        feedback_questions: {
          orderBy: { sequence_no: 'asc' },
          include: {
            feedback_responses: {
              select: {
                response_text: true,
                rating_value: true,
                rating_label: true,
                submitted_at: true,
              },
            },
          },
        },
      },
    });
    if (!form) throw new NotFoundException(`Feedback form ${id} not found`);

    const targetStudentCount = await this.prisma.students.count({
      where: this.buildTargetStudentsWhere(form.class_id, form.batch_id),
    });

    const respondents = await this.prisma.feedback_responses.findMany({
      where: { feedback_questions: { form_id: id } },
      select: { student_id: true },
      distinct: ['student_id'],
    });

    return {
      form_id: form.id,
      title: form.title,
      target_student_count: targetStudentCount,
      respondent_count: respondents.length,
      // Responses are reported without student identity — feedback is anonymous by design.
      questions: form.feedback_questions.map((q) => {
        const responses = q.feedback_responses;
        const base = {
          id: q.id,
          question_text: q.question_text,
          sequence_no: q.sequence_no,
          question_type: q.question_type,
          response_count: responses.length,
        };

        if (q.question_type === feedback_question_type_enum.rating) {
          const ratings = responses
            .map((r) => r.rating_value)
            .filter((v): v is number => v !== null);
          const averageRating = ratings.length
            ? Math.round(
                (ratings.reduce((sum, v) => sum + v, 0) / ratings.length) * 100,
              ) / 100
            : null;
          const ratingDistribution = Object.fromEntries(
            [1, 2, 3, 4, 5].map((value) => [
              value,
              ratings.filter((v) => v === value).length,
            ]),
          );

          return {
            ...base,
            average_rating: averageRating,
            rating_distribution: ratingDistribution,
          };
        }

        return { ...base, responses: responses.map((r) => r.response_text) };
      }),
    };
  }

  // ───────────────────────────── Student: fill feedback ─────────────────────────────

  async listFormsForStudent(user: JwtPayload) {
    const student = await this.getStudentOrThrow(user.sub);

    const forms = await this.prisma.feedback_forms.findMany({
      where: this.buildFormsTargetingStudentWhere(
        student.class_id,
        student.batch_id,
      ),
      include: { _count: { select: { feedback_questions: true } } },
      orderBy: { created_at: 'desc' },
    });

    return Promise.all(
      forms.map(async (form) => {
        const answered = await this.prisma.feedback_responses.count({
          where: {
            student_id: student.id,
            feedback_questions: { form_id: form.id },
          },
        });
        return {
          id: form.id,
          title: form.title,
          question_count: form._count.feedback_questions,
          completed:
            form._count.feedback_questions > 0 &&
            answered >= form._count.feedback_questions,
        };
      }),
    );
  }

  async getFormForStudent(user: JwtPayload, formId: number) {
    const student = await this.getStudentOrThrow(user.sub);
    const form = await this.prisma.feedback_forms.findUnique({
      where: { id: formId },
      include: { feedback_questions: { orderBy: { sequence_no: 'asc' } } },
    });
    if (!form) throw new NotFoundException(`Feedback form ${formId} not found`);

    if (!this.formTargetsStudent(form, student)) {
      throw new ForbiddenException(
        'This feedback form is not applicable to you',
      );
    }

    const myResponses = await this.prisma.feedback_responses.findMany({
      where: {
        student_id: student.id,
        feedback_questions: { form_id: formId },
      },
      select: {
        question_id: true,
        response_text: true,
        rating_value: true,
        rating_label: true,
      },
    });
    const responseByQuestion = new Map(
      myResponses.map((r) => [r.question_id, r]),
    );

    return {
      id: form.id,
      title: form.title,
      completed: myResponses.length > 0,
      questions: form.feedback_questions.map((q) => {
        const myResponse = responseByQuestion.get(q.id);
        return {
          id: q.id,
          question_text: q.question_text,
          sequence_no: q.sequence_no,
          question_type: q.question_type,
          response_text: myResponse?.response_text ?? null,
          rating_value: myResponse?.rating_value ?? null,
          rating_label: myResponse?.rating_label ?? null,
        };
      }),
    };
  }

  async submitResponses(
    user: JwtPayload,
    formId: number,
    dto: SubmitFeedbackResponsesDto,
  ) {
    const student = await this.getStudentOrThrow(user.sub);
    const form = await this.prisma.feedback_forms.findUnique({
      where: { id: formId },
      include: { feedback_questions: true },
    });
    if (!form) throw new NotFoundException(`Feedback form ${formId} not found`);

    if (!this.formTargetsStudent(form, student)) {
      throw new ForbiddenException(
        'This feedback form is not applicable to you',
      );
    }

    const alreadySubmitted = await this.prisma.feedback_responses.count({
      where: {
        student_id: student.id,
        feedback_questions: { form_id: formId },
      },
    });
    if (alreadySubmitted > 0) {
      throw new ConflictException(
        'You have already submitted feedback for this form',
      );
    }

    const questionsById = new Map(
      form.feedback_questions.map((q) => [q.id, q]),
    );
    const submittedIds = new Set(dto.responses.map((r) => r.question_id));

    for (const questionId of questionsById.keys()) {
      if (!submittedIds.has(questionId)) {
        throw new BadRequestException(
          'A response is required for every question in the form',
        );
      }
    }

    const data = dto.responses.map((r) => {
      const question = questionsById.get(r.question_id);
      if (!question) {
        throw new BadRequestException(
          `Question ${r.question_id} does not belong to this form`,
        );
      }

      if (question.question_type === feedback_question_type_enum.rating) {
        if (r.rating_value == null) {
          throw new BadRequestException(
            `Question ${r.question_id} requires a rating_value between 1 and 5`,
          );
        }
        return {
          question_id: r.question_id,
          student_id: student.id,
          rating_value: r.rating_value,
          rating_label: RATING_LABELS[r.rating_value],
        };
      }

      if (!r.response_text) {
        throw new BadRequestException(
          `Question ${r.question_id} requires response_text`,
        );
      }
      return {
        question_id: r.question_id,
        student_id: student.id,
        response_text: r.response_text,
      };
    });

    await this.prisma.feedback_responses.createMany({ data });

    return { form_id: formId, submitted_questions: data.length };
  }

  // ───────────────────────────── helpers ─────────────────────────────

  private async findFormOrThrow(id: number) {
    const form = await this.prisma.feedback_forms.findUnique({ where: { id } });
    if (!form) throw new NotFoundException(`Feedback form ${id} not found`);
    return form;
  }

  private async findQuestionOrThrow(formId: number, questionId: number) {
    const question = await this.prisma.feedback_questions.findFirst({
      where: { id: questionId, form_id: formId },
    });
    if (!question)
      throw new NotFoundException(
        `Question ${questionId} not found on this form`,
      );
    return question;
  }

  private assertOwnerOrAdmin(
    user: JwtPayload,
    form: { created_by_user_id: number },
  ) {
    if (user.role !== ROLES.ADMIN && form.created_by_user_id !== user.sub) {
      throw new ForbiddenException(
        'Only the form creator or an admin can modify this feedback form',
      );
    }
  }

  private async assertClassExists(classId: number) {
    const exists = await this.prisma.classes.findUnique({
      where: { id: classId },
    });
    if (!exists) throw new NotFoundException(`Class ${classId} not found`);
  }

  private async assertBatchExists(batchId: number) {
    const exists = await this.prisma.batches.findUnique({
      where: { id: batchId },
    });
    if (!exists) throw new NotFoundException(`Batch ${batchId} not found`);
  }

  private async getStudentOrThrow(userId: number) {
    const student = await this.prisma.students.findUnique({
      where: { user_id: userId },
    });
    if (!student)
      throw new NotFoundException(
        'Student profile not found for the current user',
      );
    return student;
  }

  /** Students a form (identified by its own targeting columns) is addressed to. */
  private buildTargetStudentsWhere(
    classId: number | null,
    batchId: number | null,
  ) {
    if (classId) return { class_id: classId };
    if (batchId) return { batch_id: batchId };
    return {};
  }

  /** Forms addressed to a given student's class/batch, or institute-wide forms. */
  private buildFormsTargetingStudentWhere(
    studentClassId: number | null,
    studentBatchId: number,
  ) {
    return {
      OR: [
        ...(studentClassId ? [{ class_id: studentClassId }] : []),
        { AND: [{ class_id: null }, { batch_id: studentBatchId }] },
        { AND: [{ class_id: null }, { batch_id: null }] },
      ],
    };
  }

  private formTargetsStudent(
    form: { class_id: number | null; batch_id: number | null },
    student: { class_id: number | null; batch_id: number },
  ) {
    if (form.class_id) return form.class_id === student.class_id;
    if (form.batch_id) return form.batch_id === student.batch_id;
    return true; // institute-wide form
  }
}
