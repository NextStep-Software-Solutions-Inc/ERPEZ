using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.Projects.Commands.CreateProcurementProject;
using ERPEZ.Application.Features.Procurement.Projects.Commands.UpdateProcurementProject;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using Moq;
using Xunit;

namespace ERPEZ.Dashboard.Application.UnitTests.Features.Procurement.Commands.UpdateProcurementProject;

public class UpdateProcurementProjectCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> mockUnitOfWork = new();
    private readonly Mock<IProcurementProjectRepository> mockProjectRepo = new();
    private readonly Mock<IAPPItemRepository> mockAppItemRepo = new();
    private readonly Mock<IResolutionClauseRepository> mockClauseRepo = new();

    public UpdateProcurementProjectCommandHandlerTests()
    {
        mockUnitOfWork.Setup(u => u.ProcurementProjectRepository).Returns(mockProjectRepo.Object);
        mockUnitOfWork.Setup(u => u.APPItemRepository).Returns(mockAppItemRepo.Object);
        mockUnitOfWork.Setup(u => u.ResolutionClauseRepository).Returns(mockClauseRepo.Object);
    }

    [Fact]
    public async Task Handle_WhenEditingDraftResolution_PreservesExistingResolutionIdAndDoesNotAddDuplicate()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var resolutionId = Guid.NewGuid();

        var existingResolution = new BACResolution
        {
            Id = resolutionId,
            ProcurementProjectId = projectId,
            ResolutionNumber = "BAC-RES-2026-421",
            ResolutionType = "Recommend Mode of Procurement",
            Status = "Draft",
            DateResolved = DateTime.UtcNow.AddDays(-1),
            ResolvedLocation = "Conference Room A"
        };

        var project = new ProcurementProject
        {
            Id = projectId,
            Title = "Draft Equipment Package",
            Status = "Draft",
            BACResolutions = [existingResolution]
        };

        mockProjectRepo
            .Setup(r => r.GetWithDetailsForUpdateAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(project);

        var handler = new UpdateProcurementProjectCommandHandler(mockUnitOfWork.Object);

        var updateRequest = new UpdateProcurementProjectRequest
        {
            Title = "Updated Equipment Package",
            ResolutionNumber = "BAC-RES-2026-421-REVISED",
            ResolutionType = "Recommend Mode of Procurement",
            ResolvedLocation = "Main Boardroom",
            DateResolved = DateTime.UtcNow
        };

        var command = new UpdateProcurementProjectCommand
        {
            Id = projectId,
            UpdateRequest = updateRequest
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.Succeeded);
        Assert.Single(project.BACResolutions); // Exactly 1 resolution remains, no duplicates

        var updatedResolution = project.BACResolutions.First();
        Assert.Equal(resolutionId, updatedResolution.Id); // ID remains completely stable
        Assert.Equal("BAC-RES-2026-421-REVISED", updatedResolution.ResolutionNumber);
        Assert.Equal("Main Boardroom", updatedResolution.ResolvedLocation);
    }

    [Fact]
    public async Task Handle_RepeatedDraftUpdates_NeverInsertsDuplicateBACResolutionRows()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var resolutionId = Guid.NewGuid();

        var existingResolution = new BACResolution
        {
            Id = resolutionId,
            ProcurementProjectId = projectId,
            ResolutionNumber = "BAC-RES-2026-421",
            ResolutionType = "Recommend Mode of Procurement",
            Status = "Draft"
        };

        var project = new ProcurementProject
        {
            Id = projectId,
            Title = "Test Project",
            Status = "Draft",
            BACResolutions = [existingResolution]
        };

        mockProjectRepo
            .Setup(r => r.GetWithDetailsForUpdateAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(project);

        var handler = new UpdateProcurementProjectCommandHandler(mockUnitOfWork.Object);

        // Act: simulate multiple successive draft saves
        for (int i = 1; i <= 5; i++)
        {
            var updateRequest = new UpdateProcurementProjectRequest
            {
                Title = $"Test Project Save #{i}",
                ResolutionNumber = "BAC-RES-2026-421",
                ResolutionType = "Recommend Mode of Procurement",
                ResolvedLocation = $"Room {i}"
            };

            var command = new UpdateProcurementProjectCommand
            {
                Id = projectId,
                UpdateRequest = updateRequest
            };

            var result = await handler.Handle(command, CancellationToken.None);
            Assert.True(result.Succeeded);
        }

        // Assert: Count is still 1
        Assert.Single(project.BACResolutions);
        Assert.Equal(resolutionId, project.BACResolutions.First().Id);
        Assert.Equal("Room 5", project.BACResolutions.First().ResolvedLocation);
    }

    [Fact]
    public async Task Handle_WhenProjectHasMultipleResolutionTypes_UpdatesTargetedResolutionInPlace()
    {
        // Arrange: Project with 2 distinct milestone resolutions (e.g. Mode recommendation + Award recommendation)
        var projectId = Guid.NewGuid();
        var modeResId = Guid.NewGuid();
        var awardResId = Guid.NewGuid();

        var modeResolution = new BACResolution
        {
            Id = modeResId,
            ProcurementProjectId = projectId,
            ResolutionNumber = "BAC-RES-2026-MODE-01",
            ResolutionType = "Recommend Mode of Procurement",
            Status = "Approved"
        };

        var awardResolution = new BACResolution
        {
            Id = awardResId,
            ProcurementProjectId = projectId,
            ResolutionNumber = "BAC-RES-2026-AWARD-01",
            ResolutionType = "Award Recommendation",
            Status = "Draft",
            ResolvedLocation = "Room 101"
        };

        var project = new ProcurementProject
        {
            Id = projectId,
            Title = "Multi-Milestone Project",
            Status = "Draft",
            BACResolutions = [modeResolution, awardResolution]
        };

        mockProjectRepo
            .Setup(r => r.GetWithDetailsForUpdateAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(project);

        var handler = new UpdateProcurementProjectCommandHandler(mockUnitOfWork.Object);

        var updateRequest = new UpdateProcurementProjectRequest
        {
            ResolutionNumber = "BAC-RES-2026-AWARD-01",
            ResolutionType = "Award Recommendation",
            ResolvedLocation = "Executive Boardroom"
        };

        var command = new UpdateProcurementProjectCommand
        {
            Id = projectId,
            UpdateRequest = updateRequest
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.Succeeded);
        Assert.Equal(2, project.BACResolutions.Count); // Preserves both resolutions

        var updatedAward = project.BACResolutions.First(r => r.Id == awardResId);
        Assert.Equal("Executive Boardroom", updatedAward.ResolvedLocation);

        var untouchedMode = project.BACResolutions.First(r => r.Id == modeResId);
        Assert.Equal("BAC-RES-2026-MODE-01", untouchedMode.ResolutionNumber);
    }
}
