-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('RFID');

-- CreateEnum
CREATE TYPE "CardStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "PermissionStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "Result" AS ENUM ('OK', 'GENERIC_ERROR', 'DENIED', 'TIMEOUT');

-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'DISABLED');

-- CreateTable
CREATE TABLE "AccessCard" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "userId" INTEGER,
    "code" VARCHAR(128) NOT NULL,
    "type" "CardType" NOT NULL DEFAULT 'RFID',
    "status" "CardStatus" NOT NULL DEFAULT 'DISABLED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assignedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AccessCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessPermission" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,
    "status" "PermissionStatus" NOT NULL DEFAULT 'ACTIVE',
    "from" TIMESTAMP(3),
    "to" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AccessPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessRequest" (
    "id" BIGSERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "cardId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessResult" (
    "id" BIGSERIAL NOT NULL,
    "accessRequestId" BIGINT NOT NULL,
    "result" "Result" NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "location" VARCHAR(255),
    "description" TEXT,
    "status" "RoomStatus" NOT NULL DEFAULT 'DISABLED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccessCard_uuid_key" ON "AccessCard"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "AccessCard_code_key" ON "AccessCard"("code");

-- CreateIndex
CREATE INDEX "AccessCard_userId_idx" ON "AccessCard"("userId");

-- CreateIndex
CREATE INDEX "AccessCard_deletedAt_idx" ON "AccessCard"("deletedAt");

-- CreateIndex
CREATE INDEX "AccessCard_createdAt_idx" ON "AccessCard"("createdAt");

-- CreateIndex
CREATE INDEX "AccessCard_status_idx" ON "AccessCard"("status");

-- CreateIndex
CREATE INDEX "AccessPermission_userId_idx" ON "AccessPermission"("userId");

-- CreateIndex
CREATE INDEX "AccessPermission_roomId_idx" ON "AccessPermission"("roomId");

-- CreateIndex
CREATE INDEX "AccessPermission_userId_roomId_idx" ON "AccessPermission"("userId", "roomId");

-- CreateIndex
CREATE INDEX "AccessPermission_deletedAt_idx" ON "AccessPermission"("deletedAt");

-- CreateIndex
CREATE INDEX "AccessPermission_createdAt_idx" ON "AccessPermission"("createdAt");

-- CreateIndex
CREATE INDEX "AccessPermission_status_idx" ON "AccessPermission"("status");

-- CreateIndex
CREATE INDEX "AccessRequest_userId_idx" ON "AccessRequest"("userId");

-- CreateIndex
CREATE INDEX "AccessRequest_cardId_idx" ON "AccessRequest"("cardId");

-- CreateIndex
CREATE INDEX "AccessRequest_roomId_idx" ON "AccessRequest"("roomId");

-- CreateIndex
CREATE INDEX "AccessRequest_requestedAt_idx" ON "AccessRequest"("requestedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AccessResult_accessRequestId_key" ON "AccessResult"("accessRequestId");

-- CreateIndex
CREATE INDEX "AccessResult_completedAt_idx" ON "AccessResult"("completedAt");

-- CreateIndex
CREATE INDEX "AccessResult_result_completedAt_idx" ON "AccessResult"("result", "completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Room_uuid_key" ON "Room"("uuid");

-- CreateIndex
CREATE INDEX "Room_deletedAt_idx" ON "Room"("deletedAt");

-- CreateIndex
CREATE INDEX "Room_createdAt_idx" ON "Room"("createdAt");

-- CreateIndex
CREATE INDEX "Room_deletedAt_status_idx" ON "Room"("deletedAt", "status");

-- AddForeignKey
ALTER TABLE "AccessCard" ADD CONSTRAINT "AccessCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessPermission" ADD CONSTRAINT "AccessPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessPermission" ADD CONSTRAINT "AccessPermission_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessRequest" ADD CONSTRAINT "AccessRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessRequest" ADD CONSTRAINT "AccessRequest_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "AccessCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessRequest" ADD CONSTRAINT "AccessRequest_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessResult" ADD CONSTRAINT "AccessResult_accessRequestId_fkey" FOREIGN KEY ("accessRequestId") REFERENCES "AccessRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
