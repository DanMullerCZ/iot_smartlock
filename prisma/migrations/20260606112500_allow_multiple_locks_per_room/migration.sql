-- DropIndex
DROP INDEX "Lock_roomId_key";

-- CreateIndex
CREATE INDEX "Lock_roomId_idx" ON "Lock"("roomId");
