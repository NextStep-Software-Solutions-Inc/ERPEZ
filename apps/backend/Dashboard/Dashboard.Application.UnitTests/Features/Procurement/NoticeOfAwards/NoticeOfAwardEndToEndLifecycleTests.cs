using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.ApproveNoticeOfAward;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.CreateNoticeOfAward;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.LogNoticeOfAwardMilestone;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.SubmitNoticeOfAward;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Queries.GetAvailableAwardBacResolutions;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Queries.GetNoticeOfAwardById;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Utils;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Procurement.NoticeOfAwards;

public class NoticeOfAwardEndToEndLifecycleTests
{
    [Fact]
    public async Task EndToEnd_PublicBiddingNOA_FullLifecycle_ShouldPassAllPhases()
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        // -- STEP 1: Upstream Procurement Chain Setup ----------------------------
        var publicBiddingMode = new ProcurementMode
        {
            Id = Guid.NewGuid(),
            Name = "Public Bidding",
            MinSupplierCount = 3
        };
        await unitOfWork.ProcurementModeRepository.AddAsync(publicBiddingMode);

        var supplier = new Supplier
        {
            Id = Guid.NewGuid(),
            Name = "Northstar Systems Inc.",
            Email = "contact@northstarsystems.ph",
            ContactPerson = "John Northstar"
        };
        await unitOfWork.SupplierRepository.AddAsync(supplier);

        var cpr = new ConsolidatedPR
        {
            Id = Guid.NewGuid(),
            CPRNumber = "CPR-2026-001",
            Description = "IT Hardware & Server Equipment",
            TotalAmount = 250000m,
            ConsolidationDate = new DateOnly(2026, 5, 1)
        };
        await unitOfWork.ConsolidatedPRRepository.AddAsync(cpr);

