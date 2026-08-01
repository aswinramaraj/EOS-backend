import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { fee_structure_applies_to_enum } from '../../../../generated/prisma/client';
import { CreateStudentTransportMappingDto } from './dto/create-student-transport-mapping.dto';
import { UpdateStudentTransportMappingDto } from './dto/update-student-transport-mapping.dto';

@Injectable()
export class StudentTransportMappingService {
  private readonly logger = new Logger(StudentTransportMappingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * POST /student-transport-mappings
   *
   * Error cases:
   *  404 STUDENT_NOT_FOUND                    – student_id does not exist
   *  404 TRANSPORT_ROUTE_NOT_FOUND            – route_id does not exist
   *  404 TRANSPORT_STAGE_NOT_FOUND            – boarding_stage_id or destination_stage_id does not exist
   *  404 FEE_STRUCTURE_NOT_FOUND              – fee_structure_id does not exist
   *  409 STUDENT_TRANSPORT_MAPPING_EXISTS     – student already has a transport mapping
   *  422 STAGE_NOT_ON_ROUTE                   – boarding/destination stage does not belong to route_id
   *  422 BOARDING_DESTINATION_STAGE_SAME      – boarding_stage_id equals destination_stage_id
   *  500 INTERNAL_ERROR                       – unexpected failure (DB, etc.)
   */
  async create(dto: CreateStudentTransportMappingDto) {
    await this.assertStudentExists(dto.student_id);
    await this.assertStudentHasNoMapping(dto.student_id);
    await this.assertRouteExists(dto.route_id);

    const boardingStage = await this.assertStageExists(dto.boarding_stage_id);
    const destinationStage = await this.assertStageExists(dto.destination_stage_id);

    this.assertStagesOnRoute(boardingStage, destinationStage, dto.route_id);
    this.assertStagesDiffer(dto.boarding_stage_id, dto.destination_stage_id);

    if (dto.fee_structure_id !== undefined) {
      await this.assertFeeStructureExists(dto.fee_structure_id);
    }

    try {
      return await this.prisma.student_transport_mapping.create({
        data: {
          student_id: dto.student_id,
          route_id: dto.route_id,
          boarding_stage_id: dto.boarding_stage_id,
          destination_stage_id: dto.destination_stage_id,
          fee_structure_id: dto.fee_structure_id,
        },
      });
    } catch (err) {
      this.logger.error('DB error while creating student transport mapping', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * GET /student-transport-mappings
   */
  async findAll() {
    try {
      return await this.prisma.student_transport_mapping.findMany({
        orderBy: { id: 'asc' },
      });
    } catch (err) {
      this.logger.error('DB error while fetching student transport mappings', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * GET /student-transport-mappings/:id
   *
   * Error cases:
   *  404 STUDENT_TRANSPORT_MAPPING_NOT_FOUND – no mapping with the given id
   */
  async findOne(id: number) {
    const mapping = await this.findById(id);

    if (!mapping) {
      throw new NotFoundException({
        message: 'Student transport mapping not found',
        errorCode: 'STUDENT_TRANSPORT_MAPPING_NOT_FOUND',
      });
    }

    return mapping;
  }

  /**
   * PUT/PATCH /student-transport-mappings/:id
   *
   * Error cases:
   *  404 STUDENT_TRANSPORT_MAPPING_NOT_FOUND – no mapping with the given id
   *  404 STUDENT_NOT_FOUND                   – student_id does not exist
   *  404 TRANSPORT_ROUTE_NOT_FOUND           – route_id does not exist
   *  404 TRANSPORT_STAGE_NOT_FOUND           – boarding_stage_id or destination_stage_id does not exist
   *  404 FEE_STRUCTURE_NOT_FOUND             – fee_structure_id does not exist
   *  409 STUDENT_TRANSPORT_MAPPING_EXISTS    – another mapping already exists for the new student_id
   *  422 STAGE_NOT_ON_ROUTE                  – boarding/destination stage does not belong to the effective route_id
   *  422 BOARDING_DESTINATION_STAGE_SAME     – effective boarding_stage_id equals destination_stage_id
   *  500 INTERNAL_ERROR                      – unexpected failure (DB, etc.)
   */
  async update(id: number, dto: UpdateStudentTransportMappingDto) {
    const mapping = await this.findById(id);

    if (!mapping) {
      throw new NotFoundException({
        message: 'Student transport mapping not found',
        errorCode: 'STUDENT_TRANSPORT_MAPPING_NOT_FOUND',
      });
    }

    if (dto.student_id !== undefined) {
      await this.assertStudentExists(dto.student_id);
      await this.assertStudentHasNoMapping(dto.student_id, id);
    }

    if (dto.route_id !== undefined) {
      await this.assertRouteExists(dto.route_id);
    }

    const effectiveRouteId = dto.route_id ?? mapping.route_id;
    const effectiveBoardingStageId = dto.boarding_stage_id ?? mapping.boarding_stage_id;
    const effectiveDestinationStageId = dto.destination_stage_id ?? mapping.destination_stage_id;

    if (dto.boarding_stage_id !== undefined || dto.destination_stage_id !== undefined || dto.route_id !== undefined) {
      const boardingStage = await this.assertStageExists(effectiveBoardingStageId);
      const destinationStage = await this.assertStageExists(effectiveDestinationStageId);

      this.assertStagesOnRoute(boardingStage, destinationStage, effectiveRouteId);
      this.assertStagesDiffer(effectiveBoardingStageId, effectiveDestinationStageId);
    }

    if (dto.fee_structure_id !== undefined && dto.fee_structure_id !== null) {
      await this.assertFeeStructureExists(dto.fee_structure_id);
    }

    try {
      return await this.prisma.student_transport_mapping.update({
        where: { id },
        data: {
          student_id: dto.student_id,
          route_id: dto.route_id,
          boarding_stage_id: dto.boarding_stage_id,
          destination_stage_id: dto.destination_stage_id,
          fee_structure_id: dto.fee_structure_id,
        },
      });
    } catch (err) {
      this.logger.error('DB error while updating student transport mapping', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * DELETE /student-transport-mappings/:id
   *
   * No usage/in-use check is required — no other model in the schema
   * references student_transport_mapping, so this row has no dependents.
   *
   * Error cases:
   *  404 STUDENT_TRANSPORT_MAPPING_NOT_FOUND – no mapping with the given id
   *  500 INTERNAL_ERROR                      – unexpected failure (DB, etc.)
   */
  async remove(id: number) {
    const mapping = await this.findById(id);

    if (!mapping) {
      throw new NotFoundException({
        message: 'Student transport mapping not found',
        errorCode: 'STUDENT_TRANSPORT_MAPPING_NOT_FOUND',
      });
    }

    try {
      return await this.prisma.student_transport_mapping.delete({ where: { id } });
    } catch (err) {
      this.logger.error('DB error while deleting student transport mapping', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * GET /student-transport-mappings/lookup/routes
   */
  async lookupRoutes() {
    try {
      return await this.prisma.transport_routes.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      });
    } catch (err) {
      this.logger.error('DB error while resolving transport routes lookup', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * GET /student-transport-mappings/lookup/stages?route_id=
   */
  async lookupStages(routeId: number) {
    await this.assertRouteExists(routeId);

    try {
      return await this.prisma.transport_stages.findMany({
        where: { route_id: routeId },
        select: { id: true, stage_name: true, sequence_no: true },
        orderBy: { sequence_no: 'asc' },
      });
    } catch (err) {
      this.logger.error('DB error while resolving transport stages lookup', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * GET /student-transport-mappings/lookup/fee-structures
   */
  async lookupFeeStructures() {
    try {
      return await this.prisma.fee_structures.findMany({
        where: { applies_to: fee_structure_applies_to_enum.transport },
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
      existing = await this.prisma.student_transport_mapping.findUnique({
        where: { student_id: studentId },
        select: { id: true },
      });
    } catch (err) {
      this.logger.error('DB error during student transport mapping duplicate check', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }

    if (existing && existing.id !== excludeId) {
      throw new ConflictException({
        message: 'This student already has a transport mapping',
        errorCode: 'STUDENT_TRANSPORT_MAPPING_EXISTS',
      });
    }
  }

  private async assertRouteExists(routeId: number) {
    let route: unknown;

    try {
      route = await this.prisma.transport_routes.findUnique({ where: { id: routeId } });
    } catch (err) {
      this.logger.error('DB error during transport route lookup', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }

    if (!route) {
      throw new NotFoundException({
        message: 'Transport route not found',
        errorCode: 'TRANSPORT_ROUTE_NOT_FOUND',
      });
    }
  }

  private async assertStageExists(stageId: number) {
    let stage: { id: number; route_id: number } | null;

    try {
      stage = await this.prisma.transport_stages.findUnique({
        where: { id: stageId },
        select: { id: true, route_id: true },
      });
    } catch (err) {
      this.logger.error('DB error during transport stage lookup', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }

    if (!stage) {
      throw new NotFoundException({
        message: 'Transport stage not found',
        errorCode: 'TRANSPORT_STAGE_NOT_FOUND',
      });
    }

    return stage;
  }

  private assertStagesOnRoute(
    boardingStage: { route_id: number },
    destinationStage: { route_id: number },
    routeId: number,
  ) {
    if (boardingStage.route_id !== routeId || destinationStage.route_id !== routeId) {
      throw new UnprocessableEntityException({
        message: 'Boarding and destination stages must belong to the selected route',
        errorCode: 'STAGE_NOT_ON_ROUTE',
      });
    }
  }

  private assertStagesDiffer(boardingStageId: number, destinationStageId: number) {
    if (boardingStageId === destinationStageId) {
      throw new UnprocessableEntityException({
        message: 'Boarding stage and destination stage cannot be the same',
        errorCode: 'BOARDING_DESTINATION_STAGE_SAME',
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
      return await this.prisma.student_transport_mapping.findUnique({ where: { id } });
    } catch (err) {
      this.logger.error('DB error during student transport mapping lookup', err);
      throw new InternalServerErrorException({
        message: 'Something went wrong. Please try again.',
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }
}
