using Dashboard.Application.UnitTests.Features.Procurement.AOB;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Queries.GetRFQs;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Queries.GetRFQSupplierBids;
using ERPEZ.Application.Features.Procurement.SupplierPortal.Commands.SubmitPublicApplication;
using ERPEZ.Application.Features.Procurement.SupplierPortal.Commands.ValidatePublicApplication;
using ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetPublicProjectDetail;
using ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetPublicProjects;
using ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetPublicProjectStats;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Infrastructure.Persistence;
using ERPEZ.Shared.Exceptions;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Sieve.Services;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Procurement.SupplierPortal;

public class PublicProjectsRFQIntegrationTests
{
    private static ApplicationDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    private static IUnitOfWork CreateUnitOfWork(ApplicationDbContext context)
    {
        var services = new ServiceCollection();
        services.AddScoped<ISieveProcessor, SieveProcessor>();
        services.AddSingleton<Microsoft.Extensions.Options.IOptions<Sieve.Models.SieveOptions>>(new SieveOptionsAccessor());
        var serviceProvider = services.BuildServiceProvider();
        return new UnitOfWork(context, serviceProvider);
    }

    [Fact]
    public async Task GetPublicProjects_ShouldIncludeApprovedRFQsAlongsideProjects()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var svpMode = new ProcurementMode { Id = Guid.NewGuid(), Name = "Small Value Procurement (SVP)" };
        context.ProcurementModes?.Add(svpMode);

