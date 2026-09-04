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
        await context.ProcurementProjects.AddAsync(project);

        var supplier1 = new Supplier { Id = Guid.NewGuid(), Name = "PaxSilica Inc.", CreatedBy = "Admin" };
        var supplier2 = new Supplier { Id = Guid.NewGuid(), Name = "Techstart Inc.", CreatedBy = "Admin" };
        var supplier3 = new Supplier { Id = Guid.NewGuid(), Name = "NLink Inc.", CreatedBy = "Admin" };
        await context.Suppliers.AddRangeAsync(supplier1, supplier2, supplier3);

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
        await context.BiddingSubmissions.AddRangeAsync(sub1, sub2, sub3);

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
        await context.BidOpeningRecords.AddRangeAsync(open1, open2, open3);
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
        queryResult.Data.EvaluatedBids.Should().HaveCount(3);

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
        await context.ProcurementProjects.AddAsync(project);

        var supplier = new Supplier { Id = Guid.NewGuid(), Name = "Failed Bidder", CreatedBy = "Admin" };
        await context.Suppliers.AddAsync(supplier);

        var sub = new BiddingSubmission
        {
            Id = Guid.NewGuid(),
            ProcurementProjectId = project.Id,
            SupplierId = supplier.Id,
            OriginalProposedAmount = 10_000m,
            CreatedBy = "Admin"
        };
        await context.BiddingSubmissions.AddAsync(sub);

        var open = new BidOpeningRecord
        {
            Id = Guid.NewGuid(),
            BiddingSubmissionId = sub.Id,
            Envelope1Result = "Failed",
            Envelope2Opened = false,
            CreatedBy = "Admin"
        };
        await context.BidOpeningRecords.AddAsync(open);
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
}
