using ERPEZ.Application.Common.Dtos;
using ERPEZ.Application.Features.Planning.Document.Commands.GenerateLIB;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;
using PlanningObject = ERPEZ.Domain.Entities.Planning.Object;

namespace Dashboard.Application.UnitTests.Features.Planning.Document;

public class GenerateLibDocumentCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> unitOfWorkMock;
    private readonly Mock<ILineItemBudgetRepository> libRepoMock;
    private readonly Mock<IWFPRepository> wfpRepoMock;
    private readonly Mock<IGeneratedDocumentRepository> docRepoMock;
    private readonly Mock<IDocumentRendererService> rendererMock;
    private readonly Mock<IDocumentStorageService> storageMock;
    private readonly GenerateLibDocumentCommandHandler handler;

    public GenerateLibDocumentCommandHandlerTests()
    {
        unitOfWorkMock = new Mock<IUnitOfWork>();
        libRepoMock = new Mock<ILineItemBudgetRepository>();
        wfpRepoMock = new Mock<IWFPRepository>();
        docRepoMock = new Mock<IGeneratedDocumentRepository>();
        rendererMock = new Mock<IDocumentRendererService>();
        storageMock = new Mock<IDocumentStorageService>();

        unitOfWorkMock.Setup(u => u.LineItemBudgetRepository).Returns(libRepoMock.Object);
        unitOfWorkMock.Setup(u => u.WFPRepository).Returns(wfpRepoMock.Object);
        unitOfWorkMock.Setup(u => u.GeneratedDocumentRepository).Returns(docRepoMock.Object);

        rendererMock.Setup(r => r.RenderAsync(
            It.IsAny<LibDataDto>(),
            It.IsAny<DocumentType>(),
            It.IsAny<ExportFormat>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync([1, 2, 3]);

        storageMock.Setup(s => s.SaveAsync(
            It.IsAny<byte[]>(),
            It.IsAny<string>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync("/storage/test.pdf");

        handler = new GenerateLibDocumentCommandHandler(
            unitOfWorkMock.Object,
            rendererMock.Object,
            storageMock.Object);
    }

    [Fact]
    public async Task Handle_ProjectScope_CrossYearAllocations_ShouldProduceCorrectQuarterAmounts()
    {
        // Arrange: Sep 2026 to Mar 2027 project
        var libId = Guid.NewGuid();
        var officeId = Guid.NewGuid();
        var objectId = Guid.NewGuid();
        var parentId = Guid.NewGuid();

        var parentObject = new PlanningObject
        {
            Id = parentId,
            Name = "Personnel Services",
            Code = "50100000",
        };

        var childObject = new PlanningObject
        {
            Id = objectId,
            Name = "Salaries and Wages",
            Code = "50101000",
            ParentId = parentId,
            ParentObject = parentObject
        };

        var desc = "Project Technical Assistant (Mechanical Engineer) for 6 months to oversee prototype fabrication";

        var details = new List<LineItemBudgetDetail>
        {
            // Q3 2026 slice: ₱35,000 (Sep 2026)
            new()
            {
                Id = Guid.NewGuid(),
                LineItemBudgetId = libId,
                ObjectId = objectId,
                Object = childObject,
                Description = desc,
                TimelineType = "Quarterly",
                StartDate = new DateTime(2026, 9, 1, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2026, 9, 30, 0, 0, 0, DateTimeKind.Utc),
                Budget = 35000m,
                UnitQuantity = 6,
                UnitCost = 35000m
            },
            // Q4 2026 slice: ₱105,000 (Oct-Dec 2026)
            new()
            {
                Id = Guid.NewGuid(),
                LineItemBudgetId = libId,
                ObjectId = objectId,
                Object = childObject,
                Description = desc,
                TimelineType = "Quarterly",
                StartDate = new DateTime(2026, 10, 1, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2026, 12, 31, 0, 0, 0, DateTimeKind.Utc),
                Budget = 105000m
            },
            // Q1 2027 slice: ₱70,000 (Jan-Mar 2027)
            new()
            {
                Id = Guid.NewGuid(),
                LineItemBudgetId = libId,
                ObjectId = objectId,
                Object = childObject,
                Description = desc,
                TimelineType = "Quarterly",
                StartDate = new DateTime(2027, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2027, 3, 31, 0, 0, 0, DateTimeKind.Utc),
                Budget = 70000m
            }
        };

        var lib = new LineItemBudget
        {
            Id = libId,
            LIBNumber = "LIB-2026-2027-001",
            Scope = "Project",
            SourceType = "WFP",
            OfficeId = officeId,
            Office = new Office { Id = officeId, Name = "Regional Office" },
            LineItemBudgetDetails = details
        };

        libRepoMock.Setup(r => r.GetByIdWithDetailsAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lib);

        LibDataDto? capturedDto = null;
        rendererMock.Setup(r => r.RenderAsync(
            It.IsAny<LibDataDto>(),
            It.IsAny<DocumentType>(),
            It.IsAny<ExportFormat>(),
            It.IsAny<CancellationToken>()))
            .Callback<LibDataDto, DocumentType, ExportFormat, CancellationToken>((dto, _, _, _) => capturedDto = dto)
            .ReturnsAsync([1, 2, 3]);

        var command = new GenerateLibDocumentCommand
        {
            LibId = libId,
            Format = ExportFormat.Pdf,
            GeneratedBy = "Tester"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        capturedDto.Should().NotBeNull();
        capturedDto!.ProjectScope.Should().NotBeNull();

        var projectScope = capturedDto.ProjectScope!;
        projectScope.Columns.Should().HaveCount(3);
        projectScope.Columns[0].Year.Should().Be(2026);
        projectScope.Columns[0].QuarterNumber.Should().Be(3);

        projectScope.Columns[1].Year.Should().Be(2026);
        projectScope.Columns[1].QuarterNumber.Should().Be(4);

        projectScope.Columns[2].Year.Should().Be(2027);
        projectScope.Columns[2].QuarterNumber.Should().Be(1);

        // Find the logical row
        var psGroup = projectScope.AllotmentGroups.FirstOrDefault(g => g.AllotmentClass.Contains("Personnel"));
        psGroup.Should().NotBeNull();
        var row = psGroup!.AccountGroups[0].SubGroups[0].Rows[0];

        row.TotalBudget.Should().Be(210000m);
        row.QuarterAmounts.Should().HaveCount(3);
        row.QuarterAmounts[0].Should().Be(35000m);  // Q3 2026
        row.QuarterAmounts[1].Should().Be(105000m); // Q4 2026
        row.QuarterAmounts[2].Should().Be(70000m);  // Q1 2027
    }

    [Fact]
    public async Task Handle_ProjectScope_SameQuarterDifferentYears_ShouldNeverMerge()
    {
        var libId = Guid.NewGuid();
        var officeId = Guid.NewGuid();
        var objectId = Guid.NewGuid();
        var parentId = Guid.NewGuid();

        var parentObject = new PlanningObject
        {
            Id = parentId,
            Name = "Maintenance and Other Operating Expenses",
            Code = "50200000",
        };

        var childObject = new PlanningObject
        {
            Id = objectId,
            Name = "Traveling Expenses",
            Code = "50201000",
            ParentId = parentId,
            ParentObject = parentObject
        };

        var details = new List<LineItemBudgetDetail>
        {
            // Q1 2026: ₱25,000
            new()
            {
                Id = Guid.NewGuid(),
                LineItemBudgetId = libId,
                ObjectId = objectId,
                Object = childObject,
                Description = "Travel",
                TimelineType = "Quarterly",
                StartDate = new DateTime(2026, 1, 15, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2026, 3, 31, 0, 0, 0, DateTimeKind.Utc),
                Budget = 25000m
            },
            // Q1 2027: ₱35,000
            new()
            {
                Id = Guid.NewGuid(),
                LineItemBudgetId = libId,
                ObjectId = objectId,
                Object = childObject,
                Description = "Travel",
                TimelineType = "Quarterly",
                StartDate = new DateTime(2027, 1, 15, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2027, 3, 31, 0, 0, 0, DateTimeKind.Utc),
                Budget = 35000m
            }
        };

        var lib = new LineItemBudget
        {
            Id = libId,
            LIBNumber = "LIB-2026-2027-002",
            Scope = "Project",
            SourceType = "WFP",
            OfficeId = officeId,
            Office = new Office { Id = officeId, Name = "Regional Office" },
            LineItemBudgetDetails = details
        };

        libRepoMock.Setup(r => r.GetByIdWithDetailsAsync(libId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lib);

        LibDataDto? capturedDto = null;
        rendererMock.Setup(r => r.RenderAsync(
            It.IsAny<LibDataDto>(),
            It.IsAny<DocumentType>(),
            It.IsAny<ExportFormat>(),
            It.IsAny<CancellationToken>()))
            .Callback<LibDataDto, DocumentType, ExportFormat, CancellationToken>((dto, _, _, _) => capturedDto = dto)
            .ReturnsAsync([1, 2, 3]);

        var command = new GenerateLibDocumentCommand
        {
            LibId = libId,
            Format = ExportFormat.Pdf,
            GeneratedBy = "Tester"
        };

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        capturedDto.Should().NotBeNull();
        var projectScope = capturedDto!.ProjectScope!;

        // 2026-Q1 to 2027-Q1 spans 5 quarters
        projectScope.Columns.Should().HaveCount(5);

        var mooeGroup = projectScope.AllotmentGroups.First(g => g.AllotmentClass.Contains("Maintenance"));
        var row = mooeGroup.AccountGroups[0].SubGroups[0].Rows[0];

        row.TotalBudget.Should().Be(60000m);
        row.QuarterAmounts[0].Should().Be(25000m); // 2026 Q1
        row.QuarterAmounts[1].Should().Be(0m);      // 2026 Q2
        row.QuarterAmounts[2].Should().Be(0m);      // 2026 Q3
        row.QuarterAmounts[3].Should().Be(0m);      // 2026 Q4
        row.QuarterAmounts[4].Should().Be(35000m); // 2027 Q1
    }
}
