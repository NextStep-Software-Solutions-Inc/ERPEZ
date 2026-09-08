using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.Projects.Commands.CreateProcurementProject;
using ERPEZ.Application.Features.Procurement.PurchaseRequests.Queries.GetConsolidatedPRById;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using Moq;
using Xunit;

namespace ERPEZ.Dashboard.Application.UnitTests.Features.Procurement.PurchaseRequests.Queries.GetConsolidatedPRById;

public class GetConsolidatedPRByIdQueryHandlerTests
{
    private readonly Mock<IUnitOfWork> mockUnitOfWork = new();
    private readonly Mock<IConsolidatedPRRepository> mockCprRepo = new();
    private readonly Mock<IProcurementProjectRepository> mockProjectRepo = new();

    public GetConsolidatedPRByIdQueryHandlerTests()
    {
        mockUnitOfWork.Setup(u => u.ConsolidatedPRRepository).Returns(mockCprRepo.Object);
        mockUnitOfWork.Setup(u => u.ProcurementProjectRepository).Returns(mockProjectRepo.Object);
    }

    [Fact]
    public async Task Handle_Route1_WhenBACResolutionCreatedViaAPPItem_ResolvesBACResolutionThroughLineage()
    {
        // Arrange: Lineage setup
        var cprId = Guid.NewGuid();
        var ppmpItemId = Guid.NewGuid();
        var appItemId = Guid.NewGuid();
        var prItemId = Guid.NewGuid();
        var prId = Guid.NewGuid();
        var officeId = Guid.NewGuid();
        var projectId = Guid.NewGuid();

        var app = new APP { Id = Guid.NewGuid(), Status = StatusEnum.Approved };
        var appItem = new APPItem
        {
            Id = appItemId,
            APPId = app.Id,
            APP = app,
            PPMPItemId = ppmpItemId
        };

        var ppmpItem = new PPMPItem
        {
            Id = ppmpItemId,
            Name = "Office Laptop",
            APPItems = [appItem]
        };

        var prItem = new PRItem
        {
            Id = prItemId,
            PPMPItemId = ppmpItemId,
            PPMPItem = ppmpItem,
            Name = "Office Laptop",
            Amount = 50000m
        };

        var office = new Office { Id = officeId, Name = "IT Department" };
        var pr = new PurchaseRequest
        {
            Id = prId,
            PRNumber = "PR-2026-001",
            OfficeId = officeId,
            Office = office,
            PRType = PRType.NonCSE
        };

        var cprItem = new ConsolidatedPRItem
        {
            Id = Guid.NewGuid(),
            ConsolidatedPRId = cprId,
            PurchaseRequestId = prId,
            PurchaseRequest = pr,
            PRItemId = prItemId,
            PRItem = prItem
        };

        var cpr = new ConsolidatedPR
        {
            Id = cprId,
            CPRNumber = "CPR-2026-001",
            Status = StatusEnum.Draft,
            ConsolidatedPRItems = [cprItem]
        };

        var bacResolution = new BACResolution
        {
            Id = Guid.NewGuid(),
            ProcurementProjectId = projectId,
            ResolutionNumber = "BAC-RES-2026-APP-001",
            ResolutionType = "Recommend Mode of Procurement",
            Status = "Approved",
            DateResolved = DateTime.UtcNow
        };

        var route1Project = new ProcurementProject
        {
            Id = projectId,
            Title = "IT Equipment Procurement",
            SourceType = ProcurementProjectSourceType.APPItem,
            APPItemId = appItemId,
            ABC = 50000m,
            Status = "Approved",
            BACResolutions = [bacResolution]
        };

        mockCprRepo
            .Setup(r => r.GetCPRWithDetailsAsync(cprId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(cpr);

        // Direct CPR returns null (Route 2 not present)
        mockProjectRepo
            .Setup(r => r.GetByConsolidatedPRIdWithResolutionsAsync(cprId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((ProcurementProject?)null);

        // Lineage lookup matches appItemId
        mockProjectRepo
            .Setup(r => r.GetByAPPItemIdsWithResolutionsAsync(It.Is<IEnumerable<Guid>>(ids => ids.Contains(appItemId)), It.IsAny<CancellationToken>()))
            .ReturnsAsync([route1Project]);

        var handler = new GetConsolidatedPRByIdQueryHandler(mockUnitOfWork.Object);
        var query = new GetConsolidatedPRByIdQuery(cprId);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.Succeeded);
        Assert.NotNull(result.Data!.BacResolutions);
        Assert.Single(result.Data.BacResolutions!);

        var res = result.Data.BacResolutions!.First();
        Assert.Equal("BAC-RES-2026-APP-001", res.ResolutionNumber);
        Assert.Equal("IT Equipment Procurement", res.ProjectTitle);
        Assert.Equal("APPItem", res.SourceType);
    }

    [Fact]
    public async Task Handle_Route2_WhenBACResolutionCreatedViaConsolidatedPR_ResolvesDirectBACResolution()
    {
        // Arrange
        var cprId = Guid.NewGuid();
        var projectId = Guid.NewGuid();

        var cpr = new ConsolidatedPR
        {
            Id = cprId,
            CPRNumber = "CPR-2026-002",
            Status = StatusEnum.Draft,
            ConsolidatedPRItems = []
        };

        var bacResolution = new BACResolution
        {
            Id = Guid.NewGuid(),
            ProcurementProjectId = projectId,
            ResolutionNumber = "BAC-RES-2026-CPR-002",
            ResolutionType = "Recommend Mode of Procurement",
            Status = "Approved",
            DateResolved = DateTime.UtcNow
        };

        var directProject = new ProcurementProject
        {
            Id = projectId,
            Title = "CPR Consolidated Bidding",
            SourceType = ProcurementProjectSourceType.ConsolidatedPR,
            ConsolidatedPRId = cprId,
            ABC = 100000m,
            Status = "Approved",
            BACResolutions = [bacResolution]
        };

        mockCprRepo
            .Setup(r => r.GetCPRWithDetailsAsync(cprId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(cpr);

        mockProjectRepo
            .Setup(r => r.GetByConsolidatedPRIdWithResolutionsAsync(cprId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(directProject);

        var handler = new GetConsolidatedPRByIdQueryHandler(mockUnitOfWork.Object);
        var query = new GetConsolidatedPRByIdQuery(cprId);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.Succeeded);
        Assert.NotNull(result.Data!.BacResolutions);
        Assert.Single(result.Data.BacResolutions!);

        var res = result.Data.BacResolutions!.First();
        Assert.Equal("BAC-RES-2026-CPR-002", res.ResolutionNumber);
        Assert.Equal("CPR Consolidated Bidding", res.ProjectTitle);
        Assert.Equal("ConsolidatedPR", res.SourceType);
    }

    [Fact]
    public async Task Handle_WhenNoBACResolutionExists_ReturnsEmptyBacResolutionsList()
    {
        // Arrange
        var cprId = Guid.NewGuid();
        var cpr = new ConsolidatedPR
        {
            Id = cprId,
            CPRNumber = "CPR-2026-003",
            Status = StatusEnum.Draft,
            ConsolidatedPRItems = []
        };

        mockCprRepo
            .Setup(r => r.GetCPRWithDetailsAsync(cprId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(cpr);

        mockProjectRepo
            .Setup(r => r.GetByConsolidatedPRIdWithResolutionsAsync(cprId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((ProcurementProject?)null);

        var handler = new GetConsolidatedPRByIdQueryHandler(mockUnitOfWork.Object);
        var query = new GetConsolidatedPRByIdQuery(cprId);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.Succeeded);
        Assert.NotNull(result.Data!.BacResolutions);
        Assert.Empty(result.Data.BacResolutions!);
    }

    [Fact]
    public async Task CreateProcurementProject_WhenCPRItemsAlreadyInActiveRoute1Project_FailsWithActionableMessage()
    {
        // Arrange
        var cprId = Guid.NewGuid();
        var ppmpItemId = Guid.NewGuid();
        var appItemId = Guid.NewGuid();

        var appItem = new APPItem { Id = appItemId, PPMPItemId = ppmpItemId };
        var ppmpItem = new PPMPItem { Id = ppmpItemId, APPItems = [appItem] };
        var prItem = new PRItem { Id = Guid.NewGuid(), PPMPItemId = ppmpItemId, PPMPItem = ppmpItem };
        var cprItem = new ConsolidatedPRItem { Id = Guid.NewGuid(), ConsolidatedPRId = cprId, PRItem = prItem };

        var cpr = new ConsolidatedPR
        {
            Id = cprId,
            CPRNumber = "CPR-2026-004",
            TotalAmount = 50000m,
            ConsolidatedPRItems = [cprItem]
        };

        var existingResolution = new BACResolution
        {
            Id = Guid.NewGuid(),
            ResolutionNumber = "BAC-RES-EXISTING-01"
        };

        var existingProject = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "Existing Lineage Project",
            SourceType = ProcurementProjectSourceType.APPItem,
            APPItemId = appItemId,
            Status = "Draft",
            BACResolutions = [existingResolution]
        };

        mockCprRepo
            .Setup(r => r.GetByIdAsync(cprId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(cpr);

        mockCprRepo
            .Setup(r => r.GetCPRWithDetailsAsync(cprId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(cpr);

        mockProjectRepo
            .Setup(r => r.FindAsync(It.IsAny<Expression<Func<ProcurementProject, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ProcurementProject?)null);

        mockProjectRepo
            .Setup(r => r.GetByAPPItemIdsWithResolutionsAsync(It.Is<IEnumerable<Guid>>(ids => ids.Contains(appItemId)), It.IsAny<CancellationToken>()))
            .ReturnsAsync([existingProject]);

        var handler = new CreateProcurementProjectCommandHandler(mockUnitOfWork.Object);
        var command = new CreateProcurementProjectCommand
        {
            SourceType = ProcurementProjectSourceType.ConsolidatedPR,
            ConsolidatedPRId = cprId,
            ResolutionNumber = "BAC-RES-NEW-02"
        };

        // Act
        var response = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.False(response.Succeeded);
        Assert.Contains("Cannot create BAC Resolution: An active Procurement Project already exists for the items in this Consolidated PR", response.Message);
        Assert.Contains("Existing Lineage Project", response.Message);
        Assert.Contains("BAC-RES-EXISTING-01", response.Message);
    }
}
