using ERPEZ.Application.Features.Planning.APP.Commands.CloneFinalAPP;
using ERPEZ.Application.Features.Planning.APP.Commands.CloneUpdatedAPP;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using FluentAssertions;
using Moq;
using System.Linq.Expressions;
using Xunit;
using AppItemEntity = ERPEZ.Domain.Entities.Planning.APPItem;

namespace Dashboard.Application.UnitTests.Features.Planning.APP;

public class CloneAPPCommandHandlersTests
{
    private readonly Mock<IUnitOfWork> unitOfWorkMock;
    private readonly Mock<IAPPRepository> appRepoMock;
    private readonly Mock<IAPPItemRepository> appItemRepoMock;
    private readonly Mock<IAPPPPMPRepository> appPpmpRepoMock;
    private readonly Mock<IRepository<APPSignatory>> appSignatoryRepoMock;
    private readonly CloneFinalAPPCommandHandler cloneFinalHandler;
    private readonly CloneUpdatedAPPCommandHandler cloneUpdatedHandler;

    public CloneAPPCommandHandlersTests()
    {
        unitOfWorkMock = new Mock<IUnitOfWork>();
        appRepoMock = new Mock<IAPPRepository>();
        appItemRepoMock = new Mock<IAPPItemRepository>();
        appPpmpRepoMock = new Mock<IAPPPPMPRepository>();
        appSignatoryRepoMock = new Mock<IRepository<APPSignatory>>();

        unitOfWorkMock.Setup(u => u.APPRepository).Returns(appRepoMock.Object);
        unitOfWorkMock.Setup(u => u.APPItemRepository).Returns(appItemRepoMock.Object);
        unitOfWorkMock.Setup(u => u.APPPPMPRepository).Returns(appPpmpRepoMock.Object);
        unitOfWorkMock.Setup(u => u.APPSignatoryRepository).Returns(appSignatoryRepoMock.Object);

        cloneFinalHandler = new CloneFinalAPPCommandHandler(unitOfWorkMock.Object);
        cloneUpdatedHandler = new CloneUpdatedAPPCommandHandler(unitOfWorkMock.Object);
    }

