-- CreateTable
CREATE TABLE "Codes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_CODES" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Codes_code_key" ON "Codes"("code");

-- AddForeignKey
ALTER TABLE "Codes" ADD CONSTRAINT "Codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
