using ERPEZ.Application.Features.Planning.APP.Commands.SelectPPMPs;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using FluentAssertions;
using Moq;
using System.Linq.Expressions;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Planning.APP;

public class SelectPPMPsCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> unitOfWorkMock;
    private readonly Mock<IAPPRepository> appRepoMock;
    private readonly Mock<IPPMPRepository> ppmpRepoMock;
    private readonly Mock<IAPPPPMPRepository> appPpmpRepoMock;
    private readonly Mock<IAPPItemRepository> appItemRepoMock;
    private readonly SelectPPMPsCommandHandler handler;

    public SelectPPMPsCommandHandlerTests()
    {
        unitOfWorkMock = new Mock<IUnitOfWork>();
        appRepoMock = new Mock<IAPPRepository>();
        ppmpRepoMock = new Mock<IPPMPRepository>();
        appPpmpRepoMock = new Mock<IAPPPPMPRepository>();
        appItemRepoMock = new Mock<IAPPItemRepository>();

        unitOfWorkMock.Setup(u => u.APPRepository).Returns(appRepoMock.Object);
        unitOfWorkMock.Setup(u => u.PPMPRepository).Returns(ppmpRepoMock.Object);
        unitOfWorkMock.Setup(u => u.APPPPMPRepository).Returns(appPpmpRepoMock.Object);
        unitOfWorkMock.Setup(u => u.APPItemRepository).Returns(appItemRepoMock.Object);

        handler = new SelectPPMPsCommandHandler(unitOfWorkMock.Object);
    }

    [Fact]
    public async Task SelectPPMPs_WhenPPMPHasNoExistingLink_SuccessfullyLinksPPMPToAPP()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var fiscalYearId = Guid.NewGuid();
        var ppmpId = Guid.NewGuid();

        var app = new ERPEZ.Domain.Entities.Planning.APP
        {
            Id = appId,
            APPNumber = "APP-2026-001",
            FiscalYearId = fiscalYearId,
            APPType = "Indicative"
        };

        var ppmp = new ERPEZ.Domain.Entities.Planning.PPMP
        {
            Id = ppmpId,
            PPMPNumber = "FY-2026-0011",
            FiscalYearId = fiscalYearId,
            Status = StatusEnum.Approved
        };

        appRepoMock.Setup(r => r.GetAPPWithDetailsAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        ppmpRepoMock.Setup(r => r.FindAllAsync(It.IsAny<Expression<Func<ERPEZ.Domain.Entities.Planning.PPMP, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ERPEZ.Domain.Entities.Planning.PPMP> { ppmp });

        // No active links across any APP
        appPpmpRepoMock.Setup(r => r.GetActiveLinksByPPMPIdsAsync(It.IsAny<IEnumerable<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<APPPPMP>());

        appPpmpRepoMock.Setup(r => r.GetLinksByAppAndPpmpIdsAsync(appId, It.IsAny<IEnumerable<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<APPPPMP>());

        var addedLinks = new List<APPPPMP>();
        appPpmpRepoMock.Setup(r => r.AddRangeAsync(It.IsAny<IEnumerable<APPPPMP>>(), It.IsAny<CancellationToken>()))
            .Callback<IEnumerable<APPPPMP>, CancellationToken>((links, _) => addedLinks.AddRange(links))
            .Returns(Task.CompletedTask);

        var command = new SelectPPMPsCommand
        {
            APPId = appId,
            PPMPIds = [ppmpId]
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        addedLinks.Should().HaveCount(1);
        addedLinks.Single().PPMPId.Should().Be(ppmpId);
        addedLinks.Single().APPId.Should().Be(appId);
    }

    [Fact]
    public async Task SelectPPMPs_WhenPPMPAlreadyConsolidatedInUnrelatedAPP_ThrowsConflictExceptionWithOwningAPPNumber()
    {
        // Arrange
        var targetAppId = Guid.NewGuid();
        var unrelatedAppId = Guid.NewGuid();
        var fiscalYearId = Guid.NewGuid();
        var ppmpId = Guid.NewGuid();

        var targetApp = new ERPEZ.Domain.Entities.Planning.APP
        {
            Id = targetAppId,
            APPNumber = "APP-2026-TARGET",
            FiscalYearId = fiscalYearId,
            APPType = "Indicative"
        };

        var unrelatedApp = new ERPEZ.Domain.Entities.Planning.APP
        {
            Id = unrelatedAppId,
            APPNumber = "APP-2026-EXISTING-01",
            FiscalYearId = fiscalYearId,
            APPType = "Indicative"
        };

        var ppmp = new ERPEZ.Domain.Entities.Planning.PPMP
        {
            Id = ppmpId,
            PPMPNumber = "FY-2026-0011",
            FiscalYearId = fiscalYearId,
            Status = StatusEnum.Approved
        };

        var existingOtherLink = new APPPPMP
        {
            Id = Guid.NewGuid(),
            APPId = unrelatedAppId,
            PPMPId = ppmpId,
            APP = unrelatedApp
        };

        appRepoMock.Setup(r => r.GetAPPWithDetailsAsync(targetAppId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(targetApp);

        ppmpRepoMock.Setup(r => r.FindAllAsync(It.IsAny<Expression<Func<ERPEZ.Domain.Entities.Planning.PPMP, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ERPEZ.Domain.Entities.Planning.PPMP> { ppmp });

        appPpmpRepoMock.Setup(r => r.GetActiveLinksByPPMPIdsAsync(It.IsAny<IEnumerable<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<APPPPMP> { existingOtherLink });

        var command = new SelectPPMPsCommand
        {
            APPId = targetAppId,
            PPMPIds = [ppmpId]
        };

        // Act
        var act = () => handler.Handle(command, CancellationToken.None);

        // Assert
        var ex = await act.Should().ThrowAsync<ConflictException>();
        ex.WithMessage("*PPMP 'FY-2026-0011' is already consolidated in APP 'APP-2026-EXISTING-01'*");
    }

    [Fact]
    public async Task SelectPPMPs_WhenPPMPAlreadyLinkedToSameAPP_ThrowsConflictException()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var fiscalYearId = Guid.NewGuid();
        var ppmpId = Guid.NewGuid();

        var app = new ERPEZ.Domain.Entities.Planning.APP
        {
            Id = appId,
            APPNumber = "APP-2026-001",
            FiscalYearId = fiscalYearId,
            APPType = "Indicative"
        };

        var ppmp = new ERPEZ.Domain.Entities.Planning.PPMP
        {
            Id = ppmpId,
            PPMPNumber = "FY-2026-0011",
            FiscalYearId = fiscalYearId,
            Status = StatusEnum.Approved
        };

        var sameAppLink = new APPPPMP
        {
            Id = Guid.NewGuid(),
            APPId = appId,
            PPMPId = ppmpId,
            APP = app
        };

        appRepoMock.Setup(r => r.GetAPPWithDetailsAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        ppmpRepoMock.Setup(r => r.FindAllAsync(It.IsAny<Expression<Func<ERPEZ.Domain.Entities.Planning.PPMP, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ERPEZ.Domain.Entities.Planning.PPMP> { ppmp });

        // Query across all APPs returns only the link to this same APP
        appPpmpRepoMock.Setup(r => r.GetActiveLinksByPPMPIdsAsync(It.IsAny<IEnumerable<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<APPPPMP> { sameAppLink });

        appPpmpRepoMock.Setup(r => r.GetLinksByAppAndPpmpIdsAsync(appId, It.IsAny<IEnumerable<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<APPPPMP> { sameAppLink });

        var command = new SelectPPMPsCommand
        {
            APPId = appId,
            PPMPIds = [ppmpId]
        };

        // Act
        var act = () => handler.Handle(command, CancellationToken.None);

        // Assert
        var ex = await act.Should().ThrowAsync<ConflictException>();
        ex.WithMessage("*already linked to this APP: FY-2026-0011*");
    }

    [Fact]
    public async Task SelectPPMPs_WhenPPMPBelongsToSameLineage_AllowsConsolidation()
    {
        // Arrange
        var rootIndicativeAppId = Guid.NewGuid();
        var updatedAppId = Guid.NewGuid();
        var fiscalYearId = Guid.NewGuid();
        var ppmpId = Guid.NewGuid();

        var rootIndicativeApp = new ERPEZ.Domain.Entities.Planning.APP
        {
            Id = rootIndicativeAppId,
            APPNumber = "APP-2026-IND",
            FiscalYearId = fiscalYearId,
            APPType = "Indicative"
        };

        var updatedApp = new ERPEZ.Domain.Entities.Planning.APP
        {
            Id = updatedAppId,
            APPNumber = "APP-2026-UPDATED-V2",
            FiscalYearId = fiscalYearId,
            APPType = "Updated",
            SourceAPPId = rootIndicativeAppId,
            SourceAPP = rootIndicativeApp
        };

        var ppmp = new ERPEZ.Domain.Entities.Planning.PPMP
        {
            Id = ppmpId,
            PPMPNumber = "FY-2026-0011",
            FiscalYearId = fiscalYearId,
            Status = StatusEnum.Approved
        };

        // Existing link is in root Indicative APP (same lineage!)
        var indicativeLink = new APPPPMP
        {
            Id = Guid.NewGuid(),
            APPId = rootIndicativeAppId,
            PPMPId = ppmpId,
            APP = rootIndicativeApp
        };

        appRepoMock.Setup(r => r.GetAPPWithDetailsAsync(updatedAppId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(updatedApp);

        ppmpRepoMock.Setup(r => r.FindAllAsync(It.IsAny<Expression<Func<ERPEZ.Domain.Entities.Planning.PPMP, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ERPEZ.Domain.Entities.Planning.PPMP> { ppmp });

        appPpmpRepoMock.Setup(r => r.GetActiveLinksByPPMPIdsAsync(It.IsAny<IEnumerable<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<APPPPMP> { indicativeLink });

        appPpmpRepoMock.Setup(r => r.GetLinksByAppAndPpmpIdsAsync(updatedAppId, It.IsAny<IEnumerable<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<APPPPMP>());

        var addedLinks = new List<APPPPMP>();
        appPpmpRepoMock.Setup(r => r.AddRangeAsync(It.IsAny<IEnumerable<APPPPMP>>(), It.IsAny<CancellationToken>()))
            .Callback<IEnumerable<APPPPMP>, CancellationToken>((links, _) => addedLinks.AddRange(links))
            .Returns(Task.CompletedTask);

        var command = new SelectPPMPsCommand
        {
            APPId = updatedAppId,
            PPMPIds = [ppmpId]
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        addedLinks.Should().HaveCount(1);
    }

    [Fact]
    public async Task SelectPPMPs_DistinctPPMPsInSameFiscalYear_CanBeAddedToTheirRespectiveAPPs()
    {
        // Arrange: 2 separate Indicative APPs (e.g. Batch 1 and Batch 2), 2 distinct PPMPs
        var batch2AppId = Guid.NewGuid();
        var fiscalYearId = Guid.NewGuid();
        var ppmp2Id = Guid.NewGuid();

        var batch2App = new ERPEZ.Domain.Entities.Planning.APP
        {
            Id = batch2AppId,
            APPNumber = "APP-2026-BATCH-2",
            FiscalYearId = fiscalYearId,
            APPType = "Indicative",
            Batch = "Batch 2"
        };

        var ppmp2 = new ERPEZ.Domain.Entities.Planning.PPMP
        {
            Id = ppmp2Id,
            PPMPNumber = "FY-2026-0022",
            FiscalYearId = fiscalYearId,
            Status = StatusEnum.Approved
        };

        appRepoMock.Setup(r => r.GetAPPWithDetailsAsync(batch2AppId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(batch2App);

        ppmpRepoMock.Setup(r => r.FindAllAsync(It.IsAny<Expression<Func<ERPEZ.Domain.Entities.Planning.PPMP, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ERPEZ.Domain.Entities.Planning.PPMP> { ppmp2 });

        // PPMP2 has no other APP links
        appPpmpRepoMock.Setup(r => r.GetActiveLinksByPPMPIdsAsync(It.IsAny<IEnumerable<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<APPPPMP>());

        appPpmpRepoMock.Setup(r => r.GetLinksByAppAndPpmpIdsAsync(batch2AppId, It.IsAny<IEnumerable<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<APPPPMP>());

        var addedLinks = new List<APPPPMP>();
        appPpmpRepoMock.Setup(r => r.AddRangeAsync(It.IsAny<IEnumerable<APPPPMP>>(), It.IsAny<CancellationToken>()))
            .Callback<IEnumerable<APPPPMP>, CancellationToken>((links, _) => addedLinks.AddRange(links))
            .Returns(Task.CompletedTask);

        var command = new SelectPPMPsCommand
        {
            APPId = batch2AppId,
            PPMPIds = [ppmp2Id]
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        addedLinks.Should().HaveCount(1);
        addedLinks.Single().PPMPId.Should().Be(ppmp2Id);
        addedLinks.Single().APPId.Should().Be(batch2AppId);
    }
}
