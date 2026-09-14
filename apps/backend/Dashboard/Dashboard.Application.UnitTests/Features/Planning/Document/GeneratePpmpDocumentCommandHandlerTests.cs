using ERPEZ.Application.Common.Dtos;
using ERPEZ.Application.Features.Planning.Document.Commands.GeneratePPMP;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;

using PPMPExpenditureItemEntity = ERPEZ.Domain.Entities.Planning.PPMPExpenditureItem;
using PPMPItemEntity            = ERPEZ.Domain.Entities.Planning.PPMPItem;

namespace Dashboard.Application.UnitTests.Features.Planning.Document;

public class GeneratePpmpDocumentCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> unitOfWorkMock;
    private readonly Mock<IPPMPRepository> ppmpRepoMock;
    private readonly Mock<IGeneratedDocumentRepository> docRepoMock;
    private readonly Mock<IDocumentRendererService> rendererMock;
    private readonly Mock<IDocumentStorageService> storageMock;
    private readonly GeneratePpmpDocumentCommandHandler handler;

    public GeneratePpmpDocumentCommandHandlerTests()
    {
        unitOfWorkMock = new Mock<IUnitOfWork>();
        ppmpRepoMock = new Mock<IPPMPRepository>();
        docRepoMock = new Mock<IGeneratedDocumentRepository>();
        rendererMock = new Mock<IDocumentRendererService>();
        storageMock = new Mock<IDocumentStorageService>();

        unitOfWorkMock.Setup(u => u.PPMPRepository).Returns(ppmpRepoMock.Object);
        unitOfWorkMock.Setup(u => u.GeneratedDocumentRepository).Returns(docRepoMock.Object);

        rendererMock.Setup(r => r.RenderAsync(
            It.IsAny<PpmpDataDto>(),
            It.IsAny<DocumentType>(),
            It.IsAny<ExportFormat>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync([1, 2, 3]);

        storageMock.Setup(s => s.SaveAsync(
            It.IsAny<byte[]>(),
            It.IsAny<string>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync("/storage/ppmp_test.pdf");

        handler = new GeneratePpmpDocumentCommandHandler(
            unitOfWorkMock.Object,
            rendererMock.Object,
            storageMock.Object);
    }

    [Fact]
    public async Task Handle_WhenPPMPFinal_MapsIsFinalTrueAndSetsSourceDocumentId()
    {
        // Arrange
        var ppmpId = Guid.NewGuid();
        var officeId = Guid.NewGuid();
        var ppmp = new ERPEZ.Domain.Entities.Planning.PPMP
        {
            Id = ppmpId,
            PPMPNumber = "PPMP-2026-FINAL-001",
            OfficeId = officeId,
            Office = new Office { Id = officeId, Name = "IT Department" },
            Status = StatusEnum.Approved,
            IsFinal = true,
            PPMPType = PPMPTypeEnum.Original
        };

        ppmpRepoMock.Setup(r => r.GetPPMPWithDetailsAsync(ppmpId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(ppmp);

        PpmpDataDto? capturedData = null;
        rendererMock.Setup(r => r.RenderAsync(
            It.IsAny<PpmpDataDto>(),
            DocumentType.Ppmp,
            ExportFormat.Pdf,
            It.IsAny<CancellationToken>()))
            .Callback<PpmpDataDto, DocumentType, ExportFormat, CancellationToken>((d, _, _, _) => capturedData = d)
            .ReturnsAsync([1, 2, 3]);

        GeneratedDocument? savedDoc = null;
        docRepoMock.Setup(r => r.AddAsync(It.IsAny<GeneratedDocument>(), It.IsAny<CancellationToken>()))
            .Callback<GeneratedDocument, CancellationToken>((doc, _) => savedDoc = doc)
            .Returns(Task.CompletedTask);

        var command = new GeneratePpmpDocumentCommand
        {
            PpmpId = ppmpId,
            Format = ExportFormat.Pdf,
            GeneratedBy = "Admin"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        capturedData.Should().NotBeNull();
        capturedData!.IsFinal.Should().BeTrue();
        capturedData.IsSupplemental.Should().BeFalse();

        savedDoc.Should().NotBeNull();
        savedDoc!.SourceDocumentId.Should().Be(ppmpId); // Safeguard 6: SourceDocumentId matches PPMP
        savedDoc.DocumentType.Should().Be(DocumentType.Ppmp);
    }

    [Fact]
    public async Task Handle_WhenPPMPSupplemental_MapsIsSupplementalTrueAndSetsSourceDocumentId()
    {
        // Arrange
        var originalId = Guid.NewGuid();
        var originalPpmp = new ERPEZ.Domain.Entities.Planning.PPMP
        {
            Id = originalId,
            PPMPNumber = "PPMP-2026-ORIG-001",
            Status = StatusEnum.Approved,
            IsFinal = true,
            PPMPType = PPMPTypeEnum.Original
        };

        var suppId = Guid.NewGuid();
        var officeId = Guid.NewGuid();
        var suppPpmp = new ERPEZ.Domain.Entities.Planning.PPMP
        {
            Id = suppId,
            PPMPNumber = "PPMP-2026-ORIG-001-SUP-002",
            OfficeId = officeId,
            Office = new Office { Id = officeId, Name = "Accounting" },
            Status = StatusEnum.Draft,
            IsFinal = false,
            PPMPType = PPMPTypeEnum.Supplemental,
            SourcePPMPId = originalId,
            SourcePPMP = originalPpmp,
            SupplementalNumber = 2
        };

        ppmpRepoMock.Setup(r => r.GetPPMPWithDetailsAsync(suppId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(suppPpmp);

        PpmpDataDto? capturedData = null;
        rendererMock.Setup(r => r.RenderAsync(
            It.IsAny<PpmpDataDto>(),
            DocumentType.Ppmp,
            ExportFormat.Pdf,
            It.IsAny<CancellationToken>()))
            .Callback<PpmpDataDto, DocumentType, ExportFormat, CancellationToken>((d, _, _, _) => capturedData = d)
            .ReturnsAsync([1, 2, 3]);

        GeneratedDocument? savedDoc = null;
        docRepoMock.Setup(r => r.AddAsync(It.IsAny<GeneratedDocument>(), It.IsAny<CancellationToken>()))
            .Callback<GeneratedDocument, CancellationToken>((doc, _) => savedDoc = doc)
            .Returns(Task.CompletedTask);

        var command = new GeneratePpmpDocumentCommand
        {
            PpmpId = suppId,
            Format = ExportFormat.Pdf,
            GeneratedBy = "Admin"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        capturedData.Should().NotBeNull();
        capturedData!.IsSupplemental.Should().BeTrue();
        capturedData.SourcePpmpNumber.Should().Be("PPMP-2026-ORIG-001");
        capturedData.SupplementalNumber.Should().Be(2);
        capturedData.IsFinal.Should().BeFalse();

        savedDoc.Should().NotBeNull();
        savedDoc!.SourceDocumentId.Should().Be(suppId);
    }

    [Fact]
    public async Task Handle_WhenIndicativePPMP_MapsIsFinalFalseAndIsSupplementalFalse()
    {
        // Arrange
        var ppmpId = Guid.NewGuid();
        var officeId = Guid.NewGuid();
        var ppmp = new ERPEZ.Domain.Entities.Planning.PPMP
        {
            Id = ppmpId,
            PPMPNumber = "PPMP-2026-IND-001",
            OfficeId = officeId,
            Office = new Office { Id = officeId, Name = "HR" },
            Status = StatusEnum.Draft,
            IsFinal = false,
            PPMPType = PPMPTypeEnum.Original
        };

        ppmpRepoMock.Setup(r => r.GetPPMPWithDetailsAsync(ppmpId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(ppmp);

        PpmpDataDto? capturedData = null;
        rendererMock.Setup(r => r.RenderAsync(
            It.IsAny<PpmpDataDto>(),
            DocumentType.Ppmp,
            ExportFormat.Pdf,
            It.IsAny<CancellationToken>()))
            .Callback<PpmpDataDto, DocumentType, ExportFormat, CancellationToken>((d, _, _, _) => capturedData = d)
            .ReturnsAsync([1, 2, 3]);

        var command = new GeneratePpmpDocumentCommand
        {
            PpmpId = ppmpId,
            Format = ExportFormat.Pdf,
            GeneratedBy = "Admin"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        capturedData!.IsFinal.Should().BeFalse();
        capturedData.IsSupplemental.Should().BeFalse();
    }

    [Fact]
    public async Task Handle_WhenSupplementalPPMP_IdentifiesNewAndModifiedItemsInRemarks()
    {
        // Arrange
        var origId = Guid.NewGuid();
        var origItemId1 = Guid.NewGuid();
        var origItemId2 = Guid.NewGuid();

        var originalPpmp = new ERPEZ.Domain.Entities.Planning.PPMP
        {
            Id = origId,
            PPMPNumber = "PPMP-ORIG-001",
            PPMPType = PPMPTypeEnum.Original,
            PPMPExpenditureItems =
            [
                new PPMPExpenditureItemEntity
                {
                    Id = Guid.NewGuid(),
                    PPMPItems =
                    [
                        new PPMPItemEntity
                        {
                            Id = origItemId1,
                            Name = "Ballpen Black",
                            PlannedQuantity = 10,
                            UnitPrice = 25m,
                            Remarks = "Original remarks"
                        },
                        new PPMPItemEntity
                        {
                            Id = origItemId2,
                            Name = "Paper Clips",
                            PlannedQuantity = 50,
                            UnitPrice = 15m,
                            Remarks = "Standard supply"
                        }
                    ]
                }
            ]
        };

        var suppId = Guid.NewGuid();
        var suppPpmp = new ERPEZ.Domain.Entities.Planning.PPMP
        {
            Id = suppId,
            PPMPNumber = "PPMP-ORIG-001-SUP-001",
            PPMPType = PPMPTypeEnum.Supplemental,
            SourcePPMPId = origId,
            SourcePPMP = originalPpmp,
            PPMPExpenditureItems =
            [
                new PPMPExpenditureItemEntity
                {
                    Id = Guid.NewGuid(),
                    PPMPItems =
                    [
                        // Modified quantity
                        new PPMPItemEntity
                        {
                            Id = Guid.NewGuid(),
                            Name = "Ballpen Black",
                            PlannedQuantity = 30, // changed 10 -> 30
                            UnitPrice = 25m,
                            Remarks = "Original remarks"
                        },
                        // Unchanged item
                        new PPMPItemEntity
                        {
                            Id = Guid.NewGuid(),
                            Name = "Paper Clips",
                            PlannedQuantity = 50,
                            UnitPrice = 15m,
                            Remarks = "Standard supply"
                        },
                        // Brand new item added in Supplemental
                        new PPMPItemEntity
                        {
                            Id = Guid.NewGuid(),
                            Name = "Ergonomic Office Chair",
                            PlannedQuantity = 5,
                            UnitPrice = 4500m,
                            Remarks = "For new staff"
                        }
                    ]
                }
            ]
        };

        ppmpRepoMock.Setup(r => r.GetPPMPWithDetailsAsync(suppId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(suppPpmp);

        PpmpDataDto? capturedData = null;
        rendererMock.Setup(r => r.RenderAsync(
            It.IsAny<PpmpDataDto>(),
            DocumentType.Ppmp,
            ExportFormat.Pdf,
            It.IsAny<CancellationToken>()))
            .Callback<PpmpDataDto, DocumentType, ExportFormat, CancellationToken>((d, _, _, _) => capturedData = d)
            .ReturnsAsync([1, 2, 3]);

        var command = new GeneratePpmpDocumentCommand
        {
            PpmpId = suppId,
            Format = ExportFormat.Pdf,
            GeneratedBy = "Tester"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        capturedData.Should().NotBeNull();
        capturedData!.Rows.Should().HaveCount(3);

        var ballpenRow = capturedData.Rows.First(r => r.GeneralDescription == "Ballpen Black");
        ballpenRow.Remarks.Should().Contain("[MODIFIED]");

        var clipsRow = capturedData.Rows.First(r => r.GeneralDescription == "Paper Clips");
        clipsRow.Remarks.Should().Be("Standard supply");

        var chairRow = capturedData.Rows.First(r => r.GeneralDescription == "Ergonomic Office Chair");
        chairRow.Remarks.Should().Be("For new staff");
        chairRow.Remarks.Should().NotContain("[NEW ITEM]");
    }
}
