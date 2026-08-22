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
    private readonly Mock<IAPPItemRepository> mockAppItemRepo = new();
    private readonly Mock<IProcurementProjectRepository> mockProjectRepo = new();

    public CreateProcurementProjectCommandHandlerTests()
    {
        mockUnitOfWork.Setup(u => u.APPItemRepository).Returns(mockAppItemRepo.Object);
        mockUnitOfWork.Setup(u => u.ProcurementProjectRepository).Returns(mockProjectRepo.Object);
    }

    [Fact]
    public async Task Handle_AppItemSource_WithoutAbcPayload_InheritsAppItemEffectiveAbc()
    {
        var appItemId = Guid.NewGuid();
        var appItem = new APPItem
        {
            Id = appItemId,
            EstimatedBudgetOverride = 250000m,
            Remarks = "Test Procurement Line"
        };

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
    public async Task Handle_AppItemSource_WithAbcPayloadOverride_UsesPayloadValue()
    {
        var appItemId = Guid.NewGuid();
        var appItem = new APPItem
        {
            Id = appItemId,
            EstimatedBudgetOverride = 250000m,
            Remarks = "Test Procurement Line"
        };

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
            APPItemId = appItemId,
            ABC = 300000m,
            ResolutionNumber = "BAC-RES-2026-002"
        };

        var response = await handler.Handle(command, CancellationToken.None);

        Assert.True(response.Succeeded);
        Assert.NotNull(savedProject);
        Assert.Equal(300000m, savedProject!.ABC);
    }
}
