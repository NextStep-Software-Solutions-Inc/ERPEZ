using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Dashboard.Application.UnitTests.Features.Procurement.NoticeOfAwards;
using ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.CreateBiddingAwardRecommendation;
using ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.EvaluateProjectBids;
using ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.LogPostQualificationDocsReceived;
using ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.RecordBidOpening;
using ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.RecordPostQualificationResult;
using ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.SendPostQualificationNotice;
using ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.SubmitBiddingPackage;
using ERPEZ.Application.Features.Procurement.BidEvaluations.Queries.GetProjectBidEvaluation;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Queries.GetAvailableAwardBacResolutions;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Procurement.BidEvaluations;

public class TestCurrentUserService : ICurrentUserService
{
    public string? UserId { get; set; } = Guid.NewGuid().ToString();
    public string? Username { get; set; } = "test.officer";
    public string? Email { get; set; } = "test@erp.gov.ph";
    public string? Name { get; set; } = "Test Officer";
    public IEnumerable<string> Roles { get; set; } = ["BAC_Officer"];
    public Guid? OfficeId { get; set; }
    public bool IsAuthenticated => true;
    public bool IsPlanningUser => false;
    public bool IsOfficeUser => false;
    public bool IsInRole(string role) => Roles.Contains(role);
}

public class BidEvaluationEndToEndTests
{
    private readonly ICurrentUserService currentUserService = new TestCurrentUserService();

