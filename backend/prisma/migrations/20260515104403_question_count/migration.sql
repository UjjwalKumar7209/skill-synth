-- AlterTable
ALTER TABLE "Interview" ADD COLUMN     "followUpCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "questionCount" INTEGER NOT NULL DEFAULT 0;
