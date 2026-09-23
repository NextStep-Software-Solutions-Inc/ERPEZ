using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Dashboard.Application.UnitTests.Features.Procurement.NoticeOfAwards;
using ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.RecordBidOpening;
using ERPEZ.Application.Features.Procurement.BidEvaluations.Dtos;
using ERPEZ.Application.Features.Procurement.BidEvaluations.Queries.GetProjectBiddingSubmissions;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Procurement.BidEvaluations;

public class BiddingConfidentialityAndItemOpeningTests
{
    private readonly TestCurrentUserService currentUserService = new();

    [Fact]
    public async Task GetProjectBiddingSubmissions_WhenEnvelope2NotOpened_MasksFinancialDataAndDocuments()
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var uow = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var project = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "IT Equipment Procurement",
            ABC = 1_000_000m,
            Status = "Active",
            CreatedBy = "Admin"
        };
        await context.ProcurementProjects!.AddAsync(project);

        var supplier = new Supplier
        {
            Id = Guid.NewGuid(),
            Name = "Tech Solutions Inc.",
            TINNumber = "123-456-789-000",
            BusinessPermitNo = "BP-12345",
            Status = "Active",
            CreatedBy = "Admin"
        };
        await context.Suppliers!.AddAsync(supplier);

        var app = new PublicSupplierApplication
        {
            Id = Guid.NewGuid(),
            ProcurementProjectId = project.Id,
            CompanyName = supplier.Name,
            TinNumber = supplier.TINNumber,
            Status = "Submitted",
            CreatedBy = "PublicPortal",
            UploadedDocuments = new List<ApplicationUploadedDocument>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    OriginalFileName = "EligibilityDocs.pdf",
                    BlobStorageUrl = "https://storage.local/files/tech_eligibility.pdf",
                    ChecklistItem = new ProjectDocumentChecklist
                    {
                        Id = Guid.NewGuid(),
                        ProcurementProjectId = project.Id,
                        EnvelopeType = 1,
                        CustomDocumentName = "Eligibility Documents",
                        CreatedBy = "Admin"
                    },
                    CreatedBy = "PublicPortal"
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    OriginalFileName = "FinancialBidForm.pdf",
                    BlobStorageUrl = "https://storage.local/files/tech_financial.pdf",
                    ChecklistItem = new ProjectDocumentChecklist
                    {
                        Id = Guid.NewGuid(),
                        ProcurementProjectId = project.Id,
                        EnvelopeType = 2,
                        CustomDocumentName = "Financial Bid Form",
                        CreatedBy = "Admin"
                    },
                    CreatedBy = "PublicPortal"
                }
            }
        };
        await context.PublicSupplierApplications!.AddAsync(app);

        var submission = new BiddingSubmission
        {
            Id = Guid.NewGuid(),
            ProcurementProjectId = project.Id,
            SupplierId = supplier.Id,
            PublicSupplierApplicationId = app.Id,
            OriginalProposedAmount = 850_000m,
            SubmissionType = "Electronic",
            CreatedBy = "PublicPortal",
            BiddingSubmissionItems = new List<BiddingSubmissionItem>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    ProcurementProjectItemId = Guid.NewGuid(),
                    Quantity = 10,
                    Uom = "Unit",
                    UnitPrice = 85_000m,
                    TotalPrice = 850_000m,
                    CreatedBy = "PublicPortal"
                }
            }
        };
        await context.BiddingSubmissions!.AddAsync(submission);
        await context.SaveChangesAsync();

        var handler = new GetProjectBiddingSubmissionsQueryHandler(uow);
        var result = await handler.Handle(new GetProjectBiddingSubmissionsQuery(project.Id), CancellationToken.None);

        result.Should().NotBeNull();
        result.Data.Should().NotBeNull();
        result.Data!.Should().HaveCount(1);
        var subResponse = result.Data!.First();

        // Confidentiality checks
        subResponse.OriginalProposedAmount.Should().BeNull();
        subResponse.IsFinancialOpened.Should().BeFalse();
        subResponse.Items.Should().BeNull();

        // Document masking checks
        var env1Doc = subResponse.Documents.First(d => d.EnvelopeType == 1);
        env1Doc.Url.Should().Be("https://storage.local/files/tech_eligibility.pdf");

        var env2Doc = subResponse.Documents.First(d => d.EnvelopeType == 2);
        env2Doc.Url.Should().BeNull("Financial proposal documents must remain masked until unsealed");
    }

    [Fact]
    public async Task GetProjectBiddingSubmissions_WhenEnvelope2Opened_RevealsFinancialDataAndItems()
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var uow = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var itemId = Guid.NewGuid();
        var cprItem = new ConsolidatedPRItem
        {
            Id = itemId,
            PRItem = new PRItem
            {
                Id = Guid.NewGuid(),
                Name = "Server Rack 42U",
                Description = "Standard Server Rack",
                RequestedQuantity = 5,
                UnitCost = 100_000m,
                CreatedBy = "Admin"
            },
            CreatedBy = "Admin"
        };
        var cpr = new ConsolidatedPR
        {
            Id = Guid.NewGuid(),
            CPRNumber = "CPR-2026-001",
            CreatedBy = "Admin",
            ConsolidatedPRItems = new List<ConsolidatedPRItem> { cprItem }
        };
        await context.ConsolidatedPRs!.AddAsync(cpr);

        var project = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "Data Center Upgrade",
            ABC = 500_000m,
            ConsolidatedPRId = cpr.Id,
            Status = "Active",
            CreatedBy = "Admin"
        };
        await context.ProcurementProjects!.AddAsync(project);

        var supplier = new Supplier
        {
            Id = Guid.NewGuid(),
            Name = "ServerTech Phils",
            TINNumber = "987-654-321-000",
            BusinessPermitNo = "BP-67890",
            Status = "Active",
            CreatedBy = "Admin"
        };
        await context.Suppliers!.AddAsync(supplier);

        var app = new PublicSupplierApplication
        {
            Id = Guid.NewGuid(),
            ProcurementProjectId = project.Id,
            CompanyName = supplier.Name,
            TinNumber = supplier.TINNumber,
            Status = "Submitted",
            CreatedBy = "PublicPortal",
            UploadedDocuments = new List<ApplicationUploadedDocument>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    OriginalFileName = "PriceSchedule.pdf",
                    BlobStorageUrl = "https://storage.local/files/priceschedule.pdf",
                    ChecklistItem = new ProjectDocumentChecklist
                    {
                        Id = Guid.NewGuid(),
                        ProcurementProjectId = project.Id,
                        EnvelopeType = 2,
                        CustomDocumentName = "Price Schedule",
                        CreatedBy = "Admin"
                    },
                    CreatedBy = "PublicPortal"
                }
            }
        };
        await context.PublicSupplierApplications!.AddAsync(app);

        var submission = new BiddingSubmission
        {
            Id = Guid.NewGuid(),
            ProcurementProjectId = project.Id,
            SupplierId = supplier.Id,
            PublicSupplierApplicationId = app.Id,
            OriginalProposedAmount = 450_000m,
            SubmissionType = "Electronic",
            CreatedBy = "PublicPortal",
            BiddingSubmissionItems = new List<BiddingSubmissionItem>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    ProcurementProjectItemId = itemId,
                    Quantity = 5,
                    Uom = "Unit",
                    UnitPrice = 90_000m,
                    TotalPrice = 450_000m,
                    Brand = "APC",
                    Model = "NetShelter SX",
                    CreatedBy = "PublicPortal"
                }
            },
            BidOpeningRecord = new BidOpeningRecord
            {
                Id = Guid.NewGuid(),
                Envelope1Result = "Passed",
                Envelope2Opened = true,
                AsReadBidAmount = 450_000m,
                OpenedByName = "BAC Chairperson",
                OpenedAt = DateTime.UtcNow,
                CreatedBy = "BAC Chairperson"
            }
        };
        await context.BiddingSubmissions!.AddAsync(submission);
        await context.SaveChangesAsync();

        var handler = new GetProjectBiddingSubmissionsQueryHandler(uow);
        var result = await handler.Handle(new GetProjectBiddingSubmissionsQuery(project.Id), CancellationToken.None);

        result.Should().NotBeNull();
        result.Data.Should().NotBeNull();
        var subResponse = result.Data!.First();

        subResponse.OriginalProposedAmount.Should().Be(450_000m);
        subResponse.IsFinancialOpened.Should().BeTrue();
        subResponse.Items.Should().NotBeNull().And.HaveCount(1);

        var item = subResponse.Items!.First();
        item.ProcurementProjectItemId.Should().Be(itemId);
        item.ItemName.Should().Be("Server Rack 42U");
        item.Quantity.Should().Be(5);
        item.UnitPrice.Should().Be(90_000m);
        item.TotalPrice.Should().Be(450_000m);
        item.Brand.Should().Be("APC");
        item.Model.Should().Be("NetShelter SX");

        var doc = subResponse.Documents.First(d => d.EnvelopeType == 2);
        doc.Url.Should().Be("https://storage.local/files/priceschedule.pdf");
    }

    [Fact]
    public async Task RecordBidOpening_WhenDiscrepancyWithoutRemarks_ThrowsValidationException()
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var uow = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var project = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "Office Furniture Project",
            ABC = 1_000_000m,
            Status = "Active",
            CreatedBy = "Admin"
        };
        await context.ProcurementProjects!.AddAsync(project);

        var supplier = new Supplier
        {
            Id = Guid.NewGuid(),
            Name = "Office Decor Inc.",
            TINNumber = "111-222-333-000",
            BusinessPermitNo = "BP-11111",
            Status = "Active",
            CreatedBy = "Admin"
        };
        await context.Suppliers!.AddAsync(supplier);

        var submission = new BiddingSubmission
        {
            Id = Guid.NewGuid(),
            ProcurementProjectId = project.Id,
            SupplierId = supplier.Id,
            OriginalProposedAmount = 900_000m,
            SubmissionType = "Electronic",
            CreatedBy = "PublicPortal"
        };
        await context.BiddingSubmissions!.AddAsync(submission);
        await context.SaveChangesAsync();

        var handler = new RecordBidOpeningCommandHandler(uow, currentUserService);
        var command = new RecordBidOpeningCommand
        {
            ProjectId = project.Id,
            Request = new RecordBidOpeningRequest
            {
                BiddingSubmissionId = submission.Id,
                Envelope1Result = "Passed",
                Envelope2Opened = true,
                AsReadBidAmount = 880_000m, // Discrepancy: 900k vs 880k
                Remarks = "" // Blank remarks
            }
        };

        var act = async () => await handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<FluentValidation.ValidationException>()
            .WithMessage("*variance exists between the supplier-submitted amount*");
    }

    [Fact]
    public async Task RecordBidOpening_WhenDiscrepancyWithRemarks_RecordsAsReadWithoutOverwritingSubmittedAmount()
    {
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var uow = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var project = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "Office Furniture Project",
            ABC = 1_000_000m,
            Status = "Active",
            CreatedBy = "Admin"
        };
        await context.ProcurementProjects!.AddAsync(project);

        var supplier = new Supplier
        {
            Id = Guid.NewGuid(),
            Name = "Office Decor Inc.",
            TINNumber = "111-222-333-000",
            BusinessPermitNo = "BP-11111",
            Status = "Active",
            CreatedBy = "Admin"
        };
        await context.Suppliers!.AddAsync(supplier);

        var submission = new BiddingSubmission
        {
            Id = Guid.NewGuid(),
            ProcurementProjectId = project.Id,
            SupplierId = supplier.Id,
            OriginalProposedAmount = 900_000m,
            SubmissionType = "Electronic",
            CreatedBy = "PublicPortal"
        };
        await context.BiddingSubmissions!.AddAsync(submission);
        await context.SaveChangesAsync();

        var handler = new RecordBidOpeningCommandHandler(uow, currentUserService);
        var command = new RecordBidOpeningCommand
        {
            ProjectId = project.Id,
            Request = new RecordBidOpeningRequest
            {
                BiddingSubmissionId = submission.Id,
                Envelope1Result = "Passed",
                Envelope2Opened = true,
                AsReadBidAmount = 880_000m,
                Remarks = "Bid Form reflects ₱880,000 as read aloud during the public session."
            }
        };

        var result = await handler.Handle(command, CancellationToken.None);
        result.Should().NotBeNull();

        // Verify database: AsReadBidAmount is recorded, but OriginalProposedAmount remains intact
        var updatedSubmission = await uow.BiddingSubmissionRepository.GetByIdAsync(submission.Id);
        updatedSubmission!.OriginalProposedAmount.Should().Be(900_000m, "Supplier's submitted amount must be immutable");
        updatedSubmission.BidOpeningRecord!.AsReadBidAmount.Should().Be(880_000m);
        updatedSubmission.BidOpeningRecord.Remarks.Should().Be("Bid Form reflects ₱880,000 as read aloud during the public session.");
    }
}
