using Dashboard.Application.UnitTests.Features.Procurement.AOB;
using ERPEZ.Application.Features.Procurement.SupplierPortal.Commands.SubmitPublicApplication;
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
        result.Data.First().ContractNo.Should().Be("RFQ-2026-SVP-001");
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
        result.Data.First().ContractNo.Should().Be("ITB-2026-PB-005");
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
        svpResult.Data.First().ContractNo.Should().Be("RFQ-2026-SVP-003");
        svpResult.Data.Should().NotContain(p => p.ContractNo == "RFQ-ITB-2026-BAC-001");

        // Act 2: Filter by Public Bidding
        var pbResult = await handler.Handle(new GetPublicProjectsQuery { Mode = "Public Bidding" }, CancellationToken.None);

        // Assert 2: The RFQ-ITB project MUST be returned under Public Bidding
        pbResult.Succeeded.Should().BeTrue();
        pbResult.Data.Should().HaveCount(1);
        pbResult.Data.First().ContractNo.Should().Be("RFQ-ITB-2026-BAC-001");
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
        statsResult.Data.ActiveProjects.Should().Be(2);
        statsResult.Data.PublicBidding.Should().Be(1);
        statsResult.Data.SmallValueProcurement.Should().Be(1);
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
        result.Data.PublicBidding.Should().Be(1);
        result.Data.SmallValueProcurement.Should().Be(2); // activeRfq + closingSoonRfq
        result.Data.ActiveProjects.Should().Be(3); // 1 PB + 2 active SVP RFQs
        result.Data.ClosingSoon.Should().Be(1);
        result.Data.Closed.Should().Be(1);
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
        result.Data.Id.Should().Be(rfqId);
        result.Data.ContractNo.Should().Be("RFQ-2026-SVP-003");
        result.Data.Title.Should().Be("Procurement of IT Workstations");
        result.Data.ABC.Should().Be(850000m);
        result.Data.DeliveryPeriodDays.Should().Be(15);
        result.Data.DeliveryPeriod.Should().Be("15 calendar days");
        result.Data.Status.Should().Be("Open");
        result.Data.RequiredSubmissions.Should().NotBeEmpty();
        result.Data.RequiredSubmissions.Should().Contain(d => d.DocumentName.Contains("Mayor's"));
        result.Data.RequiredSubmissions.Should().Contain(d => d.DocumentName.Contains("PhilGEPS"));
        result.Data.RequiredSubmissions.Should().Contain(d => d.DocumentName.Contains("Omnibus Sworn Statement"));
        result.Data.BidNotices.Should().Contain(n => n.DownloadUrl.Contains("rfq-document"));
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
    public async Task SubmitPublicApplication_WhenApprovedRFQ_ShouldRegisterSupplierInRFQSuppliers()
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

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();

        var rfqAfter = await context.RFQs!.Include(r => r.RFQSuppliers).FirstAsync(r => r.Id == rfqId);
        rfqAfter.RFQSuppliers.Should().HaveCount(1);

        var supplier = await context.Suppliers!.FirstOrDefaultAsync(s => s.TINNumber == "123-456-789-000");
        supplier.Should().NotBeNull();
        supplier!.Name.Should().Be("Apex Technologies Corp");
        rfqAfter.RFQSuppliers.First().SupplierId.Should().Be(supplier.Id);
    }
}
