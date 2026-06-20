-- AlterTable
ALTER TABLE "IssueReport" ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "LandlordProfile" ADD COLUMN     "bankAccountName" TEXT,
ADD COLUMN     "bankAccountNumber" TEXT,
ADD COLUMN     "bankName" TEXT;
