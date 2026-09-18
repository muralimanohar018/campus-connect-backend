-- AlterTable
ALTER TABLE "events" ADD COLUMN     "attendanceQrGeneratedAt" TIMESTAMP(3),
ADD COLUMN     "staffAttendanceQrToken" TEXT,
ADD COLUMN     "studentAttendanceQrToken" TEXT;
