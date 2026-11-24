using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.CreateNoticeOfAward;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Procurement.NoticeOfAwards;

public class CreateNoticeOfAwardCommandHandlerTests
{
    [Fact]
    public async Task Handle_CaseA_ValidPublicBiddingAward_ShouldCreateDraftMatchingAwardRecommendation()
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var projectId = Guid.NewGuid();
        var resolutionId = Guid.NewGuid();
        var awardRecId = Guid.NewGuid();
        var winningSupplierId = Guid.NewGuid();

        var winningSupplier = new Supplier { Id = winningSupplierId, Name = "Winning Technologies Corp." };
        var otherSupplier = new Supplier { Id = Guid.NewGuid(), Name = "Other Bidder Corp." };
        context.Suppliers?.AddRange(winningSupplier, otherSupplier);

        var project = new ProcurementProject
        {
            Id = projectId,
            Title = "IT Equipment Purchase",
            ABC = 1000000m
        };
        context.ProcurementProjects?.Add(project);

        var awardRec = new BiddingAwardRecommendation
        {
            Id = awardRecId,
            ProcurementProjectId = projectId,
            WinningSupplierId = winningSupplierId,
            AwardedAmount = 850000m,
            AwardCriterion = "LCRB",
            RecommendedAt = DateTime.UtcNow
        };
        context.BiddingAwardRecommendations?.Add(awardRec);

        var resolution = new BACResolution
        {
            Id = resolutionId,
            ProcurementProjectId = projectId,
            ResolutionNumber = "BAC-RES-2026-001",
            ResolutionType = "award-recommendation",
            BiddingAwardRecommendationId = awardRecId,
            Status = "Approved",
            DateResolved = DateTime.UtcNow
        };
        context.BACResolutions?.Add(resolution);
        await context.SaveChangesAsync();

        var request = new CreateNoticeOfAwardRequest(
            resolutionId,
            new DateOnly(2026, 6, 2),
            new DateOnly(2026, 5, 24),
            "Award for IT Equipment",
            NoticeOfAwardType.GoodsAndServices
        );

        var command = new CreateNoticeOfAwardCommand(request, Guid.NewGuid(), "Jane Staff");
        var handler = new CreateNoticeOfAwardCommandHandler(unitOfWork);

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeEmpty();