    [Fact]
    public async Task CloneFinalAPP_WhenFinalAppAlreadyExistsForIndicativeApp_ThrowsConflictExceptionWithActionableMessage()
    {
        // Arrange
        var indicativeAppId = Guid.NewGuid();
        var indicativeApp = new ERPEZ.Domain.Entities.Planning.APP
        {
            Id = indicativeAppId,
            APPNumber = "APP-2026-IND",
            Name = "Indicative APP 2026",
            APPType = "Indicative",
            Status = StatusEnum.Approved
        };

        var existingFinalApp = new ERPEZ.Domain.Entities.Planning.APP
        {
            Id = Guid.NewGuid(),
            APPNumber = "APP-2026-FINAL",
            Name = "Final APP 2026",
            APPType = "Final",
            SourceAPPId = indicativeAppId,
            Status = StatusEnum.Approved
        };

        appRepoMock.Setup(r => r.GetAPPWithDetailsAsync(indicativeAppId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(indicativeApp);

        appRepoMock.Setup(r => r.Query(It.IsAny<Expression<Func<ERPEZ.Domain.Entities.Planning.APP, bool>>>(), It.IsAny<bool?>()))
            .Returns(new List<ERPEZ.Domain.Entities.Planning.APP> { existingFinalApp }.AsQueryable());

        appRepoMock.Setup(r => r.GetFirstAsync(It.IsAny<IQueryable<ERPEZ.Domain.Entities.Planning.APP>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingFinalApp);

        var command = new CloneFinalAPPCommand { SourceAppId = indicativeAppId };

        // Act
        var act = () => cloneFinalHandler.Handle(command, CancellationToken.None);

        // Assert
        var ex = await act.Should().ThrowAsync<ConflictException>();
        ex.WithMessage("*A Final APP already exists for this Indicative APP (APP-2026-FINAL)*");
    }

    [Fact]
    public async Task CloneFinalAPP_WhenSourceIsApprovedIndicativeApp_CreatesDraftFinalAppWithSourceAPPId()
    {
        // Arrange
        var indicativeAppId = Guid.NewGuid();
        var fiscalYearId = Guid.NewGuid();
        var indicativeApp = new ERPEZ.Domain.Entities.Planning.APP
        {
            Id = indicativeAppId,
            APPNumber = "APP-2026-IND",
            Name = "Indicative APP 2026",
            APPType = "Indicative",
            FiscalYearId = fiscalYearId,
            Status = StatusEnum.Approved,
            FiscalYear = new FiscalYear { Id = fiscalYearId, Year = 2026 }
        };

        appRepoMock.Setup(r => r.GetAPPWithDetailsAsync(indicativeAppId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(indicativeApp);

        appRepoMock.Setup(r => r.GetFirstAsync(It.IsAny<IQueryable<ERPEZ.Domain.Entities.Planning.APP>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ERPEZ.Domain.Entities.Planning.APP?)null);

        appRepoMock.Setup(r => r.HasAPPNumberAsync("APP-2026-IND-FINAL", It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        ERPEZ.Domain.Entities.Planning.APP? savedFinalApp = null;
        appRepoMock.Setup(r => r.AddAsync(It.IsAny<ERPEZ.Domain.Entities.Planning.APP>(), It.IsAny<CancellationToken>()))
            .Callback<ERPEZ.Domain.Entities.Planning.APP, CancellationToken>((a, _) => savedFinalApp = a)
            .Returns(Task.CompletedTask);

        var command = new CloneFinalAPPCommand { SourceAppId = indicativeAppId };

        // Act
        var result = await cloneFinalHandler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        savedFinalApp.Should().NotBeNull();
        savedFinalApp!.APPType.Should().Be("Final");
        savedFinalApp.Status.Should().Be(StatusEnum.Draft);
        savedFinalApp.SourceAPPId.Should().Be(indicativeAppId);
        savedFinalApp.APPNumber.Should().Be("APP-2026-IND-FINAL");
        savedFinalApp.VersionNumber.Should().Be(1);
    }

    [Fact]
    public async Task CloneFinalAPP_WhenSourceIsNotApproved_ThrowsValidationException()
    {
        // Arrange
        var indicativeAppId = Guid.NewGuid();
        var indicativeApp = new ERPEZ.Domain.Entities.Planning.APP
        {
            Id = indicativeAppId,
            APPNumber = "APP-2026-IND",
            APPType = "Indicative",
            Status = StatusEnum.Draft
        };

        appRepoMock.Setup(r => r.GetAPPWithDetailsAsync(indicativeAppId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(indicativeApp);

        var command = new CloneFinalAPPCommand { SourceAppId = indicativeAppId };

        // Act
        var act = () => cloneFinalHandler.Handle(command, CancellationToken.None);

        // Assert
        var ex = await act.Should().ThrowAsync<ValidationException>();
        ex.WithMessage("*can only be created from an Approved Indicative APP*");
    }

    [Fact]
    public async Task CloneFinalAPP_WhenSourceIsNotIndicative_ThrowsValidationException()
    {
        // Arrange
        var finalAppId = Guid.NewGuid();
        var finalApp = new ERPEZ.Domain.Entities.Planning.APP
        {
            Id = finalAppId,
            APPNumber = "APP-2026-FINAL",
            APPType = "Final",
            Status = StatusEnum.Approved
        };

        appRepoMock.Setup(r => r.GetAPPWithDetailsAsync(finalAppId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(finalApp);

        var command = new CloneFinalAPPCommand { SourceAppId = finalAppId };

        // Act
        var act = () => cloneFinalHandler.Handle(command, CancellationToken.None);

        // Assert
        var ex = await act.Should().ThrowAsync<ValidationException>();
        ex.WithMessage("*A Final APP can only be created from an Indicative APP*");
    }

    [Fact]
    public async Task CloneFinalAPP_DistinctIndicativeApps_CanEachProduceTheirOwnFinalApp()
    {
        // Arrange: Indicative App 2 has no existing Final APP even though Indicative App 1 already has one
        var indicativeApp2Id = Guid.NewGuid();
        var fiscalYearId = Guid.NewGuid();
        var indicativeApp2 = new ERPEZ.Domain.Entities.Planning.APP
        {
            Id = indicativeApp2Id,
            APPNumber = "APP-2026-BATCH2-IND",
            Name = "Indicative APP 2026 Batch 2",
            APPType = "Indicative",
            Batch = "Batch 2",
            FiscalYearId = fiscalYearId,
            Status = StatusEnum.Approved,
            FiscalYear = new FiscalYear { Id = fiscalYearId, Year = 2026 }
        };

        appRepoMock.Setup(r => r.GetAPPWithDetailsAsync(indicativeApp2Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(indicativeApp2);

        // For Indicative App 2, existingFinal lookup returns null
        appRepoMock.Setup(r => r.GetFirstAsync(It.IsAny<IQueryable<ERPEZ.Domain.Entities.Planning.APP>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ERPEZ.Domain.Entities.Planning.APP?)null);

        appRepoMock.Setup(r => r.HasAPPNumberAsync("APP-2026-BATCH2-IND-FINAL", It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        ERPEZ.Domain.Entities.Planning.APP? savedFinalApp = null;
        appRepoMock.Setup(r => r.AddAsync(It.IsAny<ERPEZ.Domain.Entities.Planning.APP>(), It.IsAny<CancellationToken>()))
            .Callback<ERPEZ.Domain.Entities.Planning.APP, CancellationToken>((a, _) => savedFinalApp = a)
            .Returns(Task.CompletedTask);

        var command = new CloneFinalAPPCommand { SourceAppId = indicativeApp2Id };

        // Act
        var result = await cloneFinalHandler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        savedFinalApp.Should().NotBeNull();
        savedFinalApp!.SourceAPPId.Should().Be(indicativeApp2Id);
        savedFinalApp.APPNumber.Should().Be("APP-2026-BATCH2-IND-FINAL");
    }

    [Fact]
    public async Task CloneUpdatedAPP_WhenCloningFromFinalAppWithOverriddenMoP_PreservesOverriddenMoP()
    {
        // Arrange
        var finalAppId = Guid.NewGuid();
        var fiscalYearId = Guid.NewGuid();
        var publicBiddingModeId = Guid.NewGuid();
        var ppmpItemId = Guid.NewGuid();

        var finalApp = new ERPEZ.Domain.Entities.Planning.APP
        {
            Id = finalAppId,
            APPNumber = "APP-2026-FINAL",
            Name = "Final APP 2026",
            APPType = "Final",
            FiscalYearId = fiscalYearId,
            Status = StatusEnum.Approved,
            IsFinal = "true",
            FiscalYear = new FiscalYear { Id = fiscalYearId, Year = 2026 },
            APPItems = new List<AppItemEntity>
            {
                new AppItemEntity
                {
                    Id = Guid.NewGuid(),
                    APPId = finalAppId,
                    PPMPItemId = ppmpItemId,
                    ProcurementModeId = publicBiddingModeId, // Overridden to Public Bidding
                    EstimatedBudgetOverride = 500000m,
                    Remarks = "Overridden for Public Bidding"
                }
            }
        };

        appRepoMock.Setup(r => r.GetAPPWithDetailsAsync(finalAppId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(finalApp);

        appRepoMock.Setup(r => r.GetNextVersionNumberAsync(finalAppId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(2);

        appRepoMock.Setup(r => r.HasAPPNumberAsync("APP-2026-FINAL-V2", It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        ERPEZ.Domain.Entities.Planning.APP? savedUpdatedApp = null;
        var savedItems = new List<AppItemEntity>();

        appRepoMock.Setup(r => r.AddAsync(It.IsAny<ERPEZ.Domain.Entities.Planning.APP>(), It.IsAny<CancellationToken>()))
            .Callback<ERPEZ.Domain.Entities.Planning.APP, CancellationToken>((a, _) => savedUpdatedApp = a)
            .Returns(Task.CompletedTask);

        appItemRepoMock.Setup(r => r.AddAsync(It.IsAny<AppItemEntity>(), It.IsAny<CancellationToken>()))
            .Callback<AppItemEntity, CancellationToken>((item, _) => savedItems.Add(item))
            .Returns(Task.CompletedTask);

        var command = new CloneUpdatedAPPCommand { SourceAppId = finalAppId };

        // Act
        var result = await cloneUpdatedHandler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        savedUpdatedApp.Should().NotBeNull();
        savedUpdatedApp!.APPType.Should().Be("Updated");
        savedUpdatedApp.VersionNumber.Should().Be(2);
        savedUpdatedApp.SourceAPPId.Should().Be(finalAppId);

        savedItems.Should().HaveCount(1);
        var clonedItem = savedItems.Single();
        clonedItem.PPMPItemId.Should().Be(ppmpItemId);
        // CRUCIAL: Overridden Mode of Procurement (Public Bidding) is preserved!
        clonedItem.ProcurementModeId.Should().Be(publicBiddingModeId);
        clonedItem.EstimatedBudgetOverride.Should().Be(500000m);
        clonedItem.Remarks.Should().Be("Overridden for Public Bidding");
    }
}
