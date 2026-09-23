using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.Projects.Commands.CreateProcurementProject;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using Moq;
using Xunit;

namespace ERPEZ.Dashboard.Application.UnitTests.Features.Procurement.Commands.CreateProcurementProject;

public class CreateProcurementProjectCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> mockUnitOfWork = new();
    private readonly Mock<IAPPRepository> mockAppRepo = new();
    private readonly Mock<IAPPItemRepository> mockAppItemRepo = new();
    private readonly Mock<IProcurementProjectRepository> mockProjectRepo = new();

    public CreateProcurementProjectCommandHandlerTests()
    {
        mockUnitOfWork.Setup(u => u.APPRepository).Returns(mockAppRepo.Object);
        mockUnitOfWork.Setup(u => u.APPItemRepository).Returns(mockAppItemRepo.Object);
        mockUnitOfWork.Setup(u => u.ProcurementProjectRepository).Returns(mockProjectRepo.Object);
    }

    [Fact]
    public async Task Handle_AppItemSource_WithoutAbcPayload_InheritsAppItemEffectiveAbc()
    {
        var appId = Guid.NewGuid();
        var appItemId = Guid.NewGuid();
        var appItem = new APPItem
        {
            Id = appItemId,
            APPId = appId,
            EstimatedBudgetOverride = 250000m,
            Remarks = "Test Procurement Line"
        };

        mockAppRepo
            .Setup(r => r.GetByIdAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new APP { Id = appId, APPNumber = "APP-2026-001" });

        mockAppItemRepo
            .Setup(r => r.GetWithDetailsAsync(appItemId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(appItem);

        mockProjectRepo
            .Setup(r => r.FindAsync(It.IsAny<Expression<Func<ProcurementProject, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ProcurementProject?)null);

        ProcurementProject? savedProject = null;
        mockProjectRepo
            .Setup(r => r.AddAsync(It.IsAny<ProcurementProject>(), It.IsAny<CancellationToken>()))
            .Callback<ProcurementProject, CancellationToken>((p, _) => savedProject = p)
            .Returns(Task.CompletedTask);

        var handler = new CreateProcurementProjectCommandHandler(mockUnitOfWork.Object);
        var command = new CreateProcurementProjectCommand
        {
            SourceType = ProcurementProjectSourceType.APPItem,
            APPId = appId,
            APPItemId = appItemId,
            ABC = null,
            ResolutionNumber = "BAC-RES-2026-001"
        };

        var response = await handler.Handle(command, CancellationToken.None);

        Assert.True(response.Succeeded);
        Assert.NotNull(savedProject);
        Assert.Equal(250000m, savedProject!.ABC);
    }

    [Fact]
    public async Task Handle_AppItemSource_MultiApp_CalculatesTotalAbcAndLinksAllItems()
    {
        var app1Id = Guid.NewGuid();
        var app2Id = Guid.NewGuid();
        var item1Id = Guid.NewGuid();
        var item2Id = Guid.NewGuid();

        var item1 = new APPItem { Id = item1Id, APPId = app1Id, EstimatedBudgetOverride = 150000m };
        var item2 = new APPItem { Id = item2Id, APPId = app2Id, EstimatedBudgetOverride = 200000m };

        mockAppRepo
            .Setup(r => r.GetByIdAsync(app1Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new APP { Id = app1Id, APPNumber = "APP-2026-001" });
        mockAppRepo
            .Setup(r => r.GetByIdAsync(app2Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new APP { Id = app2Id, APPNumber = "APP-2026-002" });

        mockAppItemRepo
            .Setup(r => r.GetWithDetailsAsync(item1Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(item1);
        mockAppItemRepo
            .Setup(r => r.GetWithDetailsAsync(item2Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(item2);

        mockProjectRepo
            .Setup(r => r.FindAsync(It.IsAny<Expression<Func<ProcurementProject, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ProcurementProject?)null);

        ProcurementProject? savedProject = null;
        mockProjectRepo
            .Setup(r => r.AddAsync(It.IsAny<ProcurementProject>(), It.IsAny<CancellationToken>()))
            .Callback<ProcurementProject, CancellationToken>((p, _) => savedProject = p)
            .Returns(Task.CompletedTask);

        var handler = new CreateProcurementProjectCommandHandler(mockUnitOfWork.Object);
        var command = new CreateProcurementProjectCommand
        {
            SourceType = ProcurementProjectSourceType.APPItem,
            APPIds = new List<Guid> { app1Id, app2Id },
            APPItemIds = new List<Guid> { item1Id, item2Id },
            ResolutionNumber = "BAC-RES-2026-MULTI"
        };

        var response = await handler.Handle(command, CancellationToken.None);

        Assert.True(response.Succeeded);
        Assert.NotNull(savedProject);
        Assert.Equal(350000m, savedProject!.ABC);
        Assert.Equal("Consolidated APP Project (2 Items)", savedProject.Title);
        Assert.Equal(2, savedProject.APPItemLinks.Count);
    }

    [Fact]
    public async Task Handle_AppItemSource_AppItemDoesNotBelongToSelectedApps_FailsValidation()
    {
        var app1Id = Guid.NewGuid();
        var app2Id = Guid.NewGuid();
        var item1Id = Guid.NewGuid();

        // item belongs to app2, but command only selected app1
        var item1 = new APPItem { Id = item1Id, APPId = app2Id, EstimatedBudgetOverride = 150000m };

        mockAppRepo
            .Setup(r => r.GetByIdAsync(app1Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new APP { Id = app1Id, APPNumber = "APP-2026-001" });

        mockAppItemRepo
            .Setup(r => r.GetWithDetailsAsync(item1Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(item1);

        var handler = new CreateProcurementProjectCommandHandler(mockUnitOfWork.Object);
        var command = new CreateProcurementProjectCommand
        {
            SourceType = ProcurementProjectSourceType.APPItem,
            APPIds = new List<Guid> { app1Id },
            APPItemIds = new List<Guid> { item1Id },
            ResolutionNumber = "BAC-RES-2026-INVALID"
        };

        var response = await handler.Handle(command, CancellationToken.None);

        Assert.False(response.Succeeded);
        Assert.Contains("does not belong to any of the selected APPs", response.Message);
    }

    [Fact]
    public async Task Handle_AppItemSource_WithConflictingAbcPayloadOverride_FailsValidation()
    {
        var appId = Guid.NewGuid();
        var appItemId = Guid.NewGuid();
        var appItem = new APPItem
        {
            Id = appItemId,
            APPId = appId,
            EstimatedBudgetOverride = 250000m,
            Remarks = "Test Procurement Line"
        };

        mockAppRepo
            .Setup(r => r.GetByIdAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new APP { Id = appId, APPNumber = "APP-2026-001" });

        mockAppItemRepo
            .Setup(r => r.GetWithDetailsAsync(appItemId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(appItem);

        mockProjectRepo
            .Setup(r => r.FindAsync(It.IsAny<Expression<Func<ProcurementProject, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ProcurementProject?)null);

        var handler = new CreateProcurementProjectCommandHandler(mockUnitOfWork.Object);
        var command = new CreateProcurementProjectCommand
        {
            SourceType = ProcurementProjectSourceType.APPItem,
            APPId = appId,
            APPItemId = appItemId,
            ABC = 300000m,
            ResolutionNumber = "BAC-RES-2026-002"
        };

        var response = await handler.Handle(command, CancellationToken.None);

        Assert.False(response.Succeeded);
        Assert.Contains("Approved Budget (ABC) cannot be overridden", response.Message);
    }

    [Fact]
    public async Task Handle_WithWhereasClauseIds_PopulatesWhereasClauseItemsWithOrder()
    {
        var appId = Guid.NewGuid();
        var appItemId = Guid.NewGuid();
        var appItem = new APPItem
        {
            Id = appItemId,
            APPId = appId,
            EstimatedBudgetOverride = 100000m,
            Remarks = "Test Item"
        };
        var clauseId1 = Guid.NewGuid();
        var clauseId2 = Guid.NewGuid();

        mockAppRepo
            .Setup(r => r.GetByIdAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new APP { Id = appId, APPNumber = "APP-2026-001" });

        mockAppItemRepo
            .Setup(r => r.GetWithDetailsAsync(appItemId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(appItem);

        mockProjectRepo
            .Setup(r => r.FindAsync(It.IsAny<Expression<Func<ProcurementProject, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ProcurementProject?)null);

        var mockClauseRepo = new Mock<IBACResolutionWhereasClauseRepository>();
        mockClauseRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Guid id, CancellationToken _) => new BACResolutionWhereasClause { Id = id, Name = "Clause", Body = "Body" });

        mockUnitOfWork.Setup(u => u.BACResolutionWhereasClauseRepository).Returns(mockClauseRepo.Object);

        ProcurementProject? savedProject = null;
        mockProjectRepo
            .Setup(r => r.AddAsync(It.IsAny<ProcurementProject>(), It.IsAny<CancellationToken>()))
            .Callback<ProcurementProject, CancellationToken>((p, _) => savedProject = p)
            .Returns(Task.CompletedTask);

        var handler = new CreateProcurementProjectCommandHandler(mockUnitOfWork.Object);
        var command = new CreateProcurementProjectCommand
        {
            SourceType = ProcurementProjectSourceType.APPItem,
            APPId = appId,
            APPItemId = appItemId,
            ResolutionNumber = "BAC-RES-2026-003",
            ResolvedLocation = "BAC Conference Room",
            WhereasClauses = new List<WhereasClauseItemInputDto>
            {
                new(clauseId1, 0),
                new(clauseId2, 1)
            }
        };

        var response = await handler.Handle(command, CancellationToken.None);

        Assert.True(response.Succeeded);
        Assert.NotNull(savedProject);
        var res = Assert.Single(savedProject!.BACResolutions);
        Assert.Equal("BAC Conference Room", res.ResolvedLocation);
        Assert.Equal(2, res.WhereasClauseItems.Count);
        var items = new List<BACResolutionWhereasClauseItem>(res.WhereasClauseItems);
        Assert.Equal(clauseId1, items[0].BACResolutionWhereasClauseId);
        Assert.Equal(0, items[0].Order);
        Assert.Equal(clauseId2, items[1].BACResolutionWhereasClauseId);
        Assert.Equal(1, items[1].Order);
    }

    [Fact]
    public async Task Handle_AppItemSource_AllItemsSameMode_SucceedsWithValidatedProcurementModeId()
    {
        var appId = Guid.NewGuid();
        var item1Id = Guid.NewGuid();
        var item2Id = Guid.NewGuid();
        var modeId = Guid.NewGuid();

        var item1 = new APPItem { Id = item1Id, APPId = appId, ProcurementModeId = modeId, EstimatedBudgetOverride = 100000m };
        var item2 = new APPItem { Id = item2Id, APPId = appId, ProcurementModeId = modeId, EstimatedBudgetOverride = 200000m };

        mockAppRepo
            .Setup(r => r.GetByIdAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new APP { Id = appId, APPNumber = "APP-2026-001" });

        mockAppItemRepo
            .Setup(r => r.GetWithDetailsAsync(item1Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(item1);
        mockAppItemRepo
            .Setup(r => r.GetWithDetailsAsync(item2Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(item2);

        mockProjectRepo
            .Setup(r => r.FindAsync(It.IsAny<Expression<Func<ProcurementProject, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ProcurementProject?)null);

        ProcurementProject? savedProject = null;
        mockProjectRepo
            .Setup(r => r.AddAsync(It.IsAny<ProcurementProject>(), It.IsAny<CancellationToken>()))
            .Callback<ProcurementProject, CancellationToken>((p, _) => savedProject = p)
            .Returns(Task.CompletedTask);

        var handler = new CreateProcurementProjectCommandHandler(mockUnitOfWork.Object);
        var command = new CreateProcurementProjectCommand
        {
            SourceType = ProcurementProjectSourceType.APPItem,
            APPIds = new List<Guid> { appId },
            APPItemIds = new List<Guid> { item1Id, item2Id },
            ResolutionNumber = "BAC-RES-2026-SAME-MODE"
        };

        var response = await handler.Handle(command, CancellationToken.None);

        Assert.True(response.Succeeded);
        Assert.NotNull(savedProject);
        Assert.Equal(modeId, savedProject!.ProcurementModeId);
    }

    [Fact]
    public async Task Handle_AppItemSource_TwoDifferentModes_FailsUnderRA12009()
    {
        var appId = Guid.NewGuid();
        var item1Id = Guid.NewGuid();
        var item2Id = Guid.NewGuid();
        var competitiveBiddingModeId = Guid.NewGuid();
        var svpModeId = Guid.NewGuid();

        var item1 = new APPItem { Id = item1Id, APPId = appId, ProcurementModeId = competitiveBiddingModeId, EstimatedBudgetOverride = 500000m };
        var item2 = new APPItem { Id = item2Id, APPId = appId, ProcurementModeId = svpModeId, EstimatedBudgetOverride = 50000m };

        mockAppRepo
            .Setup(r => r.GetByIdAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new APP { Id = appId, APPNumber = "APP-2026-001" });

        mockAppItemRepo
            .Setup(r => r.GetWithDetailsAsync(item1Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(item1);
        mockAppItemRepo
            .Setup(r => r.GetWithDetailsAsync(item2Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(item2);

        var handler = new CreateProcurementProjectCommandHandler(mockUnitOfWork.Object);
        var command = new CreateProcurementProjectCommand
        {
            SourceType = ProcurementProjectSourceType.APPItem,
            APPIds = new List<Guid> { appId },
            APPItemIds = new List<Guid> { item1Id, item2Id },
            ResolutionNumber = "BAC-RES-2026-MIXED"
        };

        var response = await handler.Handle(command, CancellationToken.None);

        Assert.False(response.Succeeded);
        Assert.Contains("All selected APP items must share the same Mode of Procurement", response.Message);
        Assert.Contains("RA 12009", response.Message);
    }

    [Fact]
    public async Task Handle_AppItemSource_ThreeDifferentModes_FailsUnderRA12009()
    {
        var appId = Guid.NewGuid();
        var item1Id = Guid.NewGuid();
        var item2Id = Guid.NewGuid();
        var item3Id = Guid.NewGuid();
        var mode1 = Guid.NewGuid();
        var mode2 = Guid.NewGuid();
        var mode3 = Guid.NewGuid();

        var item1 = new APPItem { Id = item1Id, APPId = appId, ProcurementModeId = mode1 };
        var item2 = new APPItem { Id = item2Id, APPId = appId, ProcurementModeId = mode2 };
        var item3 = new APPItem { Id = item3Id, APPId = appId, ProcurementModeId = mode3 };

        mockAppRepo
            .Setup(r => r.GetByIdAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new APP { Id = appId, APPNumber = "APP-2026-001" });

        mockAppItemRepo
            .Setup(r => r.GetWithDetailsAsync(item1Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(item1);
        mockAppItemRepo
            .Setup(r => r.GetWithDetailsAsync(item2Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(item2);
        mockAppItemRepo
            .Setup(r => r.GetWithDetailsAsync(item3Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(item3);

        var handler = new CreateProcurementProjectCommandHandler(mockUnitOfWork.Object);
        var command = new CreateProcurementProjectCommand
        {
            SourceType = ProcurementProjectSourceType.APPItem,
            APPIds = new List<Guid> { appId },
            APPItemIds = new List<Guid> { item1Id, item2Id, item3Id },
            ResolutionNumber = "BAC-RES-2026-TRI-MIX"
        };

        var response = await handler.Handle(command, CancellationToken.None);

        Assert.False(response.Succeeded);
        Assert.Contains("All selected APP items must share the same Mode of Procurement", response.Message);
    }
}