        var created = await unitOfWork.NoticeOfAwardRepository.FindAsync(n => n.Id == result.Data);
        created.Should().NotBeNull();
        created!.Status.Should().Be(NoticeOfAwardStatus.Draft);
        created.NOANumber.Should().StartWith("NOA-");
        created.SupplierId.Should().Be(winningSupplierId);
        created.AwardedAmount.Should().Be(850000m);
        created.AwardCriterion.Should().Be("LCRB");
    }

    [Fact]
    public async Task Handle_CaseB_MissingAwardRecommendation_ShouldFailForPublicBidding()
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var projectId = Guid.NewGuid();
        var resolutionId = Guid.NewGuid();

        var project = new ProcurementProject
        {
            Id = projectId,
            Title = "Public Bidding Project Without Award Rec",
            ABC = 500000m
        };
        context.ProcurementProjects?.Add(project);

        var resolution = new BACResolution
        {
            Id = resolutionId,
            ProcurementProjectId = projectId,
            ResolutionNumber = "BAC-RES-2026-EMPTY",
            Status = "Approved",
            DateResolved = DateTime.UtcNow
        };
        context.BACResolutions?.Add(resolution);
        await context.SaveChangesAsync();

        var request = new CreateNoticeOfAwardRequest(
            resolutionId,
            new DateOnly(2026, 6, 2),
            new DateOnly(2026, 5, 24),
            "Award without Recommendation",
            NoticeOfAwardType.GoodsAndServices
        );

        var command = new CreateNoticeOfAwardCommand(request, Guid.NewGuid(), "Jane Staff");
        var handler = new CreateNoticeOfAwardCommandHandler(unitOfWork);

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("No authoritative Bidding Award Recommendation or approved Abstract of Bids found");
    }

    [Fact]
    public async Task Handle_CaseC_Rank1Failed_Rank2Won_ShouldAwardRank2SupplierAndAmount()
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var projectId = Guid.NewGuid();
        var resolutionId = Guid.NewGuid();
        var rank1SupplierId = Guid.NewGuid();
        var rank2SupplierId = Guid.NewGuid();

        var rank1Supplier = new Supplier { Id = rank1SupplierId, Name = "Rank 1 Disqualified Supplier" };
        var rank2Supplier = new Supplier { Id = rank2SupplierId, Name = "Rank 2 Winning Supplier" };
        context.Suppliers?.AddRange(rank1Supplier, rank2Supplier);

        var project = new ProcurementProject
        {
            Id = projectId,
            Title = "Construction of Admin Building",
            ABC = 5000000m
        };
        context.ProcurementProjects?.Add(project);

        // Award Recommendation was created for Rank 2 after Rank 1 failed post-qualification
        var awardRec = new BiddingAwardRecommendation
        {
            Id = Guid.NewGuid(),
            ProcurementProjectId = projectId,
            WinningSupplierId = rank2SupplierId, // Rank 2
            AwardedAmount = 4800000m,
            AwardCriterion = "LCRB",
            RecommendedAt = DateTime.UtcNow
        };
        context.BiddingAwardRecommendations?.Add(awardRec);

        var resolution = new BACResolution
        {
            Id = resolutionId,
            ProcurementProjectId = projectId,
            ResolutionNumber = "BAC-RES-2026-RANK2",
            BiddingAwardRecommendationId = awardRec.Id,
            Status = "Approved",
            DateResolved = DateTime.UtcNow
        };
        context.BACResolutions?.Add(resolution);
        await context.SaveChangesAsync();

        var request = new CreateNoticeOfAwardRequest(
            resolutionId,
            new DateOnly(2026, 6, 2),
            new DateOnly(2026, 5, 24),
            "Award to Rank 2 Bidder",
            NoticeOfAwardType.Infrastructure
        );

        var command = new CreateNoticeOfAwardCommand(request, Guid.NewGuid(), "BAC Secretariat");
        var handler = new CreateNoticeOfAwardCommandHandler(unitOfWork);

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        var created = await unitOfWork.NoticeOfAwardRepository.FindAsync(n => n.Id == result.Data);
        created.Should().NotBeNull();
        created!.SupplierId.Should().Be(rank2SupplierId);
        created.SupplierId.Should().NotBe(rank1SupplierId);
        created.AwardedAmount.Should().Be(4800000m);
    }

    [Fact]
    public async Task Handle_CaseD_AwardedAmountDistinctFromABC_ShouldUseAwardedAmount()
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var projectId = Guid.NewGuid();
        var resolutionId = Guid.NewGuid();
        var supplierId = Guid.NewGuid();

        context.Suppliers?.Add(new Supplier { Id = supplierId, Name = "Alpha Supplies" });

        var project = new ProcurementProject
        {
            Id = projectId,
            Title = "Medical Supplies",
            ABC = 2500000m // ABC is 2.5M
        };
        context.ProcurementProjects?.Add(project);

        var awardRec = new BiddingAwardRecommendation
        {
            Id = Guid.NewGuid(),
            ProcurementProjectId = projectId,
            WinningSupplierId = supplierId,
            AwardedAmount = 2150000m, // Evaluated amount is 2.15M (distinct from ABC)
            AwardCriterion = "LCRB",
            RecommendedAt = DateTime.UtcNow
        };
        context.BiddingAwardRecommendations?.Add(awardRec);

        var resolution = new BACResolution
        {
            Id = resolutionId,
            ProcurementProjectId = projectId,
            ResolutionNumber = "BAC-RES-2026-MED",
            BiddingAwardRecommendationId = awardRec.Id,
            Status = "Approved",
            DateResolved = DateTime.UtcNow
        };
        context.BACResolutions?.Add(resolution);
        await context.SaveChangesAsync();

        var request = new CreateNoticeOfAwardRequest(
            resolutionId,
            new DateOnly(2026, 6, 2),
            new DateOnly(2026, 5, 24),
            "Award for Medical Supplies",
            NoticeOfAwardType.GoodsAndServices
        );

        var command = new CreateNoticeOfAwardCommand(request, Guid.NewGuid(), "BAC Officer");
        var handler = new CreateNoticeOfAwardCommandHandler(unitOfWork);

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        var created = await unitOfWork.NoticeOfAwardRepository.FindAsync(n => n.Id == result.Data);
        created!.AwardedAmount.Should().Be(2150000m);
        created.AwardedAmount.Should().NotBe(project.ABC);
    }

    [Fact]
    public async Task Handle_CaseE_MultipleSuppliersInDatabase_ShouldNeverPickFirstSupplierArbitrarily()
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var s1 = new Supplier { Id = Guid.NewGuid(), Name = "First Supplier in DB" };
        var s2 = new Supplier { Id = Guid.NewGuid(), Name = "Second Supplier in DB" };
        var winningSupplierId = Guid.NewGuid();
        var winningSupplier = new Supplier { Id = winningSupplierId, Name = "Actual Winning Supplier" };
        context.Suppliers?.AddRange(s1, s2, winningSupplier);

        var projectId = Guid.NewGuid();
        var resolutionId = Guid.NewGuid();

        var project = new ProcurementProject
        {
            Id = projectId,
            Title = "Office Desks",
            ABC = 700000m
        };
        context.ProcurementProjects?.Add(project);

        var awardRec = new BiddingAwardRecommendation
        {
            Id = Guid.NewGuid(),
            ProcurementProjectId = projectId,
            WinningSupplierId = winningSupplierId,
            AwardedAmount = 620000m,
            AwardCriterion = "LCRB",
            RecommendedAt = DateTime.UtcNow
        };
        context.BiddingAwardRecommendations?.Add(awardRec);

        var resolution = new BACResolution
        {
            Id = resolutionId,
            ProcurementProjectId = projectId,
            ResolutionNumber = "BAC-RES-2026-DESKS",
            BiddingAwardRecommendationId = awardRec.Id,
            Status = "Approved",
            DateResolved = DateTime.UtcNow
        };
        context.BACResolutions?.Add(resolution);
        await context.SaveChangesAsync();

        var request = new CreateNoticeOfAwardRequest(
            resolutionId,
            new DateOnly(2026, 6, 2),
            new DateOnly(2026, 5, 24),
            "Award for Office Desks",
            NoticeOfAwardType.GoodsAndServices
        );

        var command = new CreateNoticeOfAwardCommand(request, Guid.NewGuid(), "BAC Officer");
        var handler = new CreateNoticeOfAwardCommandHandler(unitOfWork);

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        var created = await unitOfWork.NoticeOfAwardRepository.FindAsync(n => n.Id == result.Data);
        created!.SupplierId.Should().Be(winningSupplierId);
        created.SupplierId.Should().NotBe(s1.Id);
        created.SupplierId.Should().NotBe(s2.Id);
    }

    [Fact]
    public async Task Handle_CaseF1_AlternativeProcurementMode_ShouldBeRejectedFromNOA()
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var modeId = Guid.NewGuid();
        var mode = new ProcurementMode { Id = modeId, Name = "Small Value Procurement (Sec. 53.9)" };
        context.ProcurementModes?.Add(mode);

        var supplierId = Guid.NewGuid();
        context.Suppliers?.Add(new Supplier { Id = supplierId, Name = "SVP Supplier" });

        var projectId = Guid.NewGuid();
        var project = new ProcurementProject
        {
            Id = projectId,
            Title = "Small Value Catering",
            ProcurementModeId = modeId,
            ABC = 90000m
        };
        context.ProcurementProjects?.Add(project);

        var resolutionId = Guid.NewGuid();
        var resolution = new BACResolution
        {
            Id = resolutionId,
            ProcurementProjectId = projectId,
            ResolutionNumber = "BAC-RES-2026-SVP",
            Status = "Approved",
            DateResolved = DateTime.UtcNow
        };
        context.BACResolutions?.Add(resolution);
        await context.SaveChangesAsync();

        var request = new CreateNoticeOfAwardRequest(
            resolutionId,
            new DateOnly(2026, 6, 2),
            new DateOnly(2026, 5, 24),
            "Award for Catering",
            NoticeOfAwardType.GoodsAndServices
        );

        var command = new CreateNoticeOfAwardCommand(request, Guid.NewGuid(), "BAC Officer");
        var handler = new CreateNoticeOfAwardCommandHandler(unitOfWork);

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("Notice of Award can only be created for Public Bidding / Competitive Bidding projects");
    }

    [Fact]
    public async Task Handle_CaseF2_PublicBiddingWithAOBMatrix_ShouldSucceed()
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var modeId = Guid.NewGuid();
        var mode = new ProcurementMode { Id = modeId, Name = "Competitive Public Bidding" };
        context.ProcurementModes?.Add(mode);

        var supplierId = Guid.NewGuid();
        context.Suppliers?.Add(new Supplier { Id = supplierId, Name = "Bidding AOB Winner" });

        var projectId = Guid.NewGuid();
        var project = new ProcurementProject
        {
            Id = projectId,
            Title = "Public Bidding Laboratory Supplies",
            ProcurementModeId = modeId,
            ABC = 900000m
        };
        context.ProcurementProjects?.Add(project);

        var aobId = Guid.NewGuid();
        var aob = new ERPEZ.Domain.Entities.Procurement.AOB { Id = aobId, AOBNumber = "AOB-2026-001", AwardCriterion = BidEvaluationCriteria.LCRB };
        context.AOBs?.Add(aob);

        var aobMapping = new AOBProcurementProjectMapping { Id = Guid.NewGuid(), AOBId = aobId, ProcurementProjectId = projectId };
        context.AOBProcurementProjectMappings?.Add(aobMapping);

        var aobItem = new AOBAwardedItem { Id = Guid.NewGuid(), AOBId = aobId, WinningSupplierId = supplierId, TotalAwardedAmount = 850000m };
        context.AOBAwardedItems?.Add(aobItem);

        var resolutionId = Guid.NewGuid();
        var resolution = new BACResolution
        {
            Id = resolutionId,
            ProcurementProjectId = projectId,
            ResolutionNumber = "BAC-RES-2026-AOB",
            Status = "Approved",
            DateResolved = DateTime.UtcNow
        };
        context.BACResolutions?.Add(resolution);
        await context.SaveChangesAsync();

        var request = new CreateNoticeOfAwardRequest(
            resolutionId,
            new DateOnly(2026, 6, 2),
            new DateOnly(2026, 5, 24),
            "Award for Lab Supplies",
            NoticeOfAwardType.GoodsAndServices
        );

        var command = new CreateNoticeOfAwardCommand(request, Guid.NewGuid(), "BAC Officer");
        var handler = new CreateNoticeOfAwardCommandHandler(unitOfWork);

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        var created = await unitOfWork.NoticeOfAwardRepository.FindAsync(n => n.Id == result.Data);
        created!.SupplierId.Should().Be(supplierId);
        created.AwardedAmount.Should().Be(850000m);
    }

    [Fact]
    public async Task Handle_DuplicateResolution_ShouldFail()
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var projectId = Guid.NewGuid();
        var resolutionId = Guid.NewGuid();

        var project = new ProcurementProject { Id = projectId, Title = "Project 1", ABC = 100000m };
        context.ProcurementProjects?.Add(project);

        var resolution = new BACResolution { Id = resolutionId, ProcurementProjectId = projectId, ResolutionNumber = "RES-001" };
        context.BACResolutions?.Add(resolution);

        var existingNoa = new NoticeOfAward
        {
            Id = Guid.NewGuid(),
            NOANumber = "NOA-2026-001",
            BACResolutionId = resolutionId,
            ProcurementProjectId = projectId,
            Status = NoticeOfAwardStatus.Draft
        };
        await unitOfWork.NoticeOfAwardRepository.AddAsync(existingNoa);
        await unitOfWork.SaveChangesAsync();

        var request = new CreateNoticeOfAwardRequest(
            resolutionId,
            new DateOnly(2026, 6, 2),
            new DateOnly(2026, 5, 24),
            "Duplicate NOA attempt",
            NoticeOfAwardType.GoodsAndServices
        );

        var command = new CreateNoticeOfAwardCommand(request, Guid.NewGuid(), "Jane Staff");
        var handler = new CreateNoticeOfAwardCommandHandler(unitOfWork);

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("already active");
    }
}
