/*
  Warnings:

  - You are about to drop the column `feedback` on the `Interview` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Interview" DROP COLUMN "feedback";

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "technicalScore" INTEGER NOT NULL,
    "communicationScore" INTEGER NOT NULL,
    "problemSolvingScore" INTEGER NOT NULL,
    "strengths" TEXT NOT NULL,
    "weaknesses" TEXT NOT NULL,
    "suggestions" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_interviewId_key" ON "Feedback"("interviewId");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
