using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Dashboard.Application.UnitTests.Features.Procurement.NoticeOfAwards;
using ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.EvaluateProjectBids;
using ERPEZ.Application.Features.Procurement.BidEvaluations.Queries.GetProjectBidEvaluation;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Middlewares;
using FluentAssertions;
using FluentValidation.Results;
using Microsoft.AspNetCore.Http;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Procurement.BidEvaluations;

public class EvaluateProjectBidsCommandHandlerTests
{
    private readonly TestCurrentUserService currentUserService = new();

    [Fact]
    public async Task Handle_WithValidSubmissions_CalculatesLCRBRankingsCorrectly()
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var uow = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var project = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "Procurement of Headsets",
            ABC = 50_000m,
            Status = "Posted",
            CreatedBy = "Admin"
        };
        await context.ProcurementProjects!.AddAsync(project);

        var supplier1 = new Supplier { Id = Guid.NewGuid(), Name = "PaxSilica Inc.", CreatedBy = "Admin" };
        var supplier2 = new Supplier { Id = Guid.NewGuid(), Name = "Techstart Inc.", CreatedBy = "Admin" };
        var supplier3 = new Supplier { Id = Guid.NewGuid(), Name = "NLink Inc.", CreatedBy = "Admin" };
        await context.Suppliers!.AddRangeAsync(supplier1, supplier2, supplier3);

        var sub1 = new BiddingSubmission
        {
            Id = Guid.NewGuid(),
            ProcurementProjectId = project.Id,
            SupplierId = supplier1.Id,
            OriginalProposedAmount = 13_000m,
            CreatedBy = "Admin"
        };
        var sub2 = new BiddingSubmission
        {
            Id = Guid.NewGuid(),
            ProcurementProjectId = project.Id,
            SupplierId = supplier2.Id,
            OriginalProposedAmount = 14_000m,
            CreatedBy = "Admin"
        };
        var sub3 = new BiddingSubmission
        {
            Id = Guid.NewGuid(),
            ProcurementProjectId = project.Id,
            SupplierId = supplier3.Id,
            OriginalProposedAmount = 15_000m,
            CreatedBy = "Admin"
        };
        await context.BiddingSubmissions!.AddRangeAsync(sub1, sub2, sub3);

        var open1 = new BidOpeningRecord
        {
            Id = Guid.NewGuid(),
            BiddingSubmissionId = sub1.Id,
            Envelope1Result = "Passed",
            Envelope2Opened = true,
            AsReadBidAmount = 12_900m,
            CreatedBy = "Admin"
        };
        var open2 = new BidOpeningRecord
        {
            Id = Guid.NewGuid(),
            BiddingSubmissionId = sub2.Id,
            Envelope1Result = "Passed",
            Envelope2Opened = true,
            AsReadBidAmount = 13_500m,
            CreatedBy = "Admin"
        };
        var open3 = new BidOpeningRecord
        {
            Id = Guid.NewGuid(),
            BiddingSubmissionId = sub3.Id,
            Envelope1Result = "Passed",
            Envelope2Opened = true,
            AsReadBidAmount = 13_800m,
            CreatedBy = "Admin"
        };
        await context.BidOpeningRecords!.AddRangeAsync(open1, open2, open3);
        await context.SaveChangesAsync();

        var handler = new EvaluateProjectBidsCommandHandler(uow, currentUserService);
        var command = new EvaluateProjectBidsCommand
        {
            ProjectId = project.Id,
            Request = new EvaluateProjectBidsRequest
            {
                AwardCriterion = "LCRB",
                Bidders =
                [
                    // Intentionally send them in non-sorted order to verify backend LCRB ranking
                    new BidderEvaluationInput { BidOpeningRecordId = open2.Id, EvaluatedBidPrice = 13_500m, IsResponsive = true },
                    new BidderEvaluationInput { BidOpeningRecordId = open3.Id, EvaluatedBidPrice = 13_800m, IsResponsive = true },
                    new BidderEvaluationInput { BidOpeningRecordId = open1.Id, EvaluatedBidPrice = 12_900m, IsResponsive = true }
                ]
            }
        };

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeTrue();

        // Query authoritative evaluation
        var queryHandler = new GetProjectBidEvaluationQueryHandler(uow);
        var queryResult = await queryHandler.Handle(new GetProjectBidEvaluationQuery(project.Id), CancellationToken.None);

        queryResult.Succeeded.Should().BeTrue();
        queryResult.Data!.EvaluatedBids.Should().HaveCount(3);

        // Rank 1: Lowest price (₱12,900) - PaxSilica Inc.
        queryResult.Data.EvaluatedBids[0].SupplierId.Should().Be(supplier1.Id);
        queryResult.Data.EvaluatedBids[0].Rank.Should().Be(1);
        queryResult.Data.EvaluatedBids[0].EvaluatedBidPrice.Should().Be(12_900m);
        queryResult.Data.EvaluatedBids[0].PostQualification.Should().NotBeNull();
        queryResult.Data.EvaluatedBids[0].PostQualification!.Status.Should().Be("PendingDocs");

        // Rank 2: ₱13,500 - Techstart Inc.
        queryResult.Data.EvaluatedBids[1].SupplierId.Should().Be(supplier2.Id);
        queryResult.Data.EvaluatedBids[1].Rank.Should().Be(2);
        queryResult.Data.EvaluatedBids[1].EvaluatedBidPrice.Should().Be(13_500m);

        // Rank 3: ₱13,800 - NLink Inc.
        queryResult.Data.EvaluatedBids[2].SupplierId.Should().Be(supplier3.Id);
        queryResult.Data.EvaluatedBids[2].Rank.Should().Be(3);
        queryResult.Data.EvaluatedBids[2].EvaluatedBidPrice.Should().Be(13_800m);
    }

    [Fact]
    public async Task Handle_WhenNoPassingOpeningRecordsExist_ThrowsValidationException()
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var uow = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var project = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "Failed Opening Project",
            ABC = 50_000m,
            Status = "Posted",
            CreatedBy = "Admin"
        };
        await context.ProcurementProjects!.AddAsync(project);

        var supplier = new Supplier { Id = Guid.NewGuid(), Name = "Failed Bidder", CreatedBy = "Admin" };
        await context.Suppliers!.AddAsync(supplier);

        var sub = new BiddingSubmission
        {
            Id = Guid.NewGuid(),
            ProcurementProjectId = project.Id,
            SupplierId = supplier.Id,
            OriginalProposedAmount = 10_000m,
            CreatedBy = "Admin"
        };
        await context.BiddingSubmissions!.AddAsync(sub);

        var open = new BidOpeningRecord
        {
            Id = Guid.NewGuid(),
            BiddingSubmissionId = sub.Id,
            Envelope1Result = "Failed",
            Envelope2Opened = false,
            CreatedBy = "Admin"
        };
        await context.BidOpeningRecords!.AddAsync(open);
        await context.SaveChangesAsync();

        var handler = new EvaluateProjectBidsCommandHandler(uow, currentUserService);
        var command = new EvaluateProjectBidsCommand
        {
            ProjectId = project.Id,
            Request = new EvaluateProjectBidsRequest
            {
                AwardCriterion = "LCRB",
                Bidders =
                [
                    new BidderEvaluationInput { BidOpeningRecordId = open.Id, EvaluatedBidPrice = 10_000m, IsResponsive = true }
                ]
            }
        };

        var act = () => handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<FluentValidation.ValidationException>()
            .WithMessage("No passing bid opening records found for evaluation in this project.");
    }

    [Fact]
    public async Task GlobalExceptionHandler_WhenFluentValidationExceptionHasNoPropertyErrors_ReturnsOriginalMessageAndPopulatesErrorsDictionary()
    {
        var handler = new GlobalExceptionHandler();
        var httpContext = new DefaultHttpContext();
        httpContext.Response.Body = new MemoryStream();

        var exception = new FluentValidation.ValidationException("No passing bid opening records found for evaluation in this project.");

        var handled = await handler.TryHandleAsync(httpContext, exception, CancellationToken.None);

        handled.Should().BeTrue();
        httpContext.Response.StatusCode.Should().Be(400);

        httpContext.Response.Body.Seek(0, SeekOrigin.Begin);
        using var reader = new StreamReader(httpContext.Response.Body);
        var json = await reader.ReadToEndAsync();

        var response = JsonSerializer.Deserialize<ApiResponse<object>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        response.Should().NotBeNull();
        response!.Succeeded.Should().BeFalse();
        response.Message.Should().Be("No passing bid opening records found for evaluation in this project.");
        response.Errors.Should().NotBeNull();
        response.Errors.Should().ContainKey("General");
        response.Errors!["General"].Should().Contain("No passing bid opening records found for evaluation in this project.");
    }

    [Fact]
    public async Task GlobalExceptionHandler_WhenFluentValidationExceptionHasPropertyErrors_ReturnsFirstErrorAndPropertyErrors()
    {
        var handler = new GlobalExceptionHandler();
        var httpContext = new DefaultHttpContext();
        httpContext.Response.Body = new MemoryStream();

        var failures = new List<ValidationFailure>
        {
            new("ProjectId", "Project ID is required."),
            new("AwardCriterion", "Award criterion must be either 'LCRB' or 'MEARB'.")
        };
        var exception = new FluentValidation.ValidationException(failures);

        var handled = await handler.TryHandleAsync(httpContext, exception, CancellationToken.None);

        handled.Should().BeTrue();
        httpContext.Response.StatusCode.Should().Be(400);

        httpContext.Response.Body.Seek(0, SeekOrigin.Begin);
        using var reader = new StreamReader(httpContext.Response.Body);
        var json = await reader.ReadToEndAsync();

        var response = JsonSerializer.Deserialize<ApiResponse<object>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        response.Should().NotBeNull();
        response!.Succeeded.Should().BeFalse();
        response.Message.Should().Be("Project ID is required.");
        response.Errors.Should().NotBeNull();
        response.Errors.Should().ContainKey("ProjectId");
        response.Errors!["ProjectId"].Should().Contain("Project ID is required.");
        response.Errors.Should().ContainKey("AwardCriterion");
        response.Errors!["AwardCriterion"].Should().Contain("Award criterion must be either 'LCRB' or 'MEARB'.");
    }

    [Fact]
    public async Task Handle_WhenAwardCriterionIsEmpty_ThrowsValidationException()
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var uow = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var project = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "Missing Criterion Project",
            ABC = 50_000m,
            Status = "Posted",
            CreatedBy = "Admin"
        };
        await context.ProcurementProjects!.AddAsync(project);
        await context.SaveChangesAsync();

        var handler = new EvaluateProjectBidsCommandHandler(uow, currentUserService);
        var command = new EvaluateProjectBidsCommand
        {
            ProjectId = project.Id,
            Request = new EvaluateProjectBidsRequest
            {
                AwardCriterion = string.Empty,
                Bidders = []
            }
        };

        var act = () => handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<FluentValidation.ValidationException>()
            .WithMessage("Bid evaluation criterion has not been established for this procurement project.");
    }

    [Theory]
    [InlineData("MARB", "The evaluation methodology for criterion 'MARB' is not currently implemented in the evaluation engine.")]
    [InlineData("HRRB", "The evaluation methodology for criterion 'HRRB' is not currently implemented in the evaluation engine.")]
    [InlineData("LCCRB", "The evaluation methodology for Life-Cycle Costing (LCCRB) is not currently implemented in the evaluation engine.")]
    [InlineData("UNSUPPORTED_XYZ", "Unsupported bid evaluation criterion 'UNSUPPORTED_XYZ'.")]
    public async Task Handle_WhenAwardCriterionIsUnsupported_ThrowsValidationException(string criterion, string expectedMessage)
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var uow = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var project = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "Methodology Project",
            ABC = 50_000m,
            Status = "Posted",
            CreatedBy = "Admin"
        };
        await context.ProcurementProjects!.AddAsync(project);
        await context.SaveChangesAsync();

        var handler = new EvaluateProjectBidsCommandHandler(uow, currentUserService);
        var command = new EvaluateProjectBidsCommand
        {
            ProjectId = project.Id,
            Request = new EvaluateProjectBidsRequest
            {
                AwardCriterion = criterion,
                Bidders = []
            }
        };

        var act = () => handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<FluentValidation.ValidationException>()
            .WithMessage(expectedMessage);
    }

    [Fact]
    public async Task Handle_WhenConsultingServicesAndLCRB_ThrowsValidationException()
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var uow = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var mode = new ProcurementMode
        {
            Id = Guid.NewGuid(),
            Name = "Consulting Services",
            CreatedBy = "Admin"
        };
        await context.ProcurementModes!.AddAsync(mode);

        var project = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "Consulting Project",
            ProcurementModeId = mode.Id,
            ABC = 50_000m,
            Status = "Posted",
            CreatedBy = "Admin"
        };
        await context.ProcurementProjects!.AddAsync(project);
        await context.SaveChangesAsync();

        var handler = new EvaluateProjectBidsCommandHandler(uow, currentUserService);
        var command = new EvaluateProjectBidsCommand
        {
            ProjectId = project.Id,
            Request = new EvaluateProjectBidsRequest
            {
                AwardCriterion = "LCRB",
                Bidders = []
            }
        };

        var act = () => handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<FluentValidation.ValidationException>()
            .WithMessage("Lowest Calculated Responsive Bid (LCRB) is not applicable to Consulting Services.");
    }

    [Fact]
    public async Task Handle_WhenMEARBWeightsDoNotSumTo100_ThrowsValidationException()
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var uow = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var project = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "MEARB Weight Project",
            ABC = 50_000m,
            Status = "Posted",
            CreatedBy = "Admin"
        };
        await context.ProcurementProjects!.AddAsync(project);
        await context.SaveChangesAsync();

        var handler = new EvaluateProjectBidsCommandHandler(uow, currentUserService);
        var command = new EvaluateProjectBidsCommand
        {
            ProjectId = project.Id,
            Request = new EvaluateProjectBidsRequest
            {
                AwardCriterion = "MEARB",
                TechnicalWeight = 70m,
                FinancialWeight = 20m, // Sums to 90m
                Bidders = []
            }
        };

        var act = () => handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<FluentValidation.ValidationException>()
            .WithMessage("Most Economically Advantageous Responsive Bid (MEARB) requires valid Technical and Financial weights that sum to 100%.");
    }

    [Fact]
    public async Task Handle_WhenMEARBValid_CalculatesWeightedRankingsCorrectly()
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var uow = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var project = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "MEARB Success Project",
            ABC = 50_000m,
            Status = "Posted",
            CreatedBy = "Admin"
        };
        await context.ProcurementProjects!.AddAsync(project);

        var s1 = new Supplier { Id = Guid.NewGuid(), Name = "Supplier HighQuality", CreatedBy = "Admin" };
        var s2 = new Supplier { Id = Guid.NewGuid(), Name = "Supplier LowCost", CreatedBy = "Admin" };
        await context.Suppliers!.AddRangeAsync(s1, s2);

        var sub1 = new BiddingSubmission
        {
            Id = Guid.NewGuid(),
            ProcurementProjectId = project.Id,
            SupplierId = s1.Id,
            OriginalProposedAmount = 14_000m,
            CreatedBy = "Admin"
        };
        var sub2 = new BiddingSubmission
        {
            Id = Guid.NewGuid(),
            ProcurementProjectId = project.Id,
            SupplierId = s2.Id,
            OriginalProposedAmount = 12_000m,
            CreatedBy = "Admin"
        };
        await context.BiddingSubmissions!.AddRangeAsync(sub1, sub2);

        var open1 = new BidOpeningRecord
        {
            Id = Guid.NewGuid(),
            BiddingSubmissionId = sub1.Id,
            Envelope1Result = "Passed",
            Envelope2Opened = true,
            AsReadBidAmount = 14_000m,
            CreatedBy = "Admin"
        };
        var open2 = new BidOpeningRecord
        {
            Id = Guid.NewGuid(),
            BiddingSubmissionId = sub2.Id,
            Envelope1Result = "Passed",
            Envelope2Opened = true,
            AsReadBidAmount = 12_000m,
            CreatedBy = "Admin"
        };
        await context.BidOpeningRecords!.AddRangeAsync(open1, open2);
        await context.SaveChangesAsync();

        var handler = new EvaluateProjectBidsCommandHandler(uow, currentUserService);
        var command = new EvaluateProjectBidsCommand
        {
            ProjectId = project.Id,
            Request = new EvaluateProjectBidsRequest
            {
                AwardCriterion = "MEARB",
                TechnicalWeight = 70m,
                FinancialWeight = 30m,
                Bidders =
                [
                    new BidderEvaluationInput { BidOpeningRecordId = open1.Id, EvaluatedBidPrice = 14_000m, TechnicalScore = 95m, IsResponsive = true },
                    new BidderEvaluationInput { BidOpeningRecordId = open2.Id, EvaluatedBidPrice = 12_000m, TechnicalScore = 70m, IsResponsive = true }
                ]
            }
        };

        var result = await handler.Handle(command, CancellationToken.None);
        result.Succeeded.Should().BeTrue();

        var queryHandler = new GetProjectBidEvaluationQueryHandler(uow);
        var evalResult = await queryHandler.Handle(new GetProjectBidEvaluationQuery(project.Id), CancellationToken.None);

        evalResult.Succeeded.Should().BeTrue();
        evalResult.Data!.AwardCriterion.Should().Be("MEARB");
        evalResult.Data!.TechnicalWeight.Should().Be(70m);
        evalResult.Data!.FinancialWeight.Should().Be(30m);
        evalResult.Data!.EvaluatedBids.Should().HaveCount(2);

        // s1 wins Rank 1 under MEARB due to 95 tech score:
        evalResult.Data!.EvaluatedBids[0].SupplierId.Should().Be(s1.Id);
        evalResult.Data!.EvaluatedBids[0].Rank.Should().Be(1);
        evalResult.Data!.EvaluatedBids[0].TotalScore.Should().BeApproximately(92.21m, 0.05m);

        evalResult.Data!.EvaluatedBids[1].SupplierId.Should().Be(s2.Id);
        evalResult.Data!.EvaluatedBids[1].Rank.Should().Be(2);
        evalResult.Data!.EvaluatedBids[1].TotalScore.Should().Be(79.00m);
    }

    [Fact]
    public async Task Handle_ReEvaluationSafeguards_WhenAwardRecommendationExists_ThrowsValidationException()
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var uow = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var project = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "Award Rec Exists Project",
            ABC = 50_000m,
            Status = "Posted",
            CreatedBy = "Admin"
        };
        await context.ProcurementProjects!.AddAsync(project);

        var evaluation = new BiddingEvaluation
        {
            Id = Guid.NewGuid(),
            ProcurementProjectId = project.Id,
            AwardCriterion = "LCRB",
            Status = "Draft",
            CreatedBy = "Admin"
        };
        await context.BiddingEvaluations!.AddAsync(evaluation);

        var supplier = new Supplier { Id = Guid.NewGuid(), Name = "PaxSilica Inc.", CreatedBy = "Admin" };
        await context.Suppliers!.AddAsync(supplier);

        var awardRec = new BiddingAwardRecommendation
        {
            Id = Guid.NewGuid(),
            ProcurementProjectId = project.Id,
            WinningSupplierId = supplier.Id,
            BiddingPostQualificationId = Guid.NewGuid(),
            AwardedAmount = 12_900m,
            AwardCriterion = "LCRB",
            CreatedBy = "Admin"
        };
        await context.BiddingAwardRecommendations!.AddAsync(awardRec);
        await context.SaveChangesAsync();

        var handler = new EvaluateProjectBidsCommandHandler(uow, currentUserService);
        var command = new EvaluateProjectBidsCommand
        {
            ProjectId = project.Id,
            Request = new EvaluateProjectBidsRequest
            {
                AwardCriterion = "LCRB",
                Bidders = []
            }
        };

        var act = () => handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<FluentValidation.ValidationException>()
            .WithMessage("Cannot re-evaluate bids: An award recommendation has already been established for this project.");
    }

    [Fact]
    public async Task Handle_ReEvaluationSafeguards_WhenPostQualAlreadyPassed_ThrowsValidationException()
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var uow = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var project = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "Passed PostQual Project",
            ABC = 50_000m,
            Status = "Posted",
            CreatedBy = "Admin"
        };
        await context.ProcurementProjects!.AddAsync(project);

        var evaluation = new BiddingEvaluation
        {
            Id = Guid.NewGuid(),
            ProcurementProjectId = project.Id,
            AwardCriterion = "LCRB",
            Status = "Draft",
            CreatedBy = "Admin"
        };
        await context.BiddingEvaluations!.AddAsync(evaluation);

        var evaluatedBid = new BiddingEvaluatedBid
        {
            Id = Guid.NewGuid(),
            BiddingEvaluationId = evaluation.Id,
            BidOpeningRecordId = Guid.NewGuid(),
            SupplierId = Guid.NewGuid(),
            EvaluatedBidPrice = 12_900m,
            Rank = 1,
            Status = "Passed_PostQual",
            IsResponsive = true,
            CreatedBy = "Admin"
        };
        await context.BiddingEvaluatedBids!.AddAsync(evaluatedBid);
        await context.SaveChangesAsync();

        var handler = new EvaluateProjectBidsCommandHandler(uow, currentUserService);
        var command = new EvaluateProjectBidsCommand
        {
            ProjectId = project.Id,
            Request = new EvaluateProjectBidsRequest
            {
                AwardCriterion = "LCRB",
                Bidders = []
            }
        };

        var act = () => handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<FluentValidation.ValidationException>()
            .WithMessage("Cannot re-evaluate bids: A candidate has already successfully passed post-qualification verification.");
    }

    [Fact]
    public async Task Handle_ReEvaluationSafeguards_WhenCandidatePostDisqualified_ThrowsValidationException()
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var uow = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var project = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "Disqualified PostQual Project",
            ABC = 50_000m,
            Status = "Posted",
            CreatedBy = "Admin"
        };
        await context.ProcurementProjects!.AddAsync(project);

        var evaluation = new BiddingEvaluation
        {
            Id = Guid.NewGuid(),
            ProcurementProjectId = project.Id,
            AwardCriterion = "LCRB",
            Status = "Draft",
            CreatedBy = "Admin"
        };
        await context.BiddingEvaluations!.AddAsync(evaluation);

        var evaluatedBid = new BiddingEvaluatedBid
        {
            Id = Guid.NewGuid(),
            BiddingEvaluationId = evaluation.Id,
            BidOpeningRecordId = Guid.NewGuid(),
            SupplierId = Guid.NewGuid(),
            EvaluatedBidPrice = 12_900m,
            Rank = 1,
            Status = "Disqualified",
            IsResponsive = true,
            CreatedBy = "Admin"
        };
        await context.BiddingEvaluatedBids!.AddAsync(evaluatedBid);

        var postQual = new BiddingPostQualification
        {
            Id = Guid.NewGuid(),
            BiddingEvaluatedBidId = evaluatedBid.Id,
            Status = "Disqualified",
            Passed = false,
            CreatedBy = "Admin"
        };
        await context.BiddingPostQualifications!.AddAsync(postQual);
        await context.SaveChangesAsync();

        var handler = new EvaluateProjectBidsCommandHandler(uow, currentUserService);
        var command = new EvaluateProjectBidsCommand
        {
            ProjectId = project.Id,
            Request = new EvaluateProjectBidsRequest
            {
                AwardCriterion = "LCRB",
                Bidders = []
            }
        };

        var act = () => handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<FluentValidation.ValidationException>()
            .WithMessage("Cannot re-evaluate bids: Post-qualification has already been concluded for one or more candidates.");
    }

    [Fact]
    public async Task Handle_WhenMEARB_ResponsiveBidderMissingTechnicalScore_ThrowsValidationException()
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var uow = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var project = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "MEARB Missing Tech Score Project",
            ABC = 50_000m,
            Status = "Posted",
            CreatedBy = "Admin"
        };
        await context.ProcurementProjects!.AddAsync(project);

        var supplier = new Supplier { Id = Guid.NewGuid(), Name = "Supplier Alpha", CreatedBy = "Admin" };
        await context.Suppliers!.AddAsync(supplier);

        var sub = new BiddingSubmission
        {
            Id = Guid.NewGuid(),
            ProcurementProjectId = project.Id,
            SupplierId = supplier.Id,
            OriginalProposedAmount = 14_000m,
            CreatedBy = "Admin"
        };
        await context.BiddingSubmissions!.AddAsync(sub);

        var open = new BidOpeningRecord
        {
            Id = Guid.NewGuid(),
            BiddingSubmissionId = sub.Id,
            Envelope1Result = "Passed",
            Envelope2Opened = true,
            AsReadBidAmount = 14_000m,
            CreatedBy = "Admin"
        };
        await context.BidOpeningRecords!.AddAsync(open);
        await context.SaveChangesAsync();

        var handler = new EvaluateProjectBidsCommandHandler(uow, currentUserService);
        var command = new EvaluateProjectBidsCommand
        {
            ProjectId = project.Id,
            Request = new EvaluateProjectBidsRequest
            {
                AwardCriterion = "MEARB",
                TechnicalWeight = 60m,
                FinancialWeight = 40m,
                Bidders =
                [
                    new BidderEvaluationInput
                    {
                        BidOpeningRecordId = open.Id,
                        EvaluatedBidPrice = 14_000m,
                        TechnicalScore = null, // Missing!
                        IsResponsive = true
                    }
                ]
            }
        };

        var act = () => handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<FluentValidation.ValidationException>()
            .WithMessage("*Technical score is required for all responsive bidders under MEARB evaluation*");
    }

    [Theory]
    [InlineData(-5)]
    [InlineData(105)]
    public async Task Handle_WhenMEARB_TechnicalScoreOutOfRange_ThrowsValidationException(decimal invalidScore)
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var uow = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var project = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "MEARB Invalid Tech Score Project",
            ABC = 50_000m,
            Status = "Posted",
            CreatedBy = "Admin"
        };
        await context.ProcurementProjects!.AddAsync(project);

        var supplier = new Supplier { Id = Guid.NewGuid(), Name = "Supplier Beta", CreatedBy = "Admin" };
        await context.Suppliers!.AddAsync(supplier);

        var sub = new BiddingSubmission
        {
            Id = Guid.NewGuid(),
            ProcurementProjectId = project.Id,
            SupplierId = supplier.Id,
            OriginalProposedAmount = 14_000m,
            CreatedBy = "Admin"
        };
        await context.BiddingSubmissions!.AddAsync(sub);

        var open = new BidOpeningRecord
        {
            Id = Guid.NewGuid(),
            BiddingSubmissionId = sub.Id,
            Envelope1Result = "Passed",
            Envelope2Opened = true,
            AsReadBidAmount = 14_000m,
            CreatedBy = "Admin"
        };
        await context.BidOpeningRecords!.AddAsync(open);
        await context.SaveChangesAsync();

        var handler = new EvaluateProjectBidsCommandHandler(uow, currentUserService);
        var command = new EvaluateProjectBidsCommand
        {
            ProjectId = project.Id,
            Request = new EvaluateProjectBidsRequest
            {
                AwardCriterion = "MEARB",
                TechnicalWeight = 60m,
                FinancialWeight = 40m,
                Bidders =
                [
                    new BidderEvaluationInput
                    {
                        BidOpeningRecordId = open.Id,
                        EvaluatedBidPrice = 14_000m,
                        TechnicalScore = invalidScore,
                        IsResponsive = true
                    }
                ]
            }
        };

        var act = () => handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<FluentValidation.ValidationException>()
            .WithMessage("*must be between 0 and 100*");
    }

    [Fact]
    public async Task Handle_WhenMEARB_RealisticNon7030_HigherPriceTechnicallyStrongerBidderWins()
    {
        // Controlled test scenario:
        // ABC = ₱10,000,000
        // Weighting: 60% Technical / 40% Financial
        // Supplier LowCost: ₱8,000,000 bid, 78.00 technical score -> NormFin = 100.00, TotalScore = 86.80
        // Supplier HighQuality: ₱9,000,000 bid, 96.00 technical score -> NormFin = 88.89, TotalScore = 93.16
        // HighQuality wins Rank 1 despite being ₱1,000,000 higher in price.
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var uow = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var project = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "MEARB Enterprise Software Solution",
            ABC = 10_000_000m,
            Status = "Posted",
            CreatedBy = "Admin"
        };
        await context.ProcurementProjects!.AddAsync(project);

        var supLowCost = new Supplier { Id = Guid.NewGuid(), Name = "LowCost Vendor Inc.", CreatedBy = "Admin" };
        var supHighQuality = new Supplier { Id = Guid.NewGuid(), Name = "HighQuality Solutions Corp.", CreatedBy = "Admin" };
        await context.Suppliers!.AddRangeAsync(supLowCost, supHighQuality);

        var subLowCost = new BiddingSubmission
        {
            Id = Guid.NewGuid(),
            ProcurementProjectId = project.Id,
            SupplierId = supLowCost.Id,
            OriginalProposedAmount = 8_000_000m,
            CreatedBy = "Admin"
        };
        var subHighQuality = new BiddingSubmission
        {
            Id = Guid.NewGuid(),
            ProcurementProjectId = project.Id,
            SupplierId = supHighQuality.Id,
            OriginalProposedAmount = 9_000_000m,
            CreatedBy = "Admin"
        };
        await context.BiddingSubmissions!.AddRangeAsync(subLowCost, subHighQuality);

        var openLowCost = new BidOpeningRecord
        {
            Id = Guid.NewGuid(),
            BiddingSubmissionId = subLowCost.Id,
            Envelope1Result = "Passed",
            Envelope2Opened = true,
            AsReadBidAmount = 8_000_000m,
            CreatedBy = "Admin"
        };
        var openHighQuality = new BidOpeningRecord
        {
            Id = Guid.NewGuid(),
            BiddingSubmissionId = subHighQuality.Id,
            Envelope1Result = "Passed",
            Envelope2Opened = true,
            AsReadBidAmount = 9_000_000m,
            CreatedBy = "Admin"
        };
        await context.BidOpeningRecords!.AddRangeAsync(openLowCost, openHighQuality);
        await context.SaveChangesAsync();

        var handler = new EvaluateProjectBidsCommandHandler(uow, currentUserService);
        var command = new EvaluateProjectBidsCommand
        {
            ProjectId = project.Id,
            Request = new EvaluateProjectBidsRequest
            {
                AwardCriterion = "MEARB",
                TechnicalWeight = 60m,
                FinancialWeight = 40m,
                Bidders =
                [
                    new BidderEvaluationInput
                    {
                        BidOpeningRecordId = openLowCost.Id,
                        EvaluatedBidPrice = 8_000_000m,
                        TechnicalScore = 78.00m,
                        IsResponsive = true
                    },
                    new BidderEvaluationInput
                    {
                        BidOpeningRecordId = openHighQuality.Id,
                        EvaluatedBidPrice = 9_000_000m,
                        TechnicalScore = 96.00m,
                        IsResponsive = true
                    }
                ]
            }
        };

        var result = await handler.Handle(command, CancellationToken.None);
        result.Succeeded.Should().BeTrue();

        var queryHandler = new GetProjectBidEvaluationQueryHandler(uow);
        var evalResult = await queryHandler.Handle(new GetProjectBidEvaluationQuery(project.Id), CancellationToken.None);

        evalResult.Succeeded.Should().BeTrue();
        evalResult.Data!.AwardCriterion.Should().Be("MEARB");
        evalResult.Data!.TechnicalWeight.Should().Be(60m);
        evalResult.Data!.FinancialWeight.Should().Be(40m);
        evalResult.Data!.EvaluatedBids.Should().HaveCount(2);

        // Rank 1: HighQuality Solutions Corp. (₱9M, Tech: 96, NormFin: 88.89, Total: 93.16)
        var rank1 = evalResult.Data.EvaluatedBids[0];
        rank1.SupplierId.Should().Be(supHighQuality.Id);
        rank1.Rank.Should().Be(1);
        rank1.EvaluatedBidPrice.Should().Be(9_000_000m);
        rank1.TechnicalScore.Should().Be(96.00m);
        rank1.NormalizedFinancialScore.Should().Be(88.89m);
        rank1.TotalScore.Should().Be(93.16m);
        rank1.PostQualification.Should().NotBeNull();

        // Rank 2: LowCost Vendor Inc. (₱8M, Tech: 78, NormFin: 100.00, Total: 86.80)
        var rank2 = evalResult.Data.EvaluatedBids[1];
        rank2.SupplierId.Should().Be(supLowCost.Id);
        rank2.Rank.Should().Be(2);
        rank2.EvaluatedBidPrice.Should().Be(8_000_000m);
        rank2.TechnicalScore.Should().Be(78.00m);
        rank2.NormalizedFinancialScore.Should().Be(100.00m);
        rank2.TotalScore.Should().Be(86.80m);
    }

    [Fact]
    public async Task Handle_WhenCompletedEvaluationExists_AttemptToChangeCriterionOrWeights_ThrowsValidationException()
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var uow = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var project = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "Completed Evaluation Project",
            ABC = 10_000_000m,
            Status = "Posted",
            CreatedBy = "Admin"
        };
        await context.ProcurementProjects!.AddAsync(project);

        var supplier = new Supplier { Id = Guid.NewGuid(), Name = "Supplier Delta", CreatedBy = "Admin" };
        await context.Suppliers!.AddAsync(supplier);

        var sub = new BiddingSubmission
        {
            Id = Guid.NewGuid(),
            ProcurementProjectId = project.Id,
            SupplierId = supplier.Id,
            OriginalProposedAmount = 8_000_000m,
            CreatedBy = "Admin"
        };
        await context.BiddingSubmissions!.AddAsync(sub);

        var open = new BidOpeningRecord
        {
            Id = Guid.NewGuid(),
            BiddingSubmissionId = sub.Id,
            Envelope1Result = "Passed",
            Envelope2Opened = true,
            AsReadBidAmount = 8_000_000m,
            CreatedBy = "Admin"
        };
        await context.BidOpeningRecords!.AddAsync(open);

        // Pre-create a completed evaluation under MEARB 60/40
        var evaluation = new BiddingEvaluation
        {
            Id = Guid.NewGuid(),
            ProcurementProjectId = project.Id,
            AwardCriterion = "MEARB",
            TechnicalWeight = 60m,
            FinancialWeight = 40m,
            Status = "Completed",
            CreatedBy = "Admin"
        };
        await context.BiddingEvaluations!.AddAsync(evaluation);
        await context.SaveChangesAsync();

        var handler = new EvaluateProjectBidsCommandHandler(uow, currentUserService);

        // Attempt 1: Changing criterion from MEARB to LCRB
        var switchCriterionCommand = new EvaluateProjectBidsCommand
        {
            ProjectId = project.Id,
            Request = new EvaluateProjectBidsRequest
            {
                AwardCriterion = "LCRB",
                Bidders =
                [
                    new BidderEvaluationInput
                    {
                        BidOpeningRecordId = open.Id,
                        EvaluatedBidPrice = 8_000_000m,
                        IsResponsive = true
                    }
                ]
            }
        };

        var actSwitch = () => handler.Handle(switchCriterionCommand, CancellationToken.None);
        await actSwitch.Should().ThrowAsync<FluentValidation.ValidationException>()
            .WithMessage("Cannot change evaluation criterion from 'MEARB' to 'LCRB' for a completed bid evaluation.");

        // Attempt 2: Changing MEARB weights from 60/40 to 50/50
        var alterWeightsCommand = new EvaluateProjectBidsCommand
        {
            ProjectId = project.Id,
            Request = new EvaluateProjectBidsRequest
            {
                AwardCriterion = "MEARB",
                TechnicalWeight = 50m,
                FinancialWeight = 50m,
                Bidders =
                [
                    new BidderEvaluationInput
                    {
                        BidOpeningRecordId = open.Id,
                        EvaluatedBidPrice = 8_000_000m,
                        TechnicalScore = 85m,
                        IsResponsive = true
                    }
                ]
            }
        };

        var actAlter = () => handler.Handle(alterWeightsCommand, CancellationToken.None);
        await actAlter.Should().ThrowAsync<FluentValidation.ValidationException>()
            .WithMessage("Cannot change MEARB weights after evaluation has been completed. Existing methodology is locked at 60% Technical / 40% Financial.");
    }
}
