import { Injectable, NotFoundException } from "@nestjs/common";
import { AppointmentStatus } from "@smart-rental/database";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateAppointmentStatusDto } from "./dto/update-appointment-status.dto";

@Injectable()
export class ViewingAppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getForLandlord(landlordUserId: string) {
    const landlord = await this.prisma.landlordProfile.findUnique({
      where: { userId: landlordUserId },
    });
    if (!landlord) {
      throw new NotFoundException("Landlord profile not found");
    }

    return this.prisma.viewingAppointment.findMany({
      where: {
        room: {
          property: {
            landlordId: landlord.id,
          },
        },
      },
      include: {
        seeker: {
          select: { id: true, fullName: true, email: true, phone: true }
        },
        room: {
          select: { id: true, name: true, property: { select: { id: true, name: true } } }
        }
      },
      orderBy: { scheduledAt: 'desc' }
    });
  }

  async updateStatus(landlordUserId: string, appointmentId: string, dto: UpdateAppointmentStatusDto) {
    const landlord = await this.prisma.landlordProfile.findUnique({
      where: { userId: landlordUserId },
    });
    if (!landlord) {
      throw new NotFoundException("Landlord profile not found");
    }

    const appointment = await this.prisma.viewingAppointment.findFirst({
      where: {
        id: appointmentId,
        room: {
          property: {
            landlordId: landlord.id,
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException("Appointment not found or you do not have permission to modify it");
    }

    return this.prisma.viewingAppointment.update({
      where: { id: appointmentId },
      data: { status: dto.status },
      include: {
        seeker: {
          select: { id: true, fullName: true, email: true, phone: true }
        },
        room: {
          select: { id: true, name: true }
        }
      }
    });
  }
}
