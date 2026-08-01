import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { fee_structure_applies_to_enum } from '../../../../generated/prisma/client';
import { CreateStudentHostelMappingDto } from './dto/create-student-hostel-mapping.dto';
import { UpdateStudentHostelMappingDto } from './dto/update-student-hostel-mapping.dto';

@Injectable()
export class StudentHostelMappingsService {
  private readonly logger = new Logger(StudentHostelMappingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * POST /student-hostel-mappings
   *
   * allocated_date is never accepted from the client and is omitted from the
   * Prisma create() data object — PostgreSQL populates it via
   * @default(dbgenerated("CURRENT_DATE")), exactly as defined in schema.prisma.
   *
   * Error cases:
   *  404 STUDENT_NOT_FOUND               – student_id does not exist
   *  404 HOSTEL_ROOM_NOT_FOUND           – room_id does not exist
   *  404 FEE_STRUCTURE_NOT_FOUND         – fee_structure_id does not exist
   *  409 STUDENT_HOSTEL_MAPPING_EXISTS   – student already has a hostel mapping
   *  500 INTERNAL_ERROR                  – unexpected failure (DB, etc.)
   */
  async create(dto: CreateStudentHostelMappingDto) {
    await this.assertStudentExists(dto.student_id);
    await this.assertStudentHasNoMapping(dto.student_id);
    await this.assertRoomExists(dto.room_id);

    if (dto.fee_structure_id !== undefined) {
      await this.assertFeeStructureExists(dto.fee_structure_id);
    }

    try {
      return await this.prisma.student_hostel_mapping.create({
        data: {
          student_id: dto.student_id,
          room_id: dto.room_id,
          fee_structure_id: dto.fee_structure_id,
        },
      });
    } catch (err) {
      this.logger.error('DB error while creating student hostel mapping', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * GET /student-hostel-mappings
   */
  async findAll() {
    try {
      return await this.prisma.student_hostel_mapping.findMany({
        orderBy: { id: 'asc' },
      });
    } catch (err) {
      this.logger.error('DB error while fetching student hostel mappings', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * GET /student-hostel-mappings/:id
   *
   * Error cases:
   *  404 STUDENT_HOSTEL_MAPPING_NOT_FOUND – no mapping with the given id
   */
  async findOne(id: number) {
    const mapping = await this.findById(id);

    if (!mapping) {
      throw new NotFoundException({
        message: 'Student hostel mapping not found',
        errorCode: 'STUDENT_HOSTEL_MAPPING_NOT_FOUND',
      });
    }

    return mapping;
  }

  /**
   * PUT/PATCH /student-hostel-mappings/:id
   *
   * allocated_date can never be updated — it is not present in
   * UpdateStudentHostelMappingDto and is never referenced here.
   *
   * Error cases:
   *  404 STUDENT_HOSTEL_MAPPING_NOT_FOUND – no mapping with the given id
   *  404 STUDENT_NOT_FOUND                – student_id does not exist
   *  404 HOSTEL_ROOM_NOT_FOUND            – room_id does not exist
   *  404 FEE_STRUCTURE_NOT_FOUND          – fee_structure_id does not exist
   *  409 STUDENT_HOSTEL_MAPPING_EXISTS    – another mapping already exists for the new student_id
   *  500 INTERNAL_ERROR                   – unexpected failure (DB, etc.)
   */
  async update(id: number, dto: UpdateStudentHostelMappingDto) {
    const mapping = await this.findById(id);

    if (!mapping) {
      throw new NotFoundException({
        message: 'Student hostel mapping not found',
        errorCode: 'STUDENT_HOSTEL_MAPPING_NOT_FOUND',
      });
    }

    if (dto.student_id !== undefined) {
      await this.assertStudentExists(dto.student_id);
      await this.assertStudentHasNoMapping(dto.student_id, id);
    }

    if (dto.room_id !== undefined) {
      await this.assertRoomExists(dto.room_id);
    }

    if (dto.fee_structure_id !== undefined && dto.fee_structure_id !== null) {
      await this.assertFeeStructureExists(dto.fee_structure_id);
    }

    try {
      return await this.prisma.student_hostel_mapping.update({
        where: { id },
        data: {
          student_id: dto.student_id,
          room_id: dto.room_id,
          fee_structure_id: dto.fee_structure_id,
        },
      });
    } catch (err) {
      this.logger.error('DB error while updating student hostel mapping', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * DELETE /student-hostel-mappings/:id
   *
   * No usage/in-use check is required — no other model in the schema
   * references student_hostel_mapping, so this row has no dependents.
   *
   * Error cases:
   *  404 STUDENT_HOSTEL_MAPPING_NOT_FOUND – no mapping with the given id
   *  500 INTERNAL_ERROR                   – unexpected failure (DB, etc.)
   */
  async remove(id: number) {
    const mapping = await this.findById(id);

    if (!mapping) {
      throw new NotFoundException({
        message: 'Student hostel mapping not found',
        errorCode: 'STUDENT_HOSTEL_MAPPING_NOT_FOUND',
      });
    }

    try {
      return await this.prisma.student_hostel_mapping.delete({ where: { id } });
    } catch (err) {
      this.logger.error('DB error while deleting student hostel mapping', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * GET /student-hostel-mappings/lookup/rooms
   */
  async lookupRooms() {
    try {
      return await this.prisma.hostel_rooms.findMany({
        select: { id: true, room_number: true, capacity: true, room_type_id: true },
        orderBy: { room_number: 'asc' },
      });
    } catch (err) {
      this.logger.error('DB error while resolving hostel rooms lookup', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * GET /student-hostel-mappings/lookup/fee-structures
   *
   * Filtered to applies_to = hostel for UI convenience only — this filter is
   * never enforced during create/update.
   */
  async lookupFeeStructures() {
    try {
      return await this.prisma.fee_structures.findMany({
        where: { applies_to: fee_structure_applies_to_enum.hostel },
        select: { id: true, name: true, academic_year: true },
        orderBy: { name: 'asc' },
      });
    } catch (err) {
      this.logger.error('DB error while resolving fee structures lookup', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  private async assertStudentExists(studentId: number) {
    let student: unknown;

    try {
      student = await this.prisma.students.findUnique({ where: { id: studentId } });
    } catch (err) {
      this.logger.error('DB error during student lookup', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }

    if (!student) {
      throw new NotFoundException({
        message: 'Student not found',
        errorCode: 'STUDENT_NOT_FOUND',
      });
    }
  }

  private async assertStudentHasNoMapping(studentId: number, excludeId?: number) {
    let existing: { id: number } | null;

    try {
      existing = await this.prisma.student_hostel_mapping.findUnique({
        where: { student_id: studentId },
        select: { id: true },
      });
    } catch (err) {
      this.logger.error('DB error during student hostel mapping duplicate check', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }

    if (existing && existing.id !== excludeId) {
      throw new ConflictException({
        message: 'This student already has a hostel mapping',
        errorCode: 'STUDENT_HOSTEL_MAPPING_EXISTS',
      });
    }
  }

  private async assertRoomExists(roomId: number) {
    let room: unknown;

    try {
      room = await this.prisma.hostel_rooms.findUnique({ where: { id: roomId } });
    } catch (err) {
      this.logger.error('DB error during hostel room lookup', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }

    if (!room) {
      throw new NotFoundException({
        message: 'Hostel room not found',
        errorCode: 'HOSTEL_ROOM_NOT_FOUND',
      });
    }
  }

  private async assertFeeStructureExists(feeStructureId: number) {
    let feeStructure: unknown;

    try {
      feeStructure = await this.prisma.fee_structures.findUnique({ where: { id: feeStructureId } });
    } catch (err) {
      this.logger.error('DB error during fee structure lookup', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }

    if (!feeStructure) {
      throw new NotFoundException({
        message: 'Fee structure not found',
        errorCode: 'FEE_STRUCTURE_NOT_FOUND',
      });
    }
  }

  private async findById(id: number) {
    try {
      return await this.prisma.student_hostel_mapping.findUnique({ where: { id } });
    } catch (err) {
      this.logger.error('DB error during student hostel mapping lookup', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }
}