    [Fact]
    public async Task EndToEnd_PublicBiddingWorkflow_LCRB_Succeeds()
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var uow = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        // 1. Setup Project, Mode, and Schedule
        var project = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "Procurement of IT Equipment 2026",
            ABC = 5_000_000m,
            Status = "Approved",
            CreatedBy = "Admin"
        };
        await context.ProcurementProjects!.AddAsync(project);

        var openingSchedule = new BiddingActivitySchedule
        {
            Id = Guid.NewGuid(),
            ProcurementProjectId = project.Id,
            StartDate = DateTime.UtcNow.AddDays(-5),
            EndDate = DateTime.UtcNow.AddDays(5),
            ProcurementActivityType = new ProcurementActivityType
            {
                Id = Guid.NewGuid(),
                Name = "Submission & Opening of Bids",
                SystemRole = ProcurementActivitySystemRole.SubmissionOpeningOfBids,
                CreatedBy = "Admin"
            },
            CreatedBy = "Admin"
        };
        await context.BiddingActivitySchedules!.AddAsync(openingSchedule);

        var supplier1 = new Supplier { Id = Guid.NewGuid(), Name = "Alpha Tech Corp", CreatedBy = "Admin" };
        var supplier2 = new Supplier { Id = Guid.NewGuid(), Name = "Beta Solutions Inc", CreatedBy = "Admin" };
        await context.Suppliers!.AddRangeAsync(supplier1, supplier2);
        await context.SaveChangesAsync();

        // 2. Submit Bidding Packages for Supplier 1 and 2
        var submitHandler = new SubmitBiddingPackageCommandHandler(uow, currentUserService);
        
        var sub1Result = await submitHandler.Handle(new SubmitBiddingPackageCommand
        {
            ProjectId = project.Id,
            Request = new SubmitBiddingPackageRequest
            {
                SupplierId = supplier1.Id,
                OriginalProposedAmount = 4_500_000m,
                BidSecurityType = "Bid Securing Declaration"
            }
        }, CancellationToken.None);

        var sub2Result = await submitHandler.Handle(new SubmitBiddingPackageCommand
        {
            ProjectId = project.Id,
            Request = new SubmitBiddingPackageRequest
            {
                SupplierId = supplier2.Id,
                OriginalProposedAmount = 4_200_000m,
                BidSecurityType = "Bid Securing Declaration"
            }
        }, CancellationToken.None);

        sub1Result.Succeeded.Should().BeTrue();
        sub2Result.Succeeded.Should().BeTrue();

        // 3. Record Bid Opening
        var openingHandler = new RecordBidOpeningCommandHandler(uow, currentUserService);

        var open1Result = await openingHandler.Handle(new RecordBidOpeningCommand
        {
            ProjectId = project.Id,
            Request = new RecordBidOpeningRequest
            {
                BiddingSubmissionId = sub1Result.Data,
                Envelope1Result = "Passed",
                Envelope2Opened = true,
                AsReadBidAmount = 4_500_000m
            }
        }, CancellationToken.None);

        var open2Result = await openingHandler.Handle(new RecordBidOpeningCommand
        {
            ProjectId = project.Id,
            Request = new RecordBidOpeningRequest
            {
                BiddingSubmissionId = sub2Result.Data,
                Envelope1Result = "Passed",
                Envelope2Opened = true,
                AsReadBidAmount = 4_200_000m
            }
        }, CancellationToken.None);

        open1Result.Succeeded.Should().BeTrue();
        open2Result.Succeeded.Should().BeTrue();

        // 4. Evaluate Bids (LCRB)
        var evalHandler = new EvaluateProjectBidsCommandHandler(uow, currentUserService);
        var evalResult = await evalHandler.Handle(new EvaluateProjectBidsCommand
        {
            ProjectId = project.Id,
            Request = new EvaluateProjectBidsRequest
            {
                AwardCriterion = "LCRB",
                Bidders =
                [
                    new BidderEvaluationInput { BidOpeningRecordId = open1Result.Data, EvaluatedBidPrice = 4_500_000m, IsResponsive = true },
                    new BidderEvaluationInput { BidOpeningRecordId = open2Result.Data, EvaluatedBidPrice = 4_200_000m, IsResponsive = true }
                ]
            }
        }, CancellationToken.None);

        evalResult.Succeeded.Should().BeTrue();

        // Query evaluation
        var queryHandler = new GetProjectBidEvaluationQueryHandler(uow);
        var evalQuery = await queryHandler.Handle(new GetProjectBidEvaluationQuery(project.Id), CancellationToken.None);

        evalQuery.Succeeded.Should().BeTrue();
        evalQuery.Data!.EvaluatedBids.Should().HaveCount(2);
        evalQuery.Data.EvaluatedBids[0].SupplierId.Should().Be(supplier2.Id); // Lowest price = Rank 1
        evalQuery.Data.EvaluatedBids[0].Rank.Should().Be(1);
        evalQuery.Data.EvaluatedBids[0].PostQualification.Should().NotBeNull();
        evalQuery.Data.EvaluatedBids[0].PostQualification!.Status.Should().Be("PendingDocs");

        var rank1BidId = evalQuery.Data.EvaluatedBids[0].Id;

        // 5. Send Post-Qualification Notice to Rank 1
        var noticeHandler = new SendPostQualificationNoticeCommandHandler(uow, currentUserService);
        var noticeResult = await noticeHandler.Handle(new SendPostQualificationNoticeCommand
        {
            ProjectId = project.Id,
            Request = new SendPostQualificationNoticeRequest
            {
                BiddingEvaluatedBidId = rank1BidId,
                NoticeSentAt = DateTime.UtcNow,
                TargetDays = 5
            }
        }, CancellationToken.None);

        noticeResult.Succeeded.Should().BeTrue();

        // 6. Log Post-Qualification Docs Received
        var docsHandler = new LogPostQualificationDocsReceivedCommandHandler(uow, currentUserService);
        var docsResult = await docsHandler.Handle(new LogPostQualificationDocsReceivedCommand
        {
            ProjectId = project.Id,
            Request = new LogPostQualificationDocsReceivedRequest
            {
                BiddingEvaluatedBidId = rank1BidId,
                DocsReceivedAt = DateTime.UtcNow,
                BacEvaluationDays = 12
            }
        }, CancellationToken.None);

        docsResult.Succeeded.Should().BeTrue();

        // 7. Record Post-Qualification Result (Passed)
        var postQualResultHandler = new RecordPostQualificationResultCommandHandler(uow, currentUserService);
        var resultPass = await postQualResultHandler.Handle(new RecordPostQualificationResultCommand
        {
            ProjectId = project.Id,
            Request = new RecordPostQualificationResultRequest
            {
                BiddingEvaluatedBidId = rank1BidId,
                Passed = true,
                Findings = "All legal, technical, and financial requirements verified and authentic."
            }
        }, CancellationToken.None);

        resultPass.Succeeded.Should().BeTrue();

        // 8. Create Bidding Award Recommendation
        var awardRecHandler = new CreateBiddingAwardRecommendationCommandHandler(uow, currentUserService);
        var awardRecResult = await awardRecHandler.Handle(new CreateBiddingAwardRecommendationCommand
        {
            ProjectId = project.Id,
            Request = new CreateBiddingAwardRecommendationRequest
            {
                BiddingPostQualificationId = resultPass.Data,
                Remarks = "Recommended for award as Lowest Calculated and Responsive Bid (LCRB)."
            }
        }, CancellationToken.None);

        awardRecResult.Succeeded.Should().BeTrue();

        // 9. Link to BAC Award Resolution
        var bacResolution = new BACResolution
        {
            Id = Guid.NewGuid(),
            ProcurementProjectId = project.Id,
            ResolutionType = "award-recommendation",
            ResolutionNumber = "BAC-RES-2026-001",
            DateResolved = DateTime.UtcNow,
            Status = "Approved",
            BiddingAwardRecommendationId = awardRecResult.Data,
            CreatedBy = "Admin"
        };
        await context.BACResolutions!.AddAsync(bacResolution);
        await context.SaveChangesAsync();

        // 10. Verify NOA Upstream Query consumes authoritative award recommendation
        var noaQueryHandler = new GetAvailableAwardBacResolutionsQueryHandler(uow);
        var availableNoas = await noaQueryHandler.Handle(new GetAvailableAwardBacResolutionsQuery(), CancellationToken.None);

        availableNoas.Succeeded.Should().BeTrue();
        availableNoas.Data.Should().ContainSingle();
        availableNoas.Data![0].SupplierId.Should().Be(supplier2.Id);
        availableNoas.Data[0].WinningSupplierName.Should().Be("Beta Solutions Inc");
        availableNoas.Data[0].AwardedAmount.Should().Be(4_200_000m);
        availableNoas.Data[0].AwardCriterion.Should().Be("LCRB");
    }

    [Fact]
    public async Task PostQualification_Cascade_WhenRank1Fails_UnlocksRank2()
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var uow = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var project = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "Laboratory Equipment Project",
            ABC = 2_000_000m,
            Status = "Approved",
            CreatedBy = "Admin"
        };
        await context.ProcurementProjects!.AddAsync(project);

        var supplier1 = new Supplier { Id = Guid.NewGuid(), Name = "Supplier 1", CreatedBy = "Admin" };
        var supplier2 = new Supplier { Id = Guid.NewGuid(), Name = "Supplier 2", CreatedBy = "Admin" };
        await context.Suppliers!.AddRangeAsync(supplier1, supplier2);

        var sub1 = new BiddingSubmission { Id = Guid.NewGuid(), ProcurementProjectId = project.Id, SupplierId = supplier1.Id, OriginalProposedAmount = 1_500_000m, CreatedBy = "Admin" };
        var sub2 = new BiddingSubmission { Id = Guid.NewGuid(), ProcurementProjectId = project.Id, SupplierId = supplier2.Id, OriginalProposedAmount = 1_700_000m, CreatedBy = "Admin" };
        await context.BiddingSubmissions!.AddRangeAsync(sub1, sub2);

        var open1 = new BidOpeningRecord { Id = Guid.NewGuid(), BiddingSubmissionId = sub1.Id, Envelope1Result = "Passed", Envelope2Opened = true, AsReadBidAmount = 1_500_000m, CreatedBy = "Admin" };
        var open2 = new BidOpeningRecord { Id = Guid.NewGuid(), BiddingSubmissionId = sub2.Id, Envelope1Result = "Passed", Envelope2Opened = true, AsReadBidAmount = 1_700_000m, CreatedBy = "Admin" };
        sub1.BidOpeningRecord = open1;
        sub2.BidOpeningRecord = open2;
        await context.BidOpeningRecords!.AddRangeAsync(open1, open2);
        await context.SaveChangesAsync();

        // Evaluate Bids
        var evalHandler = new EvaluateProjectBidsCommandHandler(uow, currentUserService);
        await evalHandler.Handle(new EvaluateProjectBidsCommand
        {
            ProjectId = project.Id,
            Request = new EvaluateProjectBidsRequest
            {
                AwardCriterion = "LCRB",
                Bidders =
                [
                    new BidderEvaluationInput { BidOpeningRecordId = open1.Id, EvaluatedBidPrice = 1_500_000m, IsResponsive = true },
                    new BidderEvaluationInput { BidOpeningRecordId = open2.Id, EvaluatedBidPrice = 1_700_000m, IsResponsive = true }
                ]
            }
        }, CancellationToken.None);

        var queryHandler = new GetProjectBidEvaluationQueryHandler(uow);
        var evalQuery = await queryHandler.Handle(new GetProjectBidEvaluationQuery(project.Id), CancellationToken.None);

        var rank1Bid = evalQuery.Data!.EvaluatedBids[0];
        var rank2Bid = evalQuery.Data!.EvaluatedBids[1];

        // Fail Post-Qualification for Rank 1
        var postQualResultHandler = new RecordPostQualificationResultCommandHandler(uow, currentUserService);
        var failResult = await postQualResultHandler.Handle(new RecordPostQualificationResultCommand
        {
            ProjectId = project.Id,
            Request = new RecordPostQualificationResultRequest
            {
                BiddingEvaluatedBidId = rank1Bid.Id,
                Passed = false,
                Findings = "Failed NFCC financial capacity requirement."
            }
        }, CancellationToken.None);

        failResult.Succeeded.Should().BeTrue();

        // Query again: Rank 1 should be Disqualified, and Rank 2 should now have an active Post-Qualification record
        var updatedQuery = await queryHandler.Handle(new GetProjectBidEvaluationQuery(project.Id), CancellationToken.None);
        
        var updatedRank1 = updatedQuery.Data!.EvaluatedBids.First(b => b.Id == rank1Bid.Id);
        var updatedRank2 = updatedQuery.Data!.EvaluatedBids.First(b => b.Id == rank2Bid.Id);

        updatedRank1.Status.Should().Be("Disqualified");
        updatedRank1.PostQualification!.Status.Should().Be("Disqualified");

        // Rank 2 was cascaded into
        updatedRank2.PostQualification.Should().NotBeNull();
        updatedRank2.PostQualification!.Status.Should().Be("PendingDocs");
    }
}