        var project = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "Supply & Delivery of Server Hardware",
            ConsolidatedPRId = cpr.Id,
            ProcurementModeId = publicBiddingMode.Id,
            ABC = 250000m,
            Status = "ForAward"
        };
        await unitOfWork.ProcurementProjectRepository.AddAsync(project);

        var aob = new ERPEZ.Domain.Entities.Procurement.AOB
        {
            Id = Guid.NewGuid(),
            AOBNumber = "AOB-2026-001",
            AwardCriterion = BidEvaluationCriteria.LCRB,
            AOBDate = new DateOnly(2026, 5, 20),
            Status = StatusEnum.Approved
        };
        await unitOfWork.AOBRepository.AddAsync(aob);

        var aobMapping = new AOBProcurementProjectMapping
        {
            Id = Guid.NewGuid(),
            AOBId = aob.Id,
            ProcurementProjectId = project.Id
        };
        await unitOfWork.AOBProcurementProjectMappingRepository.AddAsync(aobMapping);

        var aobAwardedItem = new AOBAwardedItem
        {
            Id = Guid.NewGuid(),
            AOBId = aob.Id,
            RFQItemId = Guid.NewGuid(),
            WinningSupplierId = supplier.Id,
            AwardedUnitPrice = 117500m,
            AwardedQuantity = 2,
            TotalAwardedAmount = 235000m,
            Score = 100m,
            AwardReason = "Lowest Calculated Responsive Bid"
        };
        await unitOfWork.AOBAwardedItemRepository.AddAsync(aobAwardedItem);

        var bacRes = new BACResolution
        {
            Id = Guid.NewGuid(),
            ResolutionNumber = "BAC-RES-2026-004",
            ResolutionType = "Award Recommendation",
            ProcurementProjectId = project.Id,
            Status = "Approved",
            DateResolved = new DateTime(2026, 5, 25, 10, 0, 0, DateTimeKind.Utc)
        };
        await unitOfWork.BACResolutionRepository.AddAsync(bacRes);
        await unitOfWork.SaveChangesAsync();

        // -- TEST 1: Check Available BAC Resolutions Query -----------------------
        var queryHandler = new GetAvailableAwardBacResolutionsQueryHandler(unitOfWork);
        var availableResResult = await queryHandler.Handle(new GetAvailableAwardBacResolutionsQuery(), CancellationToken.None);
        availableResResult.Succeeded.Should().BeTrue();
        availableResResult.Data.Should().ContainSingle(r => r.Id == bacRes.Id);
        var resolvedItem = availableResResult.Data!.First(r => r.Id == bacRes.Id);
        resolvedItem.WinningSupplierName.Should().Be("Northstar Systems Inc.");
        resolvedItem.AwardedAmount.Should().Be(235000m);

        // -- TEST 2: Create Draft NOA --------------------------------------------
        var createRequest = new CreateNoticeOfAwardRequest(
            bacRes.Id,
            new DateOnly(2026, 6, 1),
            new DateOnly(2026, 5, 20),
            "Notice of Award for Server Procurement",
            NoticeOfAwardType.GoodsAndServices
        );
        var createCommand = new CreateNoticeOfAwardCommand(createRequest, Guid.NewGuid(), "Staff User");
        var createHandler = new CreateNoticeOfAwardCommandHandler(unitOfWork);
        var createResult = await createHandler.Handle(createCommand, CancellationToken.None);

        createResult.Succeeded.Should().BeTrue();
        var noaId = createResult.Data;

        var noa = await unitOfWork.NoticeOfAwardRepository.FindAsync(n => n.Id == noaId);
        noa.Should().NotBeNull();
        noa!.Status.Should().Be(NoticeOfAwardStatus.Draft);
        noa.SupplierId.Should().Be(supplier.Id);
        noa.AwardedAmount.Should().Be(235000m);
        noa.NOANumber.Should().StartWith("NOA-");

        // -- TEST 3: Submit NOA for HoPE Approval --------------------------------
        var submitCommand = new SubmitNoticeOfAwardCommand(noaId, Guid.NewGuid(), "Staff User");
        var submitHandler = new SubmitNoticeOfAwardCommandHandler(unitOfWork);
        var submitResult = await submitHandler.Handle(submitCommand, CancellationToken.None);
        submitResult.Succeeded.Should().BeTrue();

        var submittedNoa = await unitOfWork.NoticeOfAwardRepository.FindAsync(n => n.Id == noaId);
        submittedNoa!.Status.Should().Be(NoticeOfAwardStatus.ForApproval);

        // -- TEST 4: HoPE Approval & Issuance ------------------------------------
        var signedPdfId = Guid.NewGuid();
        var approveRequest = new ApproveNoticeOfAwardRequest(
            signedPdfId,
            "NOA-2026-001-Signed.pdf",
            new DateOnly(2026, 6, 2),
            "PHILGEPS-2026-9999",
            "Approved by HoPE"
        );
        var approveCommand = new ApproveNoticeOfAwardCommand(noaId, approveRequest, Guid.NewGuid(), "Hon. Regional Director");
        var approveHandler = new ApproveNoticeOfAwardCommandHandler(unitOfWork);
        var approveResult = await approveHandler.Handle(approveCommand, CancellationToken.None);
        approveResult.Succeeded.Should().BeTrue();

        var approvedNoa = await unitOfWork.NoticeOfAwardRepository.FindAsync(n => n.Id == noaId);
        approvedNoa!.Status.Should().Be(NoticeOfAwardStatus.Approved);
        approvedNoa.IssuedAt.Should().NotBeNull();
        approvedNoa.ReceivedAt.Should().BeNull("Statutory receipt has not yet been logged");
        approvedNoa.ContractExecutionDeadline.Should().BeNull("Statutory 10-day deadline starts upon receipt");

        // Backdate IssuedAt to June 1, 2026 to test subsequent receipt on June 3, 2026
        approvedNoa.IssuedAt = new DateTime(2026, 6, 1, 8, 0, 0, DateTimeKind.Utc);
        unitOfWork.NoticeOfAwardRepository.Update(approvedNoa);
        await unitOfWork.SaveChangesAsync();

        // Verify SLA state prior to Conforme receipt
        var preConformeSla = NoticeOfAwardSlaCalculator.CalculateSla(approvedNoa);
        preConformeSla.IsIssued.Should().BeTrue();
        preConformeSla.IsOpen.Should().BeFalse("Statutory countdown is awaiting bidder receipt");
        preConformeSla.Label.Should().Be("Issued — Awaiting Conforme");
        preConformeSla.DaysRemaining.Should().BeNull();

        // -- TEST 5: Sequence Enforcement — Reject Skipping to Security ----------
        var milestoneHandler = new LogNoticeOfAwardMilestoneCommandHandler(unitOfWork);
        var invalidSecRequest = new LogNoticeOfAwardMilestoneRequest(
            NoticeOfAwardMilestoneType.PerformanceSecurityPosted,
            new DateOnly(2026, 6, 4),
            Guid.NewGuid(),
            "bond.pdf",
            "Performance bond"
        );
        var invalidSecResult = await milestoneHandler.Handle(
            new LogNoticeOfAwardMilestoneCommand(noaId, invalidSecRequest, Guid.NewGuid(), "Staff"),
            CancellationToken.None
        );
        invalidSecResult.Succeeded.Should().BeFalse("Cannot post performance security before NOA Conforme is recorded");

        // -- TEST 6: Bidder Receipt / Conforme Logging ---------------------------
        var conformeDate = new DateOnly(2026, 6, 3);
        var conformeRequest = new LogNoticeOfAwardMilestoneRequest(
            NoticeOfAwardMilestoneType.ConformeReceived,
            conformeDate,
            Guid.NewGuid(),
            "NOA-Conforme-Signed.pdf",
            "Conforme signed by supplier representative"
        );
        var conformeResult = await milestoneHandler.Handle(
            new LogNoticeOfAwardMilestoneCommand(noaId, conformeRequest, Guid.NewGuid(), "Staff"),
            CancellationToken.None
        );
        conformeResult.Succeeded.Should().BeTrue();

        var conformeNoa = await unitOfWork.NoticeOfAwardRepository.FindAsync(n => n.Id == noaId);
        conformeNoa!.ReceivedAt.Should().Be(conformeDate);
        conformeNoa.ContractExecutionDeadline.Should().Be(conformeDate.AddDays(10));

        // Verify active SLA countdown
        var activeSla = NoticeOfAwardSlaCalculator.CalculateSla(
            conformeNoa,
            utcNow: new DateTime(2026, 6, 5, 10, 0, 0, DateTimeKind.Utc) // 2 days after receipt
        );
        activeSla.IsIssued.Should().BeTrue();
        activeSla.IsOpen.Should().BeTrue();
        activeSla.IsOverdue.Should().BeFalse();
        activeSla.DaysRemaining.Should().Be(8);

        // -- TEST 7: Performance Security Milestone ------------------------------
        var secRequest = new LogNoticeOfAwardMilestoneRequest(
            NoticeOfAwardMilestoneType.PerformanceSecurityPosted,
            new DateOnly(2026, 6, 6),
            Guid.NewGuid(),
            "GSIS-Surety-Bond.pdf",
            "Valid surety bond posted"
        );
        var secResult = await milestoneHandler.Handle(
            new LogNoticeOfAwardMilestoneCommand(noaId, secRequest, Guid.NewGuid(), "Staff"),
            CancellationToken.None
        );
        secResult.Succeeded.Should().BeTrue();

        // -- TEST 8: Contract Execution & SLA Completion -------------------------
        var contractRequest = new LogNoticeOfAwardMilestoneRequest(
            NoticeOfAwardMilestoneType.ContractExecuted,
            new DateOnly(2026, 6, 9),
            Guid.NewGuid(),
            "Contract-Signed-Both-Parties.pdf",
            "Contract signed and notarized"
        );
        var contractResult = await milestoneHandler.Handle(
            new LogNoticeOfAwardMilestoneCommand(noaId, contractRequest, Guid.NewGuid(), "Staff"),
            CancellationToken.None
        );
        contractResult.Succeeded.Should().BeTrue();

        var getByIdHandler = new GetNoticeOfAwardByIdQueryHandler(unitOfWork);
        var finalNoaDetail = await getByIdHandler.Handle(new GetNoticeOfAwardByIdQuery(noaId), CancellationToken.None);
        finalNoaDetail.Succeeded.Should().BeTrue();
        finalNoaDetail.Data!.SlaState.IsComplete.Should().BeTrue();
        finalNoaDetail.Data.SlaState.Label.Should().Be("Complete");
        finalNoaDetail.Data.SlaState.CompletedMilestones.Should().Be(3);
    }

    [Fact]
    public async Task SVP_AlternativeMode_ShouldBeBlockedFromPublicBiddingNOA()
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        // SVP Mode
        var svpMode = new ProcurementMode
        {
            Id = Guid.NewGuid(),
            Name = "Small Value Procurement",
            MinSupplierCount = 3
        };
        await unitOfWork.ProcurementModeRepository.AddAsync(svpMode);

        var svpProject = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "Office Consumables - SVP",
            ProcurementModeId = svpMode.Id,
            ABC = 50000m
        };
        await unitOfWork.ProcurementProjectRepository.AddAsync(svpProject);

        var svpResolution = new BACResolution
        {
            Id = Guid.NewGuid(),
            ResolutionNumber = "BAC-RES-SVP-001",
            ResolutionType = "Award Recommendation",
            ProcurementProjectId = svpProject.Id,
            Status = "Approved",
            DateResolved = DateTime.UtcNow
        };
        await unitOfWork.BACResolutionRepository.AddAsync(svpResolution);
        await unitOfWork.SaveChangesAsync();

        // 1. Should not appear in Available Award Resolutions for Public Bidding NOA
        var queryHandler = new GetAvailableAwardBacResolutionsQueryHandler(unitOfWork);
        var result = await queryHandler.Handle(new GetAvailableAwardBacResolutionsQuery(), CancellationToken.None);
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotContain(r => r.Id == svpResolution.Id, "SVP resolutions must be filtered out of Public Bidding NOA");

        // 2. Direct creation attempt must be rejected server-side
        var createRequest = new CreateNoticeOfAwardRequest(
            svpResolution.Id,
            DateOnly.FromDateTime(DateTime.UtcNow),
            DateOnly.FromDateTime(DateTime.UtcNow),
            "Attempted NOA for SVP",
            NoticeOfAwardType.GoodsAndServices
        );
        var createHandler = new CreateNoticeOfAwardCommandHandler(unitOfWork);
        var createResult = await createHandler.Handle(
            new CreateNoticeOfAwardCommand(createRequest, Guid.NewGuid(), "Staff"),
            CancellationToken.None
        );

        createResult.Succeeded.Should().BeFalse("SVP projects must be rejected by NOA command handler");
        createResult.Message.Should().Contain("Public Bidding");
    }

    [Fact]
    public async Task Overdue_SLA_Calculation_WithHistoricalConforme_ShouldReportOverdue()
    {
        var issuedAt = new DateTime(2026, 5, 1, 10, 0, 0, DateTimeKind.Utc);
        var receivedAt = new DateOnly(2026, 5, 2);
        var today = new DateTime(2026, 5, 20, 10, 0, 0, DateTimeKind.Utc); // 18 days after receipt

        var noa = new NoticeOfAward
        {
            Id = Guid.NewGuid(),
            Status = NoticeOfAwardStatus.Approved,
            IssuedAt = issuedAt,
            ReceivedAt = receivedAt,
            ContractExecutionDeadline = receivedAt.AddDays(10)
        };

        var sla = NoticeOfAwardSlaCalculator.CalculateSla(noa, utcNow: today);

        sla.IsIssued.Should().BeTrue();
        sla.IsOpen.Should().BeTrue();
        sla.IsOverdue.Should().BeTrue();
        sla.RequiresCascadeDecision.Should().BeTrue();
        sla.Label.Should().Contain("Overdue");
        sla.Tone.Should().Be("destructive");
    }
}
