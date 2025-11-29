import { Module } from '@nestjs/common'
import { EnrollmentsController } from './enrollments.controller'
import { PrismaService } from '@infrastructure/database/prisma.service'

@Module({
  controllers: [EnrollmentsController],
  providers: [PrismaService],
})
export class EnrollmentsModule {}
