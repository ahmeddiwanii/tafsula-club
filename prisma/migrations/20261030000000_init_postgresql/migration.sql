-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "question_type" AS ENUM ('AGREEMENT_SCALE', 'MULTIPLE_CHOICE');

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('SUPERADMIN', 'HR', 'MEMBER', 'REGULAR_USER');

-- CreateEnum
CREATE TYPE "member_status" AS ENUM ('TEST_PENDING', 'AWAITING_HR', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "result_dominantType" AS ENUM ('D', 'I', 'S', 'C');

-- CreateEnum
CREATE TYPE "taskStatus" AS ENUM ('PENDING', 'ACTIVE', 'FINALIZED');

-- CreateTable
CREATE TABLE "answer" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "agreementLevel" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insight" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "insight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question" (
    "id" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "type" "question_type" NOT NULL DEFAULT 'AGREEMENT_SCALE',
    "discMapping" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "result" (
    "id" TEXT NOT NULL,
    "dScore" DOUBLE PRECISION NOT NULL,
    "iScore" DOUBLE PRECISION NOT NULL,
    "sScore" DOUBLE PRECISION NOT NULL,
    "cScore" DOUBLE PRECISION NOT NULL,
    "dominantType" "result_dominantType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "modulesJson" JSONB,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'REGULAR_USER',
    "avatarId" INTEGER NOT NULL DEFAULT 0,
    "memberStatus" "member_status" NOT NULL DEFAULT 'ACCEPTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,
    "invitedById" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile" (
    "userId" TEXT NOT NULL,
    "headline" TEXT,
    "bio" TEXT,
    "location" TEXT,
    "roleTitle" TEXT,
    "experienceJson" JSONB,
    "skillsJson" JSONB,
    "personalitySnapshotJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "certificate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issuer" TEXT,
    "issuedAt" TIMESTAMP(3),
    "fileUrl" TEXT,
    "fileKey" TEXT,
    "skillsJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userSkill" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "level" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "userSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "purpose" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "visibility" TEXT NOT NULL DEFAULT 'ORG',
    "leadIdsJson" JSONB,
    "createdById" TEXT NOT NULL,
    "eventId" TEXT,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleInTeam" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACCEPTED',
    "invitationMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'internal',
    "status" TEXT NOT NULL DEFAULT 'idea',
    "visibility" TEXT NOT NULL DEFAULT 'ORG',
    "timelineStart" TIMESTAMP(3),
    "timelineEnd" TIMESTAMP(3),
    "objectivesJson" JSONB,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'todo',
    "taskStatus" "taskStatus" NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "dueDate" TIMESTAMP(3),
    "assigneeId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teamTask" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "taskStatus" "taskStatus" NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "createdById" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "hrDocumentName" TEXT,
    "hrDocumentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teamTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teamTaskComment" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teamTaskComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teamTaskAssignment" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "teamMemberId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
    "submittedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "acceptanceStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "memberDocumentName" TEXT,
    "memberDocumentUrl" TEXT,
    "approvalComment" TEXT,
    "approvedAt" TIMESTAMP(3),
    "creditsAwarded" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teamTaskAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberCredit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "totalCredits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creditsJson" JSONB,
    "tasksCompleted" INTEGER NOT NULL DEFAULT 0,
    "tasksApproved" INTEGER NOT NULL DEFAULT 0,
    "tasksRejected" INTEGER NOT NULL DEFAULT 0,
    "approvalRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "achievementBadges" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memberCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "visibility" TEXT NOT NULL DEFAULT 'ORG',
    "submittedById" TEXT NOT NULL,
    "reviewerId" TEXT,
    "canvasJson" JSONB NOT NULL,
    "swotJson" JSONB,
    "timelineStart" TIMESTAMP(3),
    "timelineEnd" TIMESTAMP(3),
    "expectedImpact" TEXT,
    "autoProjectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposalComment" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proposalComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'GENERAL',
    "format" TEXT NOT NULL DEFAULT 'IN_PERSON',
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "visibility" TEXT NOT NULL DEFAULT 'ORG_ONLY',
    "isApprovalRequired" BOOLEAN NOT NULL DEFAULT false,
    "maxParticipants" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'UPCOMING',
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3),
    "location" TEXT,
    "venue" TEXT,
    "qrCodeUrl" TEXT,
    "qrCodeData" TEXT,
    "posterUrl" TEXT,
    "galleryImagesJson" JSONB,
    "summary" TEXT,
    "skillsJson" JSONB,
    "tags" JSONB,
    "category" TEXT,
    "relatedProjectId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT,
    "description" TEXT,
    "tagsJson" JSONB,
    "linkedProjectId" TEXT,
    "linkedTeamId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventRegistration" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REGISTERED',
    "approvedAt" TIMESTAMP(3),
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "ticketId" TEXT,
    "preferredTeamId" TEXT,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eventRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventAttendance" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_ATTENDED',
    "checkInTime" TIMESTAMP(3),
    "checkOutTime" TIMESTAMP(3),
    "scannedAt" TIMESTAMP(3),
    "qrCodeId" TEXT,
    "scannerUserId" TEXT,
    "durationMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eventAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventApprovalRequest" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventApprovalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventQRCode" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "qrImageUrl" TEXT,
    "qrData" TEXT,
    "totalScans" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventQRCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventFeedback" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER,
    "comment" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eventFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userEventStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "totalEventsJoined" INTEGER NOT NULL DEFAULT 0,
    "totalAttended" INTEGER NOT NULL DEFAULT 0,
    "totalHoursAttended" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "userEventStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizationProfile" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "profileImageUrl" TEXT,
    "coverImageUrl" TEXT,
    "bio" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "location" TEXT,
    "website" TEXT,
    "galleryImagesJson" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizationProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizationPost" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "authorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approvalStatus" TEXT NOT NULL DEFAULT 'pending',
    "approvedById" TEXT,
    "approvalComment" TEXT,
    "taggedUserIds" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizationPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postComment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "postComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commentReply" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commentReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizationJoinRequest" (
    "id" TEXT NOT NULL,
    "orgName" TEXT NOT NULL,
    "orgType" TEXT,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "description" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizationJoinRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postLike" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "postLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postView" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "postView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "actionUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projectDirector" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'DIRECTOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projectDirector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventDirector" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'DIRECTOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eventDirector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teamDirector" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'DIRECTOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teamDirector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizationCollaborationCode" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizationCollaborationCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collaborationRequest" (
    "id" TEXT NOT NULL,
    "requesterOrganizationId" TEXT NOT NULL,
    "targetOrganizationId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "respondedAt" TIMESTAMP(3),
    "responseMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collaborationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "organization" TEXT,
    "role" TEXT,
    "description" TEXT,
    "howMet" TEXT,
    "tags" JSONB,
    "addedById" TEXT NOT NULL,
    "isGeneral" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "featureAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "grantedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "featureAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Answer_questionId_idx" ON "answer"("questionId");

-- CreateIndex
CREATE INDEX "Answer_userId_idx" ON "answer"("userId");

-- CreateIndex
CREATE INDEX "Insight_userId_idx" ON "insight"("userId");

-- CreateIndex
CREATE INDEX "Result_userId_idx" ON "result"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "User_invitedById_idx" ON "user"("invitedById");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "user"("organizationId");

-- CreateIndex
CREATE INDEX "certificate_userId_idx" ON "certificate"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "skill_name_key" ON "skill"("name");

-- CreateIndex
CREATE INDEX "userSkill_skillId_idx" ON "userSkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "userSkill_userId_skillId_key" ON "userSkill"("userId", "skillId");

-- CreateIndex
CREATE INDEX "team_organizationId_idx" ON "team"("organizationId");

-- CreateIndex
CREATE INDEX "team_createdById_idx" ON "team"("createdById");

-- CreateIndex
CREATE INDEX "team_eventId_idx" ON "team"("eventId");

-- CreateIndex
CREATE INDEX "team_projectId_idx" ON "team"("projectId");

-- CreateIndex
CREATE INDEX "teamMember_userId_idx" ON "teamMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "teamMember_teamId_userId_key" ON "teamMember"("teamId", "userId");

-- CreateIndex
CREATE INDEX "project_organizationId_idx" ON "project"("organizationId");

-- CreateIndex
CREATE INDEX "project_createdById_idx" ON "project"("createdById");

-- CreateIndex
CREATE INDEX "task_projectId_idx" ON "task"("projectId");

-- CreateIndex
CREATE INDEX "task_assigneeId_idx" ON "task"("assigneeId");

-- CreateIndex
CREATE INDEX "task_createdById_idx" ON "task"("createdById");

-- CreateIndex
CREATE INDEX "task_taskStatus_idx" ON "task"("taskStatus");

-- CreateIndex
CREATE INDEX "teamTask_taskStatus_idx" ON "teamTask"("taskStatus");

-- CreateIndex
CREATE INDEX "teamTask_teamId_idx" ON "teamTask"("teamId");

-- CreateIndex
CREATE INDEX "teamTask_createdById_idx" ON "teamTask"("createdById");

-- CreateIndex
CREATE INDEX "teamTask_status_idx" ON "teamTask"("status");

-- CreateIndex
CREATE INDEX "teamTaskComment_taskId_idx" ON "teamTaskComment"("taskId");

-- CreateIndex
CREATE INDEX "teamTaskComment_userId_idx" ON "teamTaskComment"("userId");

-- CreateIndex
CREATE INDEX "teamTaskAssignment_userId_idx" ON "teamTaskAssignment"("userId");

-- CreateIndex
CREATE INDEX "teamTaskAssignment_taskId_idx" ON "teamTaskAssignment"("taskId");

-- CreateIndex
CREATE INDEX "teamTaskAssignment_status_idx" ON "teamTaskAssignment"("status");

-- CreateIndex
CREATE INDEX "teamTaskAssignment_approvalStatus_idx" ON "teamTaskAssignment"("approvalStatus");

-- CreateIndex
CREATE UNIQUE INDEX "teamTaskAssignment_taskId_userId_key" ON "teamTaskAssignment"("taskId", "userId");

-- CreateIndex
CREATE INDEX "memberCredit_userId_idx" ON "memberCredit"("userId");

-- CreateIndex
CREATE INDEX "memberCredit_organizationId_idx" ON "memberCredit"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "memberCredit_userId_organizationId_key" ON "memberCredit"("userId", "organizationId");

-- CreateIndex
CREATE INDEX "proposal_organizationId_idx" ON "proposal"("organizationId");

-- CreateIndex
CREATE INDEX "proposal_submittedById_idx" ON "proposal"("submittedById");

-- CreateIndex
CREATE INDEX "proposal_reviewerId_idx" ON "proposal"("reviewerId");

-- CreateIndex
CREATE INDEX "proposal_status_idx" ON "proposal"("status");

-- CreateIndex
CREATE INDEX "proposalComment_proposalId_idx" ON "proposalComment"("proposalId");

-- CreateIndex
CREATE INDEX "proposalComment_authorId_idx" ON "proposalComment"("authorId");

-- CreateIndex
CREATE INDEX "event_organizationId_idx" ON "event"("organizationId");

-- CreateIndex
CREATE INDEX "event_createdById_idx" ON "event"("createdById");

-- CreateIndex
CREATE INDEX "event_status_idx" ON "event"("status");

-- CreateIndex
CREATE INDEX "event_visibility_idx" ON "event"("visibility");

-- CreateIndex
CREATE INDEX "resource_organizationId_idx" ON "resource"("organizationId");

-- CreateIndex
CREATE INDEX "resource_linkedProjectId_idx" ON "resource"("linkedProjectId");

-- CreateIndex
CREATE INDEX "resource_linkedTeamId_idx" ON "resource"("linkedTeamId");

-- CreateIndex
CREATE INDEX "resource_createdById_idx" ON "resource"("createdById");

-- CreateIndex
CREATE INDEX "eventRegistration_userId_idx" ON "eventRegistration"("userId");

-- CreateIndex
CREATE INDEX "eventRegistration_status_idx" ON "eventRegistration"("status");

-- CreateIndex
CREATE UNIQUE INDEX "eventRegistration_eventId_userId_key" ON "eventRegistration"("eventId", "userId");

-- CreateIndex
CREATE INDEX "eventAttendance_userId_idx" ON "eventAttendance"("userId");

-- CreateIndex
CREATE INDEX "eventAttendance_eventId_idx" ON "eventAttendance"("eventId");

-- CreateIndex
CREATE INDEX "eventAttendance_status_idx" ON "eventAttendance"("status");

-- CreateIndex
CREATE UNIQUE INDEX "eventAttendance_eventId_userId_key" ON "eventAttendance"("eventId", "userId");

-- CreateIndex
CREATE INDEX "eventApprovalRequest_userId_idx" ON "eventApprovalRequest"("userId");

-- CreateIndex
CREATE INDEX "eventApprovalRequest_status_idx" ON "eventApprovalRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "eventApprovalRequest_eventId_userId_key" ON "eventApprovalRequest"("eventId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "eventQRCode_code_key" ON "eventQRCode"("code");

-- CreateIndex
CREATE INDEX "eventQRCode_eventId_idx" ON "eventQRCode"("eventId");

-- CreateIndex
CREATE INDEX "eventFeedback_eventId_idx" ON "eventFeedback"("eventId");

-- CreateIndex
CREATE INDEX "eventFeedback_userId_idx" ON "eventFeedback"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "eventFeedback_eventId_userId_key" ON "eventFeedback"("eventId", "userId");

-- CreateIndex
CREATE INDEX "userEventStats_userId_idx" ON "userEventStats"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "userEventStats_userId_organizationId_key" ON "userEventStats"("userId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "organizationProfile_organizationId_key" ON "organizationProfile"("organizationId");

-- CreateIndex
CREATE INDEX "organizationProfile_organizationId_idx" ON "organizationProfile"("organizationId");

-- CreateIndex
CREATE INDEX "organizationPost_organizationId_idx" ON "organizationPost"("organizationId");

-- CreateIndex
CREATE INDEX "organizationPost_authorId_idx" ON "organizationPost"("authorId");

-- CreateIndex
CREATE INDEX "organizationPost_approvedById_idx" ON "organizationPost"("approvedById");

-- CreateIndex
CREATE INDEX "postComment_postId_idx" ON "postComment"("postId");

-- CreateIndex
CREATE INDEX "postComment_authorId_idx" ON "postComment"("authorId");

-- CreateIndex
CREATE INDEX "commentReply_commentId_idx" ON "commentReply"("commentId");

-- CreateIndex
CREATE INDEX "commentReply_authorId_idx" ON "commentReply"("authorId");

-- CreateIndex
CREATE INDEX "organizationJoinRequest_status_idx" ON "organizationJoinRequest"("status");

-- CreateIndex
CREATE INDEX "postLike_postId_idx" ON "postLike"("postId");

-- CreateIndex
CREATE INDEX "postLike_userId_idx" ON "postLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "postLike_postId_userId_key" ON "postLike"("postId", "userId");

-- CreateIndex
CREATE INDEX "postView_postId_idx" ON "postView"("postId");

-- CreateIndex
CREATE INDEX "postView_userId_idx" ON "postView"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "postView_postId_userId_key" ON "postView"("postId", "userId");

-- CreateIndex
CREATE INDEX "notification_userId_idx" ON "notification"("userId");

-- CreateIndex
CREATE INDEX "notification_postId_idx" ON "notification"("postId");

-- CreateIndex
CREATE INDEX "notification_read_idx" ON "notification"("read");

-- CreateIndex
CREATE INDEX "projectDirector_projectId_idx" ON "projectDirector"("projectId");

-- CreateIndex
CREATE INDEX "projectDirector_userId_idx" ON "projectDirector"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "projectDirector_projectId_userId_key" ON "projectDirector"("projectId", "userId");

-- CreateIndex
CREATE INDEX "eventDirector_eventId_idx" ON "eventDirector"("eventId");

-- CreateIndex
CREATE INDEX "eventDirector_userId_idx" ON "eventDirector"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "eventDirector_eventId_userId_key" ON "eventDirector"("eventId", "userId");

-- CreateIndex
CREATE INDEX "teamDirector_teamId_idx" ON "teamDirector"("teamId");

-- CreateIndex
CREATE INDEX "teamDirector_userId_idx" ON "teamDirector"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "teamDirector_teamId_userId_key" ON "teamDirector"("teamId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "organizationCollaborationCode_organizationId_key" ON "organizationCollaborationCode"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "organizationCollaborationCode_code_key" ON "organizationCollaborationCode"("code");

-- CreateIndex
CREATE INDEX "organizationCollaborationCode_organizationId_idx" ON "organizationCollaborationCode"("organizationId");

-- CreateIndex
CREATE INDEX "collaborationRequest_requesterOrganizationId_idx" ON "collaborationRequest"("requesterOrganizationId");

-- CreateIndex
CREATE INDEX "collaborationRequest_targetOrganizationId_idx" ON "collaborationRequest"("targetOrganizationId");

-- CreateIndex
CREATE INDEX "collaborationRequest_status_idx" ON "collaborationRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "collaborationRequest_requesterOrganizationId_targetOrganiza_key" ON "collaborationRequest"("requesterOrganizationId", "targetOrganizationId");

-- CreateIndex
CREATE INDEX "contact_organizationId_idx" ON "contact"("organizationId");

-- CreateIndex
CREATE INDEX "contact_addedById_idx" ON "contact"("addedById");

-- CreateIndex
CREATE INDEX "featureAccess_userId_idx" ON "featureAccess"("userId");

-- CreateIndex
CREATE INDEX "featureAccess_organizationId_idx" ON "featureAccess"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "featureAccess_userId_organizationId_feature_key" ON "featureAccess"("userId", "organizationId", "feature");

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "Answer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insight" ADD CONSTRAINT "Insight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result" ADD CONSTRAINT "Result_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "User_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate" ADD CONSTRAINT "certificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userSkill" ADD CONSTRAINT "userSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userSkill" ADD CONSTRAINT "userSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teamMember" ADD CONSTRAINT "teamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teamMember" ADD CONSTRAINT "teamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teamTask" ADD CONSTRAINT "teamTask_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teamTask" ADD CONSTRAINT "teamTask_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teamTaskComment" ADD CONSTRAINT "teamTaskComment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "teamTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teamTaskComment" ADD CONSTRAINT "teamTaskComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teamTaskAssignment" ADD CONSTRAINT "teamTaskAssignment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "teamTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teamTaskAssignment" ADD CONSTRAINT "teamTaskAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teamTaskAssignment" ADD CONSTRAINT "teamTaskAssignment_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberCredit" ADD CONSTRAINT "memberCredit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberCredit" ADD CONSTRAINT "memberCredit_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal" ADD CONSTRAINT "proposal_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal" ADD CONSTRAINT "proposal_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal" ADD CONSTRAINT "proposal_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposalComment" ADD CONSTRAINT "proposalComment_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposalComment" ADD CONSTRAINT "proposalComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_relatedProjectId_fkey" FOREIGN KEY ("relatedProjectId") REFERENCES "project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource" ADD CONSTRAINT "resource_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource" ADD CONSTRAINT "resource_linkedProjectId_fkey" FOREIGN KEY ("linkedProjectId") REFERENCES "project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource" ADD CONSTRAINT "resource_linkedTeamId_fkey" FOREIGN KEY ("linkedTeamId") REFERENCES "team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource" ADD CONSTRAINT "resource_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventRegistration" ADD CONSTRAINT "eventRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventRegistration" ADD CONSTRAINT "eventRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventAttendance" ADD CONSTRAINT "eventAttendance_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventAttendance" ADD CONSTRAINT "eventAttendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventAttendance" ADD CONSTRAINT "eventAttendance_scannerUserId_fkey" FOREIGN KEY ("scannerUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventApprovalRequest" ADD CONSTRAINT "eventApprovalRequest_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventApprovalRequest" ADD CONSTRAINT "eventApprovalRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventApprovalRequest" ADD CONSTRAINT "eventApprovalRequest_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventQRCode" ADD CONSTRAINT "eventQRCode_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventFeedback" ADD CONSTRAINT "eventFeedback_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventFeedback" ADD CONSTRAINT "eventFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userEventStats" ADD CONSTRAINT "userEventStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userEventStats" ADD CONSTRAINT "userEventStats_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizationProfile" ADD CONSTRAINT "organizationProfile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizationPost" ADD CONSTRAINT "organizationPost_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizationPost" ADD CONSTRAINT "organizationPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizationPost" ADD CONSTRAINT "organizationPost_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postComment" ADD CONSTRAINT "postComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "organizationPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postComment" ADD CONSTRAINT "postComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commentReply" ADD CONSTRAINT "commentReply_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "postComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commentReply" ADD CONSTRAINT "commentReply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postLike" ADD CONSTRAINT "postLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "organizationPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postLike" ADD CONSTRAINT "postLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postView" ADD CONSTRAINT "postView_postId_fkey" FOREIGN KEY ("postId") REFERENCES "organizationPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postView" ADD CONSTRAINT "postView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_postId_fkey" FOREIGN KEY ("postId") REFERENCES "organizationPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projectDirector" ADD CONSTRAINT "projectDirector_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projectDirector" ADD CONSTRAINT "projectDirector_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventDirector" ADD CONSTRAINT "eventDirector_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventDirector" ADD CONSTRAINT "eventDirector_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teamDirector" ADD CONSTRAINT "teamDirector_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teamDirector" ADD CONSTRAINT "teamDirector_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizationCollaborationCode" ADD CONSTRAINT "organizationCollaborationCode_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaborationRequest" ADD CONSTRAINT "collaborationRequest_requesterOrganizationId_fkey" FOREIGN KEY ("requesterOrganizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaborationRequest" ADD CONSTRAINT "collaborationRequest_targetOrganizationId_fkey" FOREIGN KEY ("targetOrganizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact" ADD CONSTRAINT "contact_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact" ADD CONSTRAINT "contact_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "featureAccess" ADD CONSTRAINT "featureAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "featureAccess" ADD CONSTRAINT "featureAccess_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "featureAccess" ADD CONSTRAINT "featureAccess_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
