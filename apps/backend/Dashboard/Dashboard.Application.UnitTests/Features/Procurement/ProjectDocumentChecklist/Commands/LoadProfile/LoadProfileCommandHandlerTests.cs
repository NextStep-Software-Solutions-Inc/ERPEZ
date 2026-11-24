using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Commands.LoadProfile;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using Moq;
using Xunit;

namespace ERPEZ.Dashboard.Application.UnitTests.Features.Procurement.ProjectDocumentChecklist.Commands.LoadProfile;

public class LoadProfileCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> mockUnitOfWork = new();
    private readonly Mock<IProcurementProjectRepository> mockProjectRepo = new();
    private readonly Mock<IDocumentProfileRepository> mockProfileRepo = new();
    private readonly Mock<IProjectDocumentChecklistRepository> mockChecklistRepo = new();
    private readonly Mock<IProcurementModeRepository> mockProcModeRepo = new();
    private readonly Mock<IProcurementCategoryRepository> mockProcCatRepo = new();
    private readonly Mock<IAPPItemRepository> mockAppItemRepo = new();

    public LoadProfileCommandHandlerTests()
    {
        mockUnitOfWork.Setup(u => u.ProcurementProjectRepository).Returns(mockProjectRepo.Object);
        mockUnitOfWork.Setup(u => u.DocumentProfileRepository).Returns(mockProfileRepo.Object);
        mockUnitOfWork.Setup(u => u.ProjectDocumentChecklistRepository).Returns(mockChecklistRepo.Object);
        mockUnitOfWork.Setup(u => u.ProcurementModeRepository).Returns(mockProcModeRepo.Object);
        mockUnitOfWork.Setup(u => u.ProcurementCategoryRepository).Returns(mockProcCatRepo.Object);
        mockUnitOfWork.Setup(u => u.APPItemRepository).Returns(mockAppItemRepo.Object);
        mockUnitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
    }

    [Fact]
    public async Task Handle_ValidProfile_CopiesDocumentsAndInheritsEnvelopesCorrectly()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var profileId = Guid.NewGuid();
        var doc1Id = Guid.NewGuid();
        var doc2Id = Guid.NewGuid();

        var project = new ProcurementProject
        {
            Id = projectId,
            Status = "Draft",
            Title = "Office Supplies Procurement"
        };

        var profile = new DocumentProfile
        {
            Id = profileId,
            Name = "STANDARD COMPETITIVE BIDDING – GOODS",
            ProcurementCategory = "Goods",
            DocumentProfileItems =
            [
                new DocumentProfileItem
                {
                    Id = Guid.NewGuid(),
                    MasterDocumentTypeId = doc1Id,
                    OrderIndex = 1,
                    IsDeleted = false,
                    MasterDocumentType = new MasterDocumentType
                    {
                        Id = doc1Id,
                        Name = "Omnibus Sworn Statement",
                        EnvelopeType = 1
                    }
                },
                new DocumentProfileItem
                {
                    Id = Guid.NewGuid(),
                    MasterDocumentTypeId = doc2Id,
                    OrderIndex = 2,
                    IsDeleted = false,
                    MasterDocumentType = new MasterDocumentType
                    {
                        Id = doc2Id,
                        Name = "Financial Bid Form",
                        EnvelopeType = 2
                    }
                }
            ]
        };

        mockProjectRepo.Setup(r => r.GetByIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(project);
        mockProfileRepo.Setup(r => r.GetByIdWithItemsAsync(profileId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(profile);
        mockChecklistRepo.Setup(r => r.GetByProjectIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        List<ERPEZ.Domain.Entities.Procurement.ProjectDocumentChecklist>? addedItems = null;
        mockChecklistRepo.Setup(r => r.AddRangeAsync(It.IsAny<IEnumerable<ERPEZ.Domain.Entities.Procurement.ProjectDocumentChecklist>>(), It.IsAny<CancellationToken>()))
            .Callback<IEnumerable<ERPEZ.Domain.Entities.Procurement.ProjectDocumentChecklist>, CancellationToken>((items, _) => addedItems = items.ToList())
            .Returns(Task.CompletedTask);

        var handler = new LoadProfileCommandHandler(mockUnitOfWork.Object);

        // Act
        var result = await handler.Handle(new LoadProfileCommand
        {
            ProcurementProjectId = projectId,
            DocumentProfileId = profileId
        }, CancellationToken.None);

        // Assert
        Assert.True(result.Succeeded);
        Assert.NotNull(addedItems);
        Assert.Equal(2, addedItems.Count);

        var item1 = addedItems.First(i => i.MasterDocumentTypeId == doc1Id);
        Assert.Equal(1, item1.EnvelopeType); // Technical / Eligibility
        Assert.True(item1.IsRequired);
        Assert.Equal(1, item1.OrderIndex);

        var item2 = addedItems.First(i => i.MasterDocumentTypeId == doc2Id);
        Assert.Equal(2, item2.EnvelopeType); // Financial
        Assert.True(item2.IsRequired);
        Assert.Equal(2, item2.OrderIndex);
    }

    [Fact]
    public async Task Handle_ExistingDraftChecklist_ReplacesItemsAccordingToContract()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var profileId = Guid.NewGuid();

        var project = new ProcurementProject
        {
            Id = projectId,
            Status = "Draft"
        };

        var oldItem = new ERPEZ.Domain.Entities.Procurement.ProjectDocumentChecklist
        {
            Id = Guid.NewGuid(),
            ProcurementProjectId = projectId,
            EnvelopeType = 1,
            CustomDocumentName = "Old Single Requirement"
        };

        var profile = new DocumentProfile
        {
            Id = profileId,
            Name = "New Profile",
            DocumentProfileItems =
            [
                new DocumentProfileItem
                {
                    Id = Guid.NewGuid(),
                    MasterDocumentTypeId = Guid.NewGuid(),
                    OrderIndex = 1,
                    IsDeleted = false,
                    MasterDocumentType = new MasterDocumentType { EnvelopeType = 1 }
                }
            ]
        };

        mockProjectRepo.Setup(r => r.GetByIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(project);
        mockProfileRepo.Setup(r => r.GetByIdWithItemsAsync(profileId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(profile);
        mockChecklistRepo.Setup(r => r.GetByProjectIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync([oldItem]);

        var handler = new LoadProfileCommandHandler(mockUnitOfWork.Object);

        // Act
        var result = await handler.Handle(new LoadProfileCommand
        {
            ProcurementProjectId = projectId,
            DocumentProfileId = profileId
        }, CancellationToken.None);

        // Assert
        Assert.True(result.Succeeded);
        mockChecklistRepo.Verify(r => r.RemoveRange(It.Is<IEnumerable<ERPEZ.Domain.Entities.Procurement.ProjectDocumentChecklist>>(
            list => list.Contains(oldItem))), Times.Once);
        mockChecklistRepo.Verify(r => r.AddRangeAsync(
            It.Is<IEnumerable<ERPEZ.Domain.Entities.Procurement.ProjectDocumentChecklist>>(list => list.Count() == 1),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Theory]
    [InlineData("Posted")]
    [InlineData("Bidding Open")]
    [InlineData("Bid Evaluation")]
    public async Task Handle_LockedOrPostedProject_ThrowsConflictException(string lockedStatus)
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var profileId = Guid.NewGuid();

        var project = new ProcurementProject
        {
            Id = projectId,
            Status = lockedStatus
        };

        mockProjectRepo.Setup(r => r.GetByIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(project);

        var handler = new LoadProfileCommandHandler(mockUnitOfWork.Object);

        // Act & Assert
        await Assert.ThrowsAsync<ConflictException>(() =>
            handler.Handle(new LoadProfileCommand
            {
                ProcurementProjectId = projectId,
                DocumentProfileId = profileId
            }, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_DifferentProcurementCategory_AllowedAndSucceeds()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var profileId = Guid.NewGuid();
        var modeId = Guid.NewGuid();
        var catId = Guid.NewGuid();

        var project = new ProcurementProject
        {
            Id = projectId,
            Status = "Draft",
            ProcurementModeId = modeId
        };

        var mode = new ProcurementMode
        {
            Id = modeId,
            ProcurementCategoryId = catId
        };

        var category = new ProcurementCategory
        {
            Id = catId,
            Name = "Goods"
        };

        var profile = new DocumentProfile
        {
            Id = profileId,
            Name = "INFRASTRUCTURE BLUEPRINT",
            ProcurementCategory = "Infrastructure", // Different category
            DocumentProfileItems = []
        };

        mockProjectRepo.Setup(r => r.GetByIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(project);
        mockProfileRepo.Setup(r => r.GetByIdWithItemsAsync(profileId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(profile);
        mockProcModeRepo.Setup(r => r.GetByIdAsync(modeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mode);
        mockProcCatRepo.Setup(r => r.GetByIdAsync(catId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(category);
        mockChecklistRepo.Setup(r => r.GetByProjectIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        var handler = new LoadProfileCommandHandler(mockUnitOfWork.Object);

        // Act
        var result = await handler.Handle(new LoadProfileCommand
        {
            ProcurementProjectId = projectId,
            DocumentProfileId = profileId
        }, CancellationToken.None);

        // Assert
        Assert.True(result.Succeeded);
    }

    [Fact]
    public async Task Handle_CompatibleProcurementCategory_Succeeds()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var profileId = Guid.NewGuid();
        var modeId = Guid.NewGuid();
        var catId = Guid.NewGuid();

        var project = new ProcurementProject
        {
            Id = projectId,
            Status = "Draft",
            ProcurementModeId = modeId
        };

        var mode = new ProcurementMode
        {
            Id = modeId,
            ProcurementCategoryId = catId
        };

        var category = new ProcurementCategory
        {
            Id = catId,
            Name = "Goods"
        };

        var profile = new DocumentProfile
        {
            Id = profileId,
            Name = "GOODS BLUEPRINT",
            ProcurementCategory = "Goods", // Matches project category
            DocumentProfileItems = []
        };

        mockProjectRepo.Setup(r => r.GetByIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(project);
        mockProfileRepo.Setup(r => r.GetByIdWithItemsAsync(profileId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(profile);
        mockProcModeRepo.Setup(r => r.GetByIdAsync(modeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mode);
        mockProcCatRepo.Setup(r => r.GetByIdAsync(catId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(category);
        mockChecklistRepo.Setup(r => r.GetByProjectIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        var handler = new LoadProfileCommandHandler(mockUnitOfWork.Object);

        // Act
        var result = await handler.Handle(new LoadProfileCommand
        {
            ProcurementProjectId = projectId,
            DocumentProfileId = profileId
        }, CancellationToken.None);

        // Assert
        Assert.True(result.Succeeded);
    }

    [Fact]
    public async Task Handle_GoodsAndGeneralServices_MatchesGoodsProfile_Succeeds()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var profileId = Guid.NewGuid();
        var modeId = Guid.NewGuid();
        var catId = Guid.NewGuid();

        var project = new ProcurementProject
        {
            Id = projectId,
            Status = "Draft",
            ProcurementModeId = modeId
        };

        var mode = new ProcurementMode
        {
            Id = modeId,
            ProcurementCategoryId = catId
        };

        var category = new ProcurementCategory
        {
            Id = catId,
            Name = "Goods and General Services" // Real database category name
        };

        var profile = new DocumentProfile
        {
            Id = profileId,
            Name = "STANDARD COMPETITIVE BIDDING - GOODS",
            ProcurementCategory = "Goods", // Profile category from UI
            DocumentProfileItems = []
        };

        mockProjectRepo.Setup(r => r.GetByIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(project);
        mockProfileRepo.Setup(r => r.GetByIdWithItemsAsync(profileId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(profile);
        mockProcModeRepo.Setup(r => r.GetByIdAsync(modeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mode);
        mockProcCatRepo.Setup(r => r.GetByIdAsync(catId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(category);
        mockChecklistRepo.Setup(r => r.GetByProjectIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        var handler = new LoadProfileCommandHandler(mockUnitOfWork.Object);

        // Act
        var result = await handler.Handle(new LoadProfileCommand
        {
            ProcurementProjectId = projectId,
            DocumentProfileId = profileId
        }, CancellationToken.None);

        // Assert
        Assert.True(result.Succeeded);
    }

    [Fact]
    public async Task Handle_SoftDeletedProfileItems_AreNotCopiedToProjectChecklist()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var profileId = Guid.NewGuid();
        var activeDocId = Guid.NewGuid();
        var deletedDocId = Guid.NewGuid();

        var project = new ProcurementProject
        {
            Id = projectId,
            Status = "Draft"
        };

        var profile = new DocumentProfile
        {
            Id = profileId,
            Name = "Blueprint",
            DocumentProfileItems =
            [
                new DocumentProfileItem
                {
                    Id = Guid.NewGuid(),
                    MasterDocumentTypeId = activeDocId,
                    OrderIndex = 1,
                    IsDeleted = false,
                    MasterDocumentType = new MasterDocumentType { EnvelopeType = 1 }
                },
                new DocumentProfileItem
                {
                    Id = Guid.NewGuid(),
                    MasterDocumentTypeId = deletedDocId,
                    OrderIndex = 2,
                    IsDeleted = true, // Soft deleted item in profile
                    MasterDocumentType = new MasterDocumentType { EnvelopeType = 1 }
                }
            ]
        };

        mockProjectRepo.Setup(r => r.GetByIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(project);
        mockProfileRepo.Setup(r => r.GetByIdWithItemsAsync(profileId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(profile);
        mockChecklistRepo.Setup(r => r.GetByProjectIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        List<ERPEZ.Domain.Entities.Procurement.ProjectDocumentChecklist>? addedItems = null;
        mockChecklistRepo.Setup(r => r.AddRangeAsync(It.IsAny<IEnumerable<ERPEZ.Domain.Entities.Procurement.ProjectDocumentChecklist>>(), It.IsAny<CancellationToken>()))
            .Callback<IEnumerable<ERPEZ.Domain.Entities.Procurement.ProjectDocumentChecklist>, CancellationToken>((items, _) => addedItems = items.ToList())
            .Returns(Task.CompletedTask);

        var handler = new LoadProfileCommandHandler(mockUnitOfWork.Object);

        // Act
        var result = await handler.Handle(new LoadProfileCommand
        {
            ProcurementProjectId = projectId,
            DocumentProfileId = profileId
        }, CancellationToken.None);

        // Assert
        Assert.True(result.Succeeded);
        Assert.NotNull(addedItems);
        Assert.Single(addedItems);
        Assert.Equal(activeDocId, addedItems[0].MasterDocumentTypeId);
    }
}
