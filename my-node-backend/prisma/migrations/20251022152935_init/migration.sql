-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "country" TEXT,
    "dob" TIMESTAMP(3),
    "allergies" TEXT,
    "diet" TEXT,
    "location" TEXT,
    "pushNotif" BOOLEAN NOT NULL DEFAULT true,
    "promoNotif" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnorrPost" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT,
    "imageUrl" TEXT,
    "imageMimeType" TEXT,
    "hashtags" TEXT,
    "knorrProducts" TEXT,
    "isRecipe" BOOLEAN NOT NULL DEFAULT false,
    "prepTime" TEXT,
    "cookTime" TEXT,
    "servings" TEXT,
    "difficulty" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnorrPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnorrUserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "knorrLevel" INTEGER NOT NULL DEFAULT 1,
    "knorrXP" INTEGER NOT NULL DEFAULT 0,
    "rewardPoints" INTEGER NOT NULL DEFAULT 0,
    "badges" TEXT,
    "followers" TEXT,
    "following" TEXT,
    "likedPosts" TEXT,
    "savedPosts" TEXT,
    "totalPosts" INTEGER NOT NULL DEFAULT 0,
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "totalLikes" INTEGER NOT NULL DEFAULT 0,
    "totalComments" INTEGER NOT NULL DEFAULT 0,
    "totalShares" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnorrUserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShoppingList" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "items" TEXT NOT NULL,

    CONSTRAINT "ShoppingList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FridgeItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "expiryDate" TIMESTAMP(3),
    "zone" TEXT,
    "category" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FridgeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stat" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "data" TEXT NOT NULL,

    CONSTRAINT "Stat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnorrReward" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "KnorrReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserChallenge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challenge" TEXT NOT NULL,

    CONSTRAINT "UserChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "KnorrPost_userId_idx" ON "KnorrPost"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "KnorrUserProfile_userId_key" ON "KnorrUserProfile"("userId");

-- CreateIndex
CREATE INDEX "KnorrUserProfile_userId_idx" ON "KnorrUserProfile"("userId");

-- CreateIndex
CREATE INDEX "Comment_postId_idx" ON "Comment"("postId");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "ShoppingList_userId_idx" ON "ShoppingList"("userId");

-- CreateIndex
CREATE INDEX "FridgeItem_userId_idx" ON "FridgeItem"("userId");

-- CreateIndex
CREATE INDEX "Stat_userId_idx" ON "Stat"("userId");

-- CreateIndex
CREATE INDEX "KnorrReward_userId_idx" ON "KnorrReward"("userId");

-- CreateIndex
CREATE INDEX "UserChallenge_userId_idx" ON "UserChallenge"("userId");

-- AddForeignKey
ALTER TABLE "KnorrPost" ADD CONSTRAINT "KnorrPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnorrUserProfile" ADD CONSTRAINT "KnorrUserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "KnorrPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingList" ADD CONSTRAINT "ShoppingList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FridgeItem" ADD CONSTRAINT "FridgeItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stat" ADD CONSTRAINT "Stat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnorrReward" ADD CONSTRAINT "KnorrReward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChallenge" ADD CONSTRAINT "UserChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