        var pbProject = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "Public Bidding Laboratory Equipment",
            ContractNo = "ITB-2026-PB-001",
            Status = "Posted",
            ABC = 5000000m
        };
        context.ProcurementProjects?.Add(pbProject);

        var approvedRfq = new RFQ
        {
            Id = Guid.NewGuid(),
            RFQNumber = "RFQ-2026-SVP-003",
            Description = "Procurement of IT Workstations",
            Status = StatusEnum.Approved,
            TotalAmount = 850000m,
            ModeOfProcurementId = svpMode.Id,
            ModeOfProcurement = svpMode,
            Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-2)),
            Deadline = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7))
        };
        context.RFQs?.Add(approvedRfq);
        await context.SaveChangesAsync();

        var handler = new GetPublicProjectsQueryHandler(unitOfWork);

        // Act
        var result = await handler.Handle(new GetPublicProjectsQuery { PageNumber = 1, PageSize = 50 }, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().HaveCount(2);
        result.Data.Should().Contain(p => p.ContractNo == "RFQ-2026-SVP-003" && p.Title == "Procurement of IT Workstations");
        result.Data.Should().Contain(p => p.ContractNo == "ITB-2026-PB-001");
    }

    [Fact]
    public async Task GetPublicProjects_ModeSmallValueProcurement_ShouldIncludeApprovedSvpRFQsAndExcludePublicBidding()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var svpMode = new ProcurementMode { Id = Guid.NewGuid(), Name = "Small Value Procurement (SVP)" };
        var pbMode = new ProcurementMode { Id = Guid.NewGuid(), Name = "Competitive Bidding" };
        context.ProcurementModes?.AddRange(svpMode, pbMode);

        var pbProject = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "Public Bidding Construction",
            ContractNo = "ITB-2026-PB-002",
            Status = "Posted",
            ProcurementMode = pbMode,
            ProcurementModeId = pbMode.Id,
            ABC = 10000000m
        };
        context.ProcurementProjects?.Add(pbProject);

        var approvedRfq = new RFQ
        {
            Id = Guid.NewGuid(),
            RFQNumber = "RFQ-2026-SVP-001",
            Description = "SVP Office Supplies",
            Status = StatusEnum.Approved,
            TotalAmount = 450000m,
            ModeOfProcurementId = svpMode.Id,
            ModeOfProcurement = svpMode,
            Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1)),
            Deadline = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(5))
        };
        context.RFQs?.Add(approvedRfq);
        await context.SaveChangesAsync();

        var handler = new GetPublicProjectsQueryHandler(unitOfWork);

        // Act
        var result = await handler.Handle(new GetPublicProjectsQuery { Mode = "Small Value Procurement" }, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().HaveCount(1);
        result.Data!.First().ContractNo.Should().Be("RFQ-2026-SVP-001");
    }

    [Fact]
    public async Task GetPublicProjects_ModePublicBidding_ShouldExcludeRFQs()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var svpMode = new ProcurementMode { Id = Guid.NewGuid(), Name = "Small Value Procurement (SVP)" };
        var pbMode = new ProcurementMode { Id = Guid.NewGuid(), Name = "Public Bidding" };
        context.ProcurementModes?.AddRange(svpMode, pbMode);

        var pbProject = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "High-End Servers",
            ContractNo = "ITB-2026-PB-005",
            Status = "Posted",
            ProcurementMode = pbMode,
            ProcurementModeId = pbMode.Id,
            ABC = 8000000m
        };
        context.ProcurementProjects?.Add(pbProject);

        var approvedRfq = new RFQ
        {
            Id = Guid.NewGuid(),
            RFQNumber = "RFQ-2026-SVP-004",
            Description = "SVP Laptops",
            Status = StatusEnum.Approved,
            TotalAmount = 350000m,
            ModeOfProcurementId = svpMode.Id,
            ModeOfProcurement = svpMode,
            Date = DateOnly.FromDateTime(DateTime.UtcNow)
        };
        context.RFQs?.Add(approvedRfq);
        await context.SaveChangesAsync();

        var handler = new GetPublicProjectsQueryHandler(unitOfWork);

        // Act
        var result = await handler.Handle(new GetPublicProjectsQuery { Mode = "Public Bidding" }, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().HaveCount(1);
        result.Data!.First().ContractNo.Should().Be("ITB-2026-PB-005");
    }

    [Fact]
    public async Task GetPublicProjects_WhenPublicBiddingProjectHasRfqItbPrefix_ShouldNotAppearInSvpFilter()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var svpMode = new ProcurementMode { Id = Guid.NewGuid(), Name = "Small Value Procurement (SVP)" };
        var pbMode = new ProcurementMode { Id = Guid.NewGuid(), Name = "Public Bidding" };
        context.ProcurementModes?.AddRange(svpMode, pbMode);

        // Project has "RFQ-ITB-2026-BAC-001" as ContractNo, but its mode is "Public Bidding"
        var pbProjectWithRfqPrefix = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "High-Performance Computing Cluster",
            ContractNo = "RFQ-ITB-2026-BAC-001",
            Status = "Posted",
            ProcurementMode = pbMode,
            ProcurementModeId = pbMode.Id,
            ABC = 18500000m
        };
        context.ProcurementProjects?.Add(pbProjectWithRfqPrefix);

        var svpRfq = new RFQ
        {
            Id = Guid.NewGuid(),
            RFQNumber = "RFQ-2026-SVP-003",
            Description = "Procurement of IT Workstations",
            Status = StatusEnum.Approved,
            TotalAmount = 762000m,
            ModeOfProcurementId = svpMode.Id,
            ModeOfProcurement = svpMode,
            Date = DateOnly.FromDateTime(DateTime.UtcNow)
        };
        context.RFQs?.Add(svpRfq);
        await context.SaveChangesAsync();

        var handler = new GetPublicProjectsQueryHandler(unitOfWork);

        // Act 1: Filter by Small Value Procurement
        var svpResult = await handler.Handle(new GetPublicProjectsQuery { Mode = "Small Value Procurement" }, CancellationToken.None);

        // Assert 1: Only the SVP RFQ should be returned, NOT the Public Bidding project
        svpResult.Succeeded.Should().BeTrue();
        svpResult.Data.Should().HaveCount(1);
        svpResult.Data!.First().ContractNo.Should().Be("RFQ-2026-SVP-003");
        svpResult.Data.Should().NotContain(p => p.ContractNo == "RFQ-ITB-2026-BAC-001");

        // Act 2: Filter by Public Bidding
        var pbResult = await handler.Handle(new GetPublicProjectsQuery { Mode = "Public Bidding" }, CancellationToken.None);

        // Assert 2: The RFQ-ITB project MUST be returned under Public Bidding
        pbResult.Succeeded.Should().BeTrue();
        pbResult.Data.Should().HaveCount(1);
        pbResult.Data!.First().ContractNo.Should().Be("RFQ-ITB-2026-BAC-001");
    }

    [Fact]
    public async Task GetPublicProjectStats_WhenPublicBiddingProjectHasRfqItbPrefix_ShouldCountUnderPublicBidding()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var svpMode = new ProcurementMode { Id = Guid.NewGuid(), Name = "Small Value Procurement (SVP)" };
        var pbMode = new ProcurementMode { Id = Guid.NewGuid(), Name = "Public Bidding" };
        context.ProcurementModes?.AddRange(svpMode, pbMode);

        var pbProject = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "Solar Micro-Grid",
            ContractNo = "RFQ-ITB-2026-INFRA-004",
            Status = "Posted",
            ProcurementMode = pbMode,
            ProcurementModeId = pbMode.Id,
            ABC = 35000000m
        };
        context.ProcurementProjects?.Add(pbProject);

        var svpRfq = new RFQ
        {
            Id = Guid.NewGuid(),
            RFQNumber = "RFQ-2026-SVP-003",
            Description = "Procurement of IT Workstations",
            Status = StatusEnum.Approved,
            TotalAmount = 762000m,
            ModeOfProcurementId = svpMode.Id,
            ModeOfProcurement = svpMode,
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            Deadline = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(9))
        };
        context.RFQs?.Add(svpRfq);
        await context.SaveChangesAsync();

        var statsHandler = new GetPublicProjectStatsQueryHandler(unitOfWork);
        var statsResult = await statsHandler.Handle(new GetPublicProjectStatsQuery(), CancellationToken.None);

        statsResult.Succeeded.Should().BeTrue();
        statsResult.Data!.ActiveProjects.Should().Be(2);
        statsResult.Data!.PublicBidding.Should().Be(1);
        statsResult.Data!.SmallValueProcurement.Should().Be(1);
    }

    [Fact]
    public async Task GetPublicProjects_ShouldExcludeDraftAndSubmittedAndReturnedRFQs()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var draftRfq = new RFQ { Id = Guid.NewGuid(), RFQNumber = "RFQ-DRAFT", Status = StatusEnum.Draft };
        var submittedRfq = new RFQ { Id = Guid.NewGuid(), RFQNumber = "RFQ-SUBMITTED", Status = StatusEnum.Submitted };
        var returnedRfq = new RFQ { Id = Guid.NewGuid(), RFQNumber = "RFQ-RETURNED", Status = StatusEnum.Returned };
        context.RFQs?.AddRange(draftRfq, submittedRfq, returnedRfq);
        await context.SaveChangesAsync();

        var handler = new GetPublicProjectsQueryHandler(unitOfWork);

        // Act
        var result = await handler.Handle(new GetPublicProjectsQuery(), CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().BeEmpty();
    }

    [Fact]
    public async Task GetPublicProjectStats_ShouldIncludeApprovedRFQsInCounts()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var svpMode = new ProcurementMode { Id = Guid.NewGuid(), Name = "Small Value Procurement (SVP)" };
        var pbMode = new ProcurementMode { Id = Guid.NewGuid(), Name = "Public Bidding" };
        context.ProcurementModes?.AddRange(svpMode, pbMode);

        var pbProject = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "PB Campus Wi-Fi",
            ContractNo = "ITB-2026-PB-001",
            Status = "Posted",
            ProcurementMode = pbMode,
            ProcurementModeId = pbMode.Id
        };
        context.ProcurementProjects?.Add(pbProject);

        // Active RFQ
        var activeRfq = new RFQ
        {
            Id = Guid.NewGuid(),
            RFQNumber = "RFQ-2026-SVP-ACTIVE",
            Status = StatusEnum.Approved,
            ModeOfProcurement = svpMode,
            ModeOfProcurementId = svpMode.Id,
            Deadline = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(10))
        };

        // Closing soon RFQ
        var closingSoonRfq = new RFQ
        {
            Id = Guid.NewGuid(),
            RFQNumber = "RFQ-2026-SVP-CLOSING",
            Status = StatusEnum.Approved,
            ModeOfProcurement = svpMode,
            ModeOfProcurementId = svpMode.Id,
            Deadline = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2))
        };

        // Closed RFQ
        var closedRfq = new RFQ
        {
            Id = Guid.NewGuid(),
            RFQNumber = "RFQ-2026-SVP-CLOSED",
            Status = StatusEnum.Approved,
            ModeOfProcurement = svpMode,
            ModeOfProcurementId = svpMode.Id,
            Deadline = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-5))
        };

        context.RFQs?.AddRange(activeRfq, closingSoonRfq, closedRfq);
        await context.SaveChangesAsync();

        var handler = new GetPublicProjectStatsQueryHandler(unitOfWork);

        // Act
        var result = await handler.Handle(new GetPublicProjectStatsQuery(), CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data!.PublicBidding.Should().Be(1);
        result.Data!.SmallValueProcurement.Should().Be(2); // activeRfq + closingSoonRfq
        result.Data!.ActiveProjects.Should().Be(3); // 1 PB + 2 active SVP RFQs
        result.Data!.ClosingSoon.Should().Be(1);
        result.Data!.Closed.Should().Be(1);
    }

    [Fact]
    public async Task GetPublicProjectDetail_WhenApprovedRFQ_ShouldReturnDetailsAndChecklists()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var svpMode = new ProcurementMode { Id = Guid.NewGuid(), Name = "Small Value Procurement (SVP)" };
        context.ProcurementModes?.Add(svpMode);

        var rfqId = Guid.NewGuid();
        var approvedRfq = new RFQ
        {
            Id = rfqId,
            RFQNumber = "RFQ-2026-SVP-003",
            Description = "Procurement of IT Workstations",
            Purpose = "Upgrade engineering faculty workstations",
            Status = StatusEnum.Approved,
            TotalAmount = 850000m,
            DeliveryPeriod = "15 calendar days",
            ModeOfProcurement = svpMode,
            ModeOfProcurementId = svpMode.Id,
            Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-3)),
            Deadline = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7))
        };
        context.RFQs?.Add(approvedRfq);
        await context.SaveChangesAsync();

        var handler = new GetPublicProjectDetailQueryHandler(unitOfWork);

        // Act
        var result = await handler.Handle(new GetPublicProjectDetailQuery(rfqId), CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data!.Id.Should().Be(rfqId);
        result.Data!.ContractNo.Should().Be("RFQ-2026-SVP-003");
        result.Data!.Title.Should().Be("Procurement of IT Workstations");
        result.Data!.ABC.Should().Be(850000m);
        result.Data!.DeliveryPeriodDays.Should().Be(15);
        result.Data!.DeliveryPeriod.Should().Be("15 calendar days");
        result.Data!.Status.Should().Be("Open");
        result.Data!.RequiredSubmissions.Should().NotBeEmpty();
        result.Data!.RequiredSubmissions.Should().Contain(d => d.DocumentName.Contains("Mayor's"));
        result.Data!.RequiredSubmissions.Should().Contain(d => d.DocumentName.Contains("PhilGEPS"));
        result.Data!.RequiredSubmissions.Should().Contain(d => d.DocumentName.Contains("Omnibus Sworn Statement"));
        result.Data!.BidNotices.Should().Contain(n => n.DownloadUrl.Contains("rfq-document"));
    }

    [Fact]
    public async Task GetPublicProjectDetail_WhenDraftRFQ_ShouldThrowNotFoundException()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var rfqId = Guid.NewGuid();
        var draftRfq = new RFQ
        {
            Id = rfqId,
            RFQNumber = "RFQ-DRAFT-001",
            Status = StatusEnum.Draft
        };
        context.RFQs?.Add(draftRfq);
        await context.SaveChangesAsync();

        var handler = new GetPublicProjectDetailQueryHandler(unitOfWork);

        // Act
        var act = () => handler.Handle(new GetPublicProjectDetailQuery(rfqId), CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage("*not currently available*");
    }

    [Fact]
    public async Task SubmitPublicApplication_WhenApprovedRFQ_ShouldRegisterSupplierAndCreateSupplierBid()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);
        var fileStorageMock = new Mock<IFileStorageService>();

        var category = new SupplierCategory { Id = Guid.NewGuid(), Name = "IT Goods" };
        context.SupplierCategories?.Add(category);

        var rfqId = Guid.NewGuid();
        var approvedRfq = new RFQ
        {
            Id = rfqId,
            RFQNumber = "RFQ-2026-SVP-003",
            Status = StatusEnum.Approved,
            Deadline = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7))
        };
        var rfqItem = new RFQItem
        {
            Id = Guid.NewGuid(),
            RFQId = rfqId,
            CPRItemId = Guid.NewGuid(),
            Quantity = 5,
            ItemNameSnapshot = "Dell Latitude 5540"
        };
        approvedRfq.RFQItems.Add(rfqItem);
        context.RFQs?.Add(approvedRfq);
        await context.SaveChangesAsync();

        var testFileId = Guid.NewGuid();
        fileStorageMock.Setup(f => f.PromoteFileAsync(testFileId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(("https://storage.example.com/quotation.pdf", "Apex_Quotation.pdf"));

        var handler = new SubmitPublicApplicationCommandHandler(unitOfWork, fileStorageMock.Object);

        var command = new SubmitPublicApplicationCommand(
            rfqId,
            "Apex Technologies Corp",
            "Carlos Mendoza",
            "carlos@apextech.ph",
            "+63 917 123 4567",
            "123-456-789-000",
            "Makati City",
            [new ApplicationDocumentUploadItem(rfqId, testFileId)]
        );

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();

        // 1. Supplier master created
        var supplier = await context.Suppliers!
            .Include(s => s.SupplierRequirements)
            .FirstOrDefaultAsync(s => s.TINNumber == "123-456-789-000");
        supplier.Should().NotBeNull();
        supplier!.Name.Should().Be("Apex Technologies Corp");
        supplier.CreatedBy.Should().Be("PublicPortal");
        supplier.SupplierRequirements.Should().HaveCount(1);
        supplier.SupplierRequirements.First().RequirementName.Should().Contain("Price Quotation Form");

        // 2. Added to RFQSuppliers
        var rfqAfter = await context.RFQs!.Include(r => r.RFQSuppliers).FirstAsync(r => r.Id == rfqId);
        rfqAfter.RFQSuppliers.Should().HaveCount(1);
        rfqAfter.RFQSuppliers.First().SupplierId.Should().Be(supplier.Id);

        // 3. SupplierBid created with PublicPortal submission type and line item
        var bid = await context.SupplierBids!
            .Include(b => b.SupplierBidItems)
            .FirstOrDefaultAsync(b => b.RFQId == rfqId && b.SupplierId == supplier.Id);
        bid.Should().NotBeNull();
        bid!.SubmissionType.Should().Be("PublicPortal");
        bid.Status.Should().Be("Submitted");
        bid.SupplierBidItems.Should().HaveCount(1);
        bid.SupplierBidItems.First().BrochureFileUrl.Should().Be("https://storage.example.com/quotation.pdf");
    }

    [Fact]
    public async Task SubmitPublicApplication_WhenDuplicateTINForSameRFQ_ShouldThrowValidationException()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);
        var fileStorageMock = new Mock<IFileStorageService>();

        var rfqId = Guid.NewGuid();
        var approvedRfq = new RFQ
        {
            Id = rfqId,
            RFQNumber = "RFQ-2026-SVP-003",
            Status = StatusEnum.Approved,
            Deadline = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7))
        };
        context.RFQs?.Add(approvedRfq);
        await context.SaveChangesAsync();

        var handler = new SubmitPublicApplicationCommandHandler(unitOfWork, fileStorageMock.Object);

        var command = new SubmitPublicApplicationCommand(
            rfqId,
            "Apex Technologies Corp",
            "Carlos Mendoza",
            "carlos@apextech.ph",
            "+63 917 123 4567",
            "123-456-789-000",
            "Makati City",
            []
        );

        // First submission succeeds
        await handler.Handle(command, CancellationToken.None);

        // Act: second submission with same TIN
        var act = () => handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<FluentValidation.ValidationException>()
            .WithMessage("*already been submitted for this RFQ*");
    }

    [Fact]
    public async Task GetRFQSupplierBids_WhenUnbiddedPublicSupplierExists_ShouldSelfHealAndReturnBid()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var rfqId = Guid.NewGuid();
        var rfq = new RFQ
        {
            Id = rfqId,
            RFQNumber = "RFQ-2026-SVP-003",
            Status = StatusEnum.Approved
        };
        var rfqItem = new RFQItem
        {
            Id = Guid.NewGuid(),
            RFQId = rfqId,
            CPRItemId = Guid.NewGuid(),
            ItemNameSnapshot = "Workstation Pro",
            Quantity = 2,
            UnitPriceSnapshot = 50000m
        };
        rfq.RFQItems.Add(rfqItem);

        // Public applicant registered in RFQSuppliers without a SupplierBid (pre-fix state)
        var publicSupplier = new Supplier
        {
            Id = Guid.NewGuid(),
            Name = "External Public Bidder Co",
            TINNumber = "999-888-777-000",
            CreatedBy = "PublicPortal"
        };
        publicSupplier.SupplierRequirements.Add(new SupplierRequirement
        {
            Id = Guid.NewGuid(),
            SupplierId = publicSupplier.Id,
            RequirementName = "Valid Mayor's / Business Permit",
            Url = "https://storage.example.com/mayors-permit.pdf"
        });
        context.Suppliers?.Add(publicSupplier);

        rfq.RFQSuppliers.Add(new RFQSupplier
        {
            RFQId = rfqId,
            SupplierId = publicSupplier.Id,
            Supplier = publicSupplier,
            InvitedAt = DateTime.UtcNow
        });
        context.RFQs?.Add(rfq);
        await context.SaveChangesAsync();

        var handler = new GetRFQSupplierBidsQueryHandler(unitOfWork);

        // Act
        var result = await handler.Handle(new GetRFQSupplierBidsQuery(rfqId), CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().HaveCount(1);

        var bid = result.Data!.First();
        bid.SupplierName.Should().Be("External Public Bidder Co");
        bid.SubmissionType.Should().Be("PublicPortal");
        bid.Status.Should().Be("Pending");
        bid.Documents.Should().Contain(d => d.Name.Contains("Mayor's"));
        bid.Items.Should().HaveCount(1);

        // Verify the reconciled bid was actually persisted to DB
        var persistedBid = await context.SupplierBids!.FirstOrDefaultAsync(b => b.RFQId == rfqId && b.SupplierId == publicSupplier.Id);
        persistedBid.Should().NotBeNull();
        persistedBid!.SubmissionType.Should().Be("PublicPortal");
    }

    [Fact]
    public async Task GetRFQs_WhenPublicApplicantRegistered_ShouldConsolidateApplicantCount()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var rfqId = Guid.NewGuid();
        var rfq = new RFQ
        {
            Id = rfqId,
            RFQNumber = "RFQ-2026-SVP-003",
            Description = "Office Supplies Procurement",
            Status = StatusEnum.Approved
        };

        // 3 internal suppliers with bids
        for (int i = 1; i <= 3; i++)
        {
            var supplierId = Guid.NewGuid();
            var supplier = new Supplier { Id = supplierId, Name = $"Supplier {i}", TINNumber = $"TIN-{i}" };
            context.Suppliers?.Add(supplier);

            rfq.RFQSuppliers.Add(new RFQSupplier { RFQId = rfqId, SupplierId = supplierId, Supplier = supplier });
            context.SupplierBids?.Add(new SupplierBid
            {
                Id = Guid.NewGuid(),
                RFQId = rfqId,
                SupplierId = supplierId,
                SubmissionType = "Electronic",
                Status = "Submitted"
            });
        }

        // 4th supplier applied from public portal (in RFQSuppliers, not yet in SupplierBid)
        var publicSupplierId = Guid.NewGuid();
        var publicSupplier = new Supplier { Id = publicSupplierId, Name = "Public Applicant", TINNumber = "TIN-4", CreatedBy = "PublicPortal" };
        context.Suppliers?.Add(publicSupplier);
        rfq.RFQSuppliers.Add(new RFQSupplier { RFQId = rfqId, SupplierId = publicSupplierId, Supplier = publicSupplier });

        context.RFQs?.Add(rfq);
        await context.SaveChangesAsync();

        var handler = new GetRFQsQueryHandler(unitOfWork);

        // Act
        var result = await handler.Handle(new GetRFQsQuery(), CancellationToken.None);

        // Assert
        result.Data.Should().HaveCount(1);
        result.Data!.First().ApplicantCount.Should().Be(4);
    }

    [Fact]
    public async Task SubmitPublicApplication_WithItemBidsAndTerms_ShouldPersistItemizedPricesAndCommercialTerms()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var rfqId = Guid.NewGuid();
        var item1Id = Guid.NewGuid();
        var item2Id = Guid.NewGuid();

        var rfq = new RFQ
        {
            Id = rfqId,
            RFQNumber = "RFQ-2026-SVP-005",
            Description = "IT Equipment Procurement",
            Status = StatusEnum.Approved,
            TotalAmount = 10000m,
            RFQItems = new List<RFQItem>
            {
                new() { Id = item1Id, RFQId = rfqId, ItemNameSnapshot = "Laptop", Quantity = 2, UnitPriceSnapshot = 3000m },
                new() { Id = item2Id, RFQId = rfqId, ItemNameSnapshot = "Monitor", Quantity = 4, UnitPriceSnapshot = 1000m }
            }
        };
        context.RFQs?.Add(rfq);

        var fileStorageMock = new Mock<IFileStorageService>();
        fileStorageMock.Setup(f => f.PromoteFileAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Guid fileId, CancellationToken _) => ($"/storage/{fileId}.pdf", "test.pdf"));

        await context.SaveChangesAsync();

        var handler = new SubmitPublicApplicationCommandHandler(unitOfWork, fileStorageMock.Object);

        var command = new SubmitPublicApplicationCommand(
            rfqId,
            "Tech Innovations Corp",
            "John Doe",
            "john@tech.com",
            "+639123456789",
            "123-456-789-000",
            "123 Tech Park, Cagayan de Oro City",
            new List<ApplicationDocumentUploadItem>(),
            ProposedBidAmount: 8800m,
            DeliveryPeriod: "15 Calendar Days",
            PaymentTerms: "Net 30 Days",
            WarrantyTerms: "1 Year Comprehensive",
            ValidityPeriodDays: 90,
            Remarks: "Complete proposal with warranty",
            ItemBids: new List<PublicItemBidDto>
            {
                new(item1Id, 2800m, "Dell", "Latitude 5420"),
                new(item2Id, 800m, "ViewSonic", "VA2432-h")
            }
        );

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();

        var bid = await context.SupplierBids!
            .Include(b => b.SupplierBidItems)
            .FirstOrDefaultAsync(b => b.RFQId == rfqId);

        bid.Should().NotBeNull();
        bid!.TotalAmount.Should().Be(8800m);
        bid.DeliveryPeriod.Should().Be("15 Calendar Days");
        bid.PaymentTerms.Should().Be("Net 30 Days");
        bid.WarrantyTerms.Should().Be("1 Year Comprehensive");
        bid.ValidityPeriodDays.Should().Be(90);

        bid.SupplierBidItems.Should().HaveCount(2);
        var laptopBid = bid.SupplierBidItems.First(i => i.RFQItemId == item1Id);
        laptopBid.UnitPrice.Should().Be(2800m);
        laptopBid.TotalPrice.Should().Be(5600m);
        laptopBid.Brand.Should().Be("Dell");
        laptopBid.Model.Should().Be("Latitude 5420");

        var monitorBid = bid.SupplierBidItems.First(i => i.RFQItemId == item2Id);
        monitorBid.UnitPrice.Should().Be(800m);
        monitorBid.TotalPrice.Should().Be(3200m);
        monitorBid.Brand.Should().Be("ViewSonic");
        monitorBid.Model.Should().Be("VA2432-h");

        // Verify GetRFQSupplierBids returns the commercial terms
        var queryHandler = new GetRFQSupplierBidsQueryHandler(unitOfWork);
        var queryResult = await queryHandler.Handle(new GetRFQSupplierBidsQuery(rfqId), CancellationToken.None);

        queryResult.Succeeded.Should().BeTrue();
        var returnedBid = queryResult.Data!.First(b => b.Id == bid.Id);
        returnedBid.DeliveryPeriod.Should().Be("15 Calendar Days");
        returnedBid.PaymentTerms.Should().Be("Net 30 Days");
        returnedBid.WarrantyTerms.Should().Be("1 Year Comprehensive");
        returnedBid.ValidityPeriodDays.Should().Be(90);
    }

    [Fact]
    public async Task SubmitPublicApplication_WhenBidExceedsABC_ShouldThrowValidationException()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var rfqId = Guid.NewGuid();
        var itemId = Guid.NewGuid();

        var rfq = new RFQ
        {
            Id = rfqId,
            RFQNumber = "RFQ-2026-SVP-006",
            Description = "Budget Enforced RFQ",
            Status = StatusEnum.Approved,
            TotalAmount = 5000m,
            RFQItems = new List<RFQItem>
            {
                new() { Id = itemId, RFQId = rfqId, ItemNameSnapshot = "Printer", Quantity = 1, UnitPriceSnapshot = 5000m }
            }
        };
        context.RFQs?.Add(rfq);
        await context.SaveChangesAsync();

        var fileStorageMock = new Mock<IFileStorageService>();
        var handler = new SubmitPublicApplicationCommandHandler(unitOfWork, fileStorageMock.Object);

        // Unit price = 6000, Total = 6000 > ABC (5000)
        var command = new SubmitPublicApplicationCommand(
            rfqId,
            "Expensive Supplier",
            "Jane Smith",
            "jane@expensive.com",
            "+639999999999",
            "999-999-999-000",
            "Manila",
            new List<ApplicationDocumentUploadItem>(),
            ItemBids: new List<PublicItemBidDto>
            {
                new(itemId, 6000m, "Epson", "L3210")
            }
        );

        // Act
        Func<Task> act = async () => await handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<FluentValidation.ValidationException>()
            .WithMessage("*exceeds the Approved Budget for the Contract*");
    }

    [Fact]
    public async Task GetPublicProjects_ProcurementProject_WithPastDeadline_ShouldReturnClosedStatus()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var mode = new ProcurementMode { Id = Guid.NewGuid(), Name = "Competitive Bidding" };
        context.ProcurementModes?.Add(mode);

        var activityType = new ProcurementActivityType
        {
            Id = Guid.NewGuid(),
            Name = "Submission and Opening of Bids",
            SystemRole = ProcurementActivitySystemRole.SubmissionOpeningOfBids
        };
        context.ProcurementActivityTypes?.Add(activityType);

        var projectId = Guid.NewGuid();
        var project = new ProcurementProject
        {
            Id = projectId,
            Title = "Expired Public Project",
            ContractNo = "ITB-2026-EXPIRED",
            Status = "Posted",
            ProcurementModeId = mode.Id,
            ABC = 1000000m,
            BiddingActivitySchedules = new List<BiddingActivitySchedule>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    ProcurementProjectId = projectId,
                    ProcurementActivityTypeId = activityType.Id,
                    ProcurementActivityType = activityType,
                    StartDate = DateTime.UtcNow.AddDays(-10),
                    EndDate = DateTime.UtcNow.AddDays(-5) // 5 days ago
                }
            }
        };
        context.ProcurementProjects?.Add(project);
        await context.SaveChangesAsync();

        var handler = new GetPublicProjectsQueryHandler(unitOfWork);
        var query = new GetPublicProjectsQuery();

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        var item = result.Data!.First(p => p.Id == projectId);
        item.Status.Should().Be("Closed");
    }

    [Fact]
    public async Task ValidatePublicApplication_WhenDeadlinePassed_ShouldThrowForbiddenException()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var activityType = new ProcurementActivityType
        {
            Id = Guid.NewGuid(),
            Name = "Submission and Opening of Bids",
            SystemRole = ProcurementActivitySystemRole.SubmissionOpeningOfBids
        };
        context.ProcurementActivityTypes?.Add(activityType);

        var projectId = Guid.NewGuid();
        var project = new ProcurementProject
        {
            Id = projectId,
            Title = "Past Deadline Project",
            ContractNo = "ITB-2026-PAST",
            Status = "Posted",
            ABC = 500000m,
            BiddingActivitySchedules = new List<BiddingActivitySchedule>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    ProcurementProjectId = projectId,
                    ProcurementActivityTypeId = activityType.Id,
                    ProcurementActivityType = activityType,
                    StartDate = DateTime.UtcNow.AddDays(-5),
                    EndDate = DateTime.UtcNow.AddDays(-2)
                }
            }
        };
        context.ProcurementProjects?.Add(project);
        await context.SaveChangesAsync();

        var handler = new ValidatePublicApplicationCommandHandler(unitOfWork);
        var command = new ValidatePublicApplicationCommand(
            projectId,
            "Acme Corp",
            "John Doe",
            "john@acme.com",
            "+639123456789",
            "123-456-789-000",
            "Cagayan de Oro",
            new List<Guid>()
        );

        // Act
        Func<Task> act = async () => await handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<ForbiddenException>()
            .WithMessage("*submission deadline*This project is no longer accepting applications*");
    }

    [Fact]
    public async Task ValidatePublicApplication_WhenValid_ShouldReturnSuccess()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var activityType = new ProcurementActivityType
        {
            Id = Guid.NewGuid(),
            Name = "Submission and Opening of Bids",
            SystemRole = ProcurementActivitySystemRole.SubmissionOpeningOfBids
        };
        context.ProcurementActivityTypes?.Add(activityType);

        var checklistId = Guid.NewGuid();
        var projectId = Guid.NewGuid();
        var project = new ProcurementProject
        {
            Id = projectId,
            Title = "Active Public Project",
            ContractNo = "ITB-2026-ACTIVE",
            Status = "Posted",
            ABC = 500000m,
            BiddingActivitySchedules = new List<BiddingActivitySchedule>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    ProcurementProjectId = projectId,
                    ProcurementActivityTypeId = activityType.Id,
                    ProcurementActivityType = activityType,
                    StartDate = DateTime.UtcNow,
                    EndDate = DateTime.UtcNow.AddDays(7) // 7 days in future
                }
            },
            ProjectDocumentChecklists = new List<ProjectDocumentChecklist>
            {
                new()
                {
                    Id = checklistId,
                    ProcurementProjectId = projectId,
                    IsRequired = true,
                    OrderIndex = 1
                }
            }
        };
        context.ProcurementProjects?.Add(project);
        await context.SaveChangesAsync();

        var handler = new ValidatePublicApplicationCommandHandler(unitOfWork);
        var command = new ValidatePublicApplicationCommand(
            projectId,
            "Acme Corp",
            "John Doe",
            "john@acme.com",
            "+639123456789",
            "123-456-789-000",
            "Cagayan de Oro",
            new List<Guid> { checklistId },
            ProposedBidAmount: 450000m
        );

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().BeTrue();
    }

    [Fact]
    public async Task SubmitPublicApplication_WhenSVPProcurementProjectWithAssociatedRFQ_ShouldSucceed()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);
        var fileStorageMock = new Mock<IFileStorageService>();

        var svpMode = new ProcurementMode { Id = Guid.NewGuid(), Name = "Small Value Procurement" };
        context.ProcurementModes?.Add(svpMode);

        var activityType = new ProcurementActivityType
        {
            Id = Guid.NewGuid(),
            Name = "Submission and Opening of Bids",
            SystemRole = ProcurementActivitySystemRole.SubmissionOpeningOfBids
        };
        context.ProcurementActivityTypes?.Add(activityType);

        var cprId = Guid.NewGuid();
        var projectId = Guid.NewGuid();
        var checklistId = Guid.NewGuid();

        var project = new ProcurementProject
        {
            Id = projectId,
            Title = "SVP Project with RFQ",
            ContractNo = "SVP-2026-TEST-001",
            Status = "Posted",
            ABC = 950000m,
            ConsolidatedPRId = cprId,
            ProcurementModeId = svpMode.Id,
            ProcurementMode = svpMode,
            BiddingActivitySchedules = new List<BiddingActivitySchedule>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    ProcurementProjectId = projectId,
                    ProcurementActivityTypeId = activityType.Id,
                    ProcurementActivityType = activityType,
                    StartDate = DateTime.UtcNow,
                    EndDate = DateTime.UtcNow.AddDays(7)
                }
            },
            ProjectDocumentChecklists = new List<ProjectDocumentChecklist>
            {
                new()
                {
                    Id = checklistId,
                    ProcurementProjectId = projectId,
                    IsRequired = true,
                    OrderIndex = 1
                }
            }
        };
        context.ProcurementProjects?.Add(project);

        var rfqId = Guid.NewGuid();
        var rfqItemId = Guid.NewGuid();
        var associatedRfq = new RFQ
        {
            Id = rfqId,
            RFQNumber = "RFQ-SVP-2026-TEST-001",
            ConsolidatedPRId = cprId,
            Status = StatusEnum.Approved,
            TotalAmount = 950000m,
            RFQItems = new List<RFQItem>
            {
                new()
                {
                    Id = rfqItemId,
                    RFQId = rfqId,
                    ItemNameSnapshot = "Smart Display",
                    Quantity = 5,
                    UnitPriceSnapshot = 150000m
                }
            }
        };
        context.RFQs?.Add(associatedRfq);
        await context.SaveChangesAsync();

        var testFileId = Guid.NewGuid();
        fileStorageMock.Setup(f => f.PromoteFileAsync(testFileId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(("https://storage.example.com/doc.pdf", "Proposal.pdf"));

        var handler = new SubmitPublicApplicationCommandHandler(unitOfWork, fileStorageMock.Object);
        var command = new SubmitPublicApplicationCommand(
            projectId,
            "Mega Display Corp",
            "Maria Santos",
            "maria@megadisplay.ph",
            "+63 918 111 2222",
            "888-777-666-000",
            "Davao City",
            new List<ApplicationDocumentUploadItem>
            {
                new(checklistId, testFileId)
            },
            ProposedBidAmount: 750000m,
            ItemBids: new List<PublicItemBidDto>
            {
                new(rfqItemId, 150000m, "Samsung", "QB85R")
            }
        );

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();

        var app = await context.PublicSupplierApplications!
            .Include(a => a.UploadedDocuments)
            .FirstOrDefaultAsync(a => a.Id == result.Data);
        app.Should().NotBeNull();
        app!.CompanyName.Should().Be("Mega Display Corp");
        app.UploadedDocuments.Should().HaveCount(1);

        var bid = await context.SupplierBids!
            .Include(b => b.SupplierBidItems)
            .FirstOrDefaultAsync(b => b.RFQId == rfqId);
        bid.Should().NotBeNull();
        bid!.TotalAmount.Should().Be(750000m);
        bid.SupplierBidItems.Should().HaveCount(1);

        var rfqAfter = await context.RFQs!.Include(r => r.RFQSuppliers).FirstAsync(r => r.Id == rfqId);
        rfqAfter.RFQSuppliers.Should().HaveCount(1);
    }

    [Fact]
    public async Task SubmitPublicApplication_WhenCompetitiveBiddingProject_ShouldCreateBiddingSubmissionAndSucceed()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);
        var fileStorageMock = new Mock<IFileStorageService>();

        var pbMode = new ProcurementMode { Id = Guid.NewGuid(), Name = "Competitive Bidding" };
        context.ProcurementModes?.Add(pbMode);

        var projectId = Guid.NewGuid();
        var project = new ProcurementProject
        {
            Id = projectId,
            Title = "Construction of Regional Office Building",
            ContractNo = "ITB-2026-PB-099",
            Status = "Posted",
            ProcurementModeId = pbMode.Id,
            ProcurementMode = pbMode,
            ABC = 50000000m
        };
        context.ProcurementProjects?.Add(project);

        var checklistId = Guid.NewGuid();
        var checklist = new ProjectDocumentChecklist
        {
            Id = checklistId,
            ProcurementProjectId = projectId,
            CustomDocumentName = "Technical Document",
            EnvelopeType = 1,
            IsRequired = true
        };
        context.ProjectDocumentChecklists?.Add(checklist);
        await context.SaveChangesAsync();

        var testFileId = Guid.NewGuid();
        fileStorageMock.Setup(f => f.PromoteFileAsync(testFileId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(("https://storage.example.com/bidding_doc.pdf", "Technical_Bid.pdf"));

        var handler = new SubmitPublicApplicationCommandHandler(unitOfWork, fileStorageMock.Object);
        var command = new SubmitPublicApplicationCommand(
            projectId,
            "Prime Infrastructure Corp",
            "Engr. Juan Dela Cruz",
            "juan@primeinfra.ph",
            "+63 917 555 6677",
            "999-888-777-000",
            "Quezon City",
            new List<ApplicationDocumentUploadItem>
            {
                new(checklistId, testFileId)
            },
            ProposedBidAmount: 48500000m,
            BidSecurityType: "Bid Securing Declaration"
        );

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();

        var app = await context.PublicSupplierApplications!
            .Include(a => a.UploadedDocuments)
            .FirstOrDefaultAsync(a => a.Id == result.Data);
        app.Should().NotBeNull();
        app!.CompanyName.Should().Be("Prime Infrastructure Corp");
        app.UploadedDocuments.Should().HaveCount(1);
        app.CreatedBy.Should().Be("PublicPortal");

        var submission = await context.BiddingSubmissions!
            .FirstOrDefaultAsync(bs => bs.ProcurementProjectId == projectId);
        submission.Should().NotBeNull();
        submission!.OriginalProposedAmount.Should().Be(48500000m);
        submission.BidSecurityType.Should().Be("Bid Securing Declaration");
        submission.CreatedBy.Should().Be("PublicPortal");

        var supplier = await context.Suppliers!
            .FirstOrDefaultAsync(s => s.TINNumber == "999-888-777-000");
        supplier.Should().NotBeNull();
        supplier!.CreatedBy.Should().Be("PublicPortal");
    }
}

