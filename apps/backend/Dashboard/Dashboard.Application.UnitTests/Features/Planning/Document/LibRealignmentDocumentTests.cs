using System.Text;
using ERPEZ.Application.Features.Planning.Document.Commands.GenerateLibRealignmentPdf;
using ERPEZ.Application.Features.Planning.Document.Dtos;
using ERPEZ.Application.Features.Planning.Document.Mappers;
using ERPEZ.Application.Features.Planning.Document.Queries.GetLibRealignmentPdf;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Infrastructure.Services.Renderers.Pdf;
using ERPEZ.Shared.Exceptions;
using FluentAssertions;
using Moq;
using Xunit;
using LibEntity = ERPEZ.Domain.Entities.Planning.LineItemBudget;
using PlanningObject = ERPEZ.Domain.Entities.Planning.Object;

namespace Dashboard.Application.UnitTests.Features.Planning.Document;

public class LibRealignmentDocumentTests
{
    private readonly Mock<IUnitOfWork> unitOfWorkMock;
    private readonly Mock<ILIBAmendmentRequestRepository> amendmentRepoMock;
    private readonly Mock<ILineItemBudgetRepository> libRepoMock;
    private readonly Mock<IGeneratedDocumentRepository> docRepoMock;
    private readonly Mock<IDocumentRendererService> rendererMock;
    private readonly Mock<IDocumentStorageService> storageMock;
    private readonly GenerateLibRealignmentPdfCommandHandler commandHandler;
    private readonly GetLibRealignmentPdfQueryHandler queryHandler;

    public LibRealignmentDocumentTests()
    {
        QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;

        unitOfWorkMock = new Mock<IUnitOfWork>();
        amendmentRepoMock = new Mock<ILIBAmendmentRequestRepository>();
        libRepoMock = new Mock<ILineItemBudgetRepository>();
        docRepoMock = new Mock<IGeneratedDocumentRepository>();
        rendererMock = new Mock<IDocumentRendererService>();
        storageMock = new Mock<IDocumentStorageService>();

        unitOfWorkMock.Setup(u => u.LIBAmendmentRequestRepository).Returns(amendmentRepoMock.Object);
        unitOfWorkMock.Setup(u => u.LineItemBudgetRepository).Returns(libRepoMock.Object);
        unitOfWorkMock.Setup(u => u.GeneratedDocumentRepository).Returns(docRepoMock.Object);

        rendererMock.Setup(r => r.RenderAsync(
            It.IsAny<LibRealignmentPdfDataDto>(),
            DocumentType.LibRealignment,
            ExportFormat.Pdf,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync([0x25, 0x50, 0x44, 0x46, 0x2D]); // "%PDF-"

        storageMock.Setup(s => s.SaveAsync(
            It.IsAny<byte[]>(),
            It.IsAny<string>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync("documents/lib-realignment/2024/09/test.pdf");

        commandHandler = new GenerateLibRealignmentPdfCommandHandler(
            unitOfWorkMock.Object,
            rendererMock.Object,
            storageMock.Object);

        queryHandler = new GetLibRealignmentPdfQueryHandler(
            unitOfWorkMock.Object,
            rendererMock.Object);
    }

    #region Mapping & Calculation Tests

    [Fact]
    public void Mapper_ShouldMapMetadataCorrectly()
    {
        // Arrange
        var (amendment, originalLib, proposedLib) = CreateSampleRealignmentData();

        // Act
        var dto = LibRealignmentMapper.MapToLibRealignmentPdfDataDto(amendment, originalLib, proposedLib);

        // Assert: Unapproved amendment with no explicit org defaults to SUC and dash effectivity
        dto.DocumentCode.Should().Be("FM-SUC-FDP-002");
        dto.RevisionNo.Should().Be("00");
        dto.EffectiveDate.Should().Be("—");
        dto.FiscalYear.Should().Be("2024");
        dto.DeliveryUnit.Should().Be("Innovation and Technology Solutions Division");
        dto.ReasonKey.Should().Be("UnforeseenModification");
        dto.Justification.Should().Be("Booth Rental for the National Innovation Day 2024- NorMinRIPE- May 24, 2024");
    }

    [Fact]
    public void Mapper_ShouldGenerateDynamicDocumentCode_BasedOnClientOrganization()
    {
        // Arrange
        var (amendment, originalLib, proposedLib) = CreateSampleRealignmentData();

        // Act & Assert: USTP
        var dtoUstp = LibRealignmentMapper.MapToLibRealignmentPdfDataDto(
            amendment, originalLib, proposedLib, organizationCode: "USTP");
        dtoUstp.DocumentCode.Should().Be("FM-USTP-FDP-002");

        // Act & Assert: Other SUC (e.g. CLSU, MSU)
        var dtoClsu = LibRealignmentMapper.MapToLibRealignmentPdfDataDto(
            amendment, originalLib, proposedLib, organizationCode: "CLSU");
        dtoClsu.DocumentCode.Should().Be("FM-CLSU-FDP-002");
    }

    [Fact]
    public void Mapper_ShouldSetDynamicEffectiveDate_WhenApprovedInMonthDateYearFormat()
    {
        // Arrange
        var (amendment, originalLib, proposedLib) = CreateSampleRealignmentData();
        var approvalTimestamp = new DateTime(2026, 10, 19, 14, 30, 0, DateTimeKind.Utc);
        amendment.Status = "Approved";
        amendment.UpdatedAt = approvalTimestamp;

        // Act
        var dto = LibRealignmentMapper.MapToLibRealignmentPdfDataDto(amendment, originalLib, proposedLib);

        // Assert: Format is month-date-year (MM-dd-yyyy)
        dto.EffectiveDate.Should().Be("10-19-2026");
    }

    [Fact]
    public void Mapper_Part2Calculations_ShouldMaintainIntegrityAndQuarterlySums()
    {
        // Arrange
        var (amendment, originalLib, proposedLib) = CreateSampleRealignmentData();

        // Act
        var dto = LibRealignmentMapper.MapToLibRealignmentPdfDataDto(amendment, originalLib, proposedLib);

        // Assert
        dto.Part2ApprovedBudget.Activities.Should().NotBeEmpty();

        foreach (var act in dto.Part2ApprovedBudget.Activities)
        {
            foreach (var item in act.Items)
            {
                // Each item's total must equal Q1 + Q2 + Q3 + Q4
                item.Total.Should().Be(item.Q1 + item.Q2 + item.Q3 + item.Q4);
            }

            // Sub-totals must equal sum of item quarters
            act.SubTotalQ1.Should().Be(act.Items.Sum(i => i.Q1));
            act.SubTotalQ2.Should().Be(act.Items.Sum(i => i.Q2));
            act.SubTotalQ3.Should().Be(act.Items.Sum(i => i.Q3));
            act.SubTotalQ4.Should().Be(act.Items.Sum(i => i.Q4));
            act.SubTotal.Should().Be(act.SubTotalQ1 + act.SubTotalQ2 + act.SubTotalQ3 + act.SubTotalQ4);
        }

        // Grand totals must equal sum of all activity sub-totals
        dto.Part2ApprovedBudget.TotalQ1.Should().Be(dto.Part2ApprovedBudget.Activities.Sum(a => a.SubTotalQ1));
        dto.Part2ApprovedBudget.TotalQ2.Should().Be(dto.Part2ApprovedBudget.Activities.Sum(a => a.SubTotalQ2));
        dto.Part2ApprovedBudget.TotalQ3.Should().Be(dto.Part2ApprovedBudget.Activities.Sum(a => a.SubTotalQ3));
        dto.Part2ApprovedBudget.TotalQ4.Should().Be(dto.Part2ApprovedBudget.Activities.Sum(a => a.SubTotalQ4));
        dto.Part2ApprovedBudget.GrandTotal.Should().Be(
            dto.Part2ApprovedBudget.TotalQ1 +
            dto.Part2ApprovedBudget.TotalQ2 +
            dto.Part2ApprovedBudget.TotalQ3 +
            dto.Part2ApprovedBudget.TotalQ4);
    }

    [Fact]
    public void Mapper_Part3ProposedModification_ShouldMatchReallocationAmount()
    {
        // Arrange
        var (amendment, originalLib, proposedLib) = CreateSampleRealignmentData();

        // Act
        var dto = LibRealignmentMapper.MapToLibRealignmentPdfDataDto(amendment, originalLib, proposedLib);

        // Assert
        dto.Part3ProposedModification.Items.Should().NotBeEmpty();
        dto.Part3ProposedModification.ProposedGrandTotal.Should().Be(50000.00m);
        dto.Part3ProposedModification.TotalQ2.Should().Be(50000.00m);
        dto.Part3ProposedModification.ProposedGrandTotal.Should().Be(
            dto.Part3ProposedModification.TotalQ1 +
            dto.Part3ProposedModification.TotalQ2 +
            dto.Part3ProposedModification.TotalQ3 +
            dto.Part3ProposedModification.TotalQ4);
    }

    [Fact]
    public void Mapper_ShouldPopulateFourStandardSignatories()
    {
        // Arrange
        var (amendment, originalLib, proposedLib) = CreateSampleRealignmentData();

        // Act
        var dto = LibRealignmentMapper.MapToLibRealignmentPdfDataDto(amendment, originalLib, proposedLib);

        // Assert
        dto.Signatories.Should().HaveCount(4);
        dto.Signatories[0].Role.Should().Contain("Submitted by");
        dto.Signatories[0].Name.Should().BeEmpty();
        dto.Signatories[0].Designation.Should().NotBeEmpty();
        dto.Signatories[1].Role.Should().Contain("Certified as to availability of budget");
        dto.Signatories[1].Name.Should().BeEmpty();
        dto.Signatories[1].Designation.Should().Be("Director, Financial Management Services");
        dto.Signatories[2].Role.Should().Contain("RECOMMENDING APPROVAL");
        dto.Signatories[2].Name.Should().BeEmpty();
        dto.Signatories[2].Designation.Should().Be("Chancellor");
        dto.Signatories[3].Role.Should().Contain("APPROVED");
        dto.Signatories[3].Name.Should().BeEmpty();
        dto.Signatories[3].Designation.Should().Be("President");
    }

    [Fact]
    public void Mapper_MultipleActivitiesInPart3_ShouldRetainSeparateActivitiesAndAccurateObjectNames()
    {
        // Arrange: Multiple activities with Object names like in user's ERP-EZ UI
        var originalLibId = Guid.NewGuid();
        var proposedLibId = Guid.NewGuid();

        var act1 = new LineItemBudgetActivity
        {
            Id = Guid.NewGuid(),
            LineItemBudgetId = proposedLibId,
            Name = "Conduct of Vulnerability Assessment and Penetration Testing (VAPT)",
            LineItemBudgetDetails =
            [
                new LineItemBudgetDetail
                {
                    Id = Guid.NewGuid(),
                    LineItemBudgetId = proposedLibId,
                    Object = new PlanningObject { Name = "Salaries and Wages" },
                    Budget = 20000m,
                    StartDate = new DateTime(2026, 9, 15) // Q3
                },
                new LineItemBudgetDetail
                {
                    Id = Guid.NewGuid(),
                    LineItemBudgetId = proposedLibId,
                    Object = new PlanningObject { Name = "Supplies and Materials Expenses" },
                    Budget = 20000m,
                    StartDate = new DateTime(2026, 9, 15) // Q3
                },
                new LineItemBudgetDetail
                {
                    Id = Guid.NewGuid(),
                    LineItemBudgetId = proposedLibId,
                    Object = new PlanningObject { Name = "Communication Expenses" },
                    Budget = 310000m,
                    StartDate = new DateTime(2026, 9, 15) // Q3
                }
            ]
        };

        var act2 = new LineItemBudgetActivity
        {
            Id = Guid.NewGuid(),
            LineItemBudgetId = proposedLibId,
            Name = "Procurement and Installation of Core Enterprise Server Upgrades",
            LineItemBudgetDetails =
            [
                new LineItemBudgetDetail
                {
                    Id = Guid.NewGuid(),
                    LineItemBudgetId = proposedLibId,
                    Object = new PlanningObject { Name = "Advertising Expenses" },
                    Description = "Monthly regional radio airtime placements and social media ad boosts...",
                    Budget = 180000m, // Modified from 150,000 in original
                    StartDate = new DateTime(2026, 9, 15) // Q3
                },
                new LineItemBudgetDetail
                {
                    Id = Guid.NewGuid(),
                    LineItemBudgetId = proposedLibId,
                    Object = new PlanningObject { Name = "Property, Plant and Equipment Outlay" },
                    Budget = 1100000m,
                    StartDate = new DateTime(2026, 9, 15) // Q3
                }
            ]
        };

        var origLib = new LibEntity
        {
            Id = originalLibId,
            LineItemBudgetActivities =
            [
                new LineItemBudgetActivity
                {
                    Id = Guid.NewGuid(),
                    Name = "Procurement and Installation of Core Enterprise Server Upgrades",
                    LineItemBudgetDetails =
                    [
                        new LineItemBudgetDetail
                        {
                            Object = new PlanningObject { Name = "Advertising Expenses" },
                            Description = "Monthly regional radio airtime...",
                            Budget = 150000m,
                            StartDate = new DateTime(2026, 9, 15)
                        }
                    ]
                }
            ]
        };

        var propLib = new LibEntity
        {
            Id = proposedLibId,
            LineItemBudgetActivities = [act1, act2]
        };

        var amendment = new LIBAmendmentRequest
        {
            Id = Guid.NewGuid(),
            LineItemBudgetId = originalLibId,
            ProposedLineItemBudgetId = proposedLibId,
            Reason = "UnforeseenModification",
            Justification = "Server upgrade and security audit"
        };

        // Act
        var dto = LibRealignmentMapper.MapToLibRealignmentPdfDataDto(amendment, origLib, propLib);

        // Assert: Part 3 must contain BOTH activities separately
        dto.Part3ProposedModification.Activities.Should().HaveCount(2);

        var firstAct = dto.Part3ProposedModification.Activities[0];
        firstAct.ActivityName.Should().Be("Conduct of Vulnerability Assessment and Penetration Testing (VAPT)");
        firstAct.Items.Should().HaveCount(3);
        firstAct.Items.Select(i => i.ItemOfExpenditure).Should().Contain(["Salaries and Wages", "Supplies and Materials Expenses", "Communication Expenses"]);
        firstAct.SubTotal.Should().Be(350000m);

        var secondAct = dto.Part3ProposedModification.Activities[1];
        secondAct.ActivityName.Should().Be("Procurement and Installation of Core Enterprise Server Upgrades");
        secondAct.Items.Should().HaveCount(2);
        // Crucial: Must use UACS Object name "Advertising Expenses", not narrative string
        secondAct.Items.Select(i => i.ItemOfExpenditure).Should().Contain(["Advertising Expenses", "Property, Plant and Equipment Outlay"]);
        secondAct.SubTotal.Should().Be(1280000m);

        dto.Part3ProposedModification.ProposedGrandTotal.Should().Be(1630000m);
    }

    [Fact]
    public void Mapper_ProjectScopedLIB_ShouldMapObjectGroupsCorrectly()
    {
        // Arrange: Project-scoped LIB has orphan details without LineItemBudgetActivity
        var originalLibId = Guid.NewGuid();
        var proposedLibId = Guid.NewGuid();

        var origDetail1 = new LineItemBudgetDetail
        {
            Id = Guid.NewGuid(),
            LineItemBudgetId = originalLibId,
            LineItemBudgetActivityId = null,
            Object = new PlanningObject { Code = "5-02-03-010", Name = "Office Supplies Expenses" },
            Description = "Copy Paper A4 and Ink Cartridges",
            Budget = 20000m,
            StartDate = new DateTime(2026, 4, 1) // Q2
        };

        var propDetail1 = new LineItemBudgetDetail
        {
            Id = Guid.NewGuid(),
            LineItemBudgetId = proposedLibId,
            LineItemBudgetActivityId = null,
            Object = new PlanningObject { Code = "5-02-03-010", Name = "Office Supplies Expenses" },
            Description = "Copy Paper A4 and Ink Cartridges",
            Budget = 25000m, // Modified: 25k vs 20k
            StartDate = new DateTime(2026, 4, 1) // Q2
        };

        var propDetail2 = new LineItemBudgetDetail
        {
            Id = Guid.NewGuid(),
            LineItemBudgetId = proposedLibId,
            LineItemBudgetActivityId = null,
            Object = new PlanningObject { Code = "5-02-05-020", Name = "Telephone Expenses" },
            Description = "Monthly Mobile Plan Subscription",
            Budget = 12000m,
            StartDate = new DateTime(2026, 4, 1) // Q2
        };

        var propLib = new LibEntity
        {
            Id = proposedLibId,
            Scope = "Project",
            LineItemBudgetActivities = [],
            LineItemBudgetDetails = [propDetail1, propDetail2]
        };

        var origLib = new LibEntity
        {
            Id = originalLibId,
            Scope = "Project",
            LineItemBudgetActivities = [],
            LineItemBudgetDetails = [origDetail1]
        };

        var amendment = new LIBAmendmentRequest
        {
            Id = Guid.NewGuid(),
            LineItemBudgetId = originalLibId,
            ProposedLineItemBudgetId = proposedLibId,
            Reason = "Reassessment"
        };

        // Act
        var dto = LibRealignmentMapper.MapToLibRealignmentPdfDataDto(amendment, origLib, propLib);

        // Assert: Groups by Object code and name
        dto.Part3ProposedModification.Activities.Should().HaveCount(2);
        dto.Part3ProposedModification.Activities.Select(a => a.ActivityName).Should().Contain([
            "[5-02-03-010] Office Supplies Expenses",
            "[5-02-05-020] Telephone Expenses"
        ]);
        dto.Part3ProposedModification.ProposedGrandTotal.Should().Be(37000m);
    }

    #endregion

    #region CQRS Command & Query Tests

    [Fact]
    public async Task GenerateCommand_WhenValid_PersistsDocumentAndReturnsId()
    {
        // Arrange
        var (amendment, originalLib, proposedLib) = CreateSampleRealignmentData();

        amendmentRepoMock.Setup(r => r.GetByIdWithDetailsAsync(amendment.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(amendment);
        libRepoMock.Setup(r => r.GetByIdWithDetailsAsync(originalLib.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(originalLib);
        libRepoMock.Setup(r => r.GetByIdWithDetailsAsync(proposedLib.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(proposedLib);

        GeneratedDocument? savedDoc = null;
        docRepoMock.Setup(d => d.AddAsync(It.IsAny<GeneratedDocument>(), It.IsAny<CancellationToken>()))
            .Callback<GeneratedDocument, CancellationToken>((doc, _) => savedDoc = doc)
            .Returns(Task.CompletedTask);

        var command = new GenerateLibRealignmentPdfCommand
        {
            RealignmentId = amendment.Id,
            Format = ExportFormat.Pdf,
            GeneratedBy = "budget.officer@ustp.edu.ph"
        };

        // Act
        var result = await commandHandler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeEmpty();

        savedDoc.Should().NotBeNull();
        savedDoc!.DocumentType.Should().Be(DocumentType.LibRealignment);
        savedDoc.SourceDocumentId.Should().Be(amendment.Id);
        savedDoc.GeneratedBy.Should().Be("budget.officer@ustp.edu.ph");
        savedDoc.StoragePath.Should().Be("documents/lib-realignment/2024/09/test.pdf");
        savedDoc.FileSizeBytes.Should().Be(5); // [0x25, 0x50, 0x44, 0x46, 0x2D]
        savedDoc.FiscalYear.Should().Be("2024");
    }

    [Fact]
    public async Task GenerateCommand_WhenNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var missingId = Guid.NewGuid();
        amendmentRepoMock.Setup(r => r.GetByIdWithDetailsAsync(missingId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((LIBAmendmentRequest?)null);
        amendmentRepoMock.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<LIBAmendmentRequest, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((LIBAmendmentRequest?)null);

        var command = new GenerateLibRealignmentPdfCommand
        {
            RealignmentId = missingId,
            Format = ExportFormat.Pdf,
            GeneratedBy = "user"
        };

        // Act
        var act = () => commandHandler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"*{missingId}*");
    }

    [Fact]
    public async Task GetQuery_WhenValid_ReturnsPdfStreamTuple()
    {
        // Arrange
        var (amendment, originalLib, proposedLib) = CreateSampleRealignmentData();

        amendmentRepoMock.Setup(r => r.GetByIdWithDetailsAsync(amendment.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(amendment);
        libRepoMock.Setup(r => r.GetByIdWithDetailsAsync(originalLib.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(originalLib);
        libRepoMock.Setup(r => r.GetByIdWithDetailsAsync(proposedLib.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(proposedLib);

        var query = new GetLibRealignmentPdfQuery(amendment.Id);

        // Act
        var (bytes, contentType, fileName) = await queryHandler.Handle(query, CancellationToken.None);

        // Assert
        bytes.Should().NotBeEmpty();
        contentType.Should().Be("application/pdf");
        fileName.Should().Contain("LibRealignment_2024_");
    }

    [Fact]
    public async Task GetQuery_WhenNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var missingId = Guid.NewGuid();
        amendmentRepoMock.Setup(r => r.GetByIdWithDetailsAsync(missingId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((LIBAmendmentRequest?)null);
        amendmentRepoMock.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<LIBAmendmentRequest, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((LIBAmendmentRequest?)null);

        var query = new GetLibRealignmentPdfQuery(missingId);

        // Act
        var act = () => queryHandler.Handle(query, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }

    #endregion

    #region Renderer Edge Cases

    [Fact]
    public async Task Renderer_StandardData_ProducesValidPdfBytes()
    {
        // Arrange
        var (amendment, originalLib, proposedLib) = CreateSampleRealignmentData();
        var dto = LibRealignmentMapper.MapToLibRealignmentPdfDataDto(amendment, originalLib, proposedLib);
        var renderer = new LibRealignmentPdfRenderer();

        // Act
        var bytes = await renderer.RenderAsync(dto);

        // Assert
        bytes.Should().NotBeNull();
        bytes.Length.Should().BeGreaterThan(100);
        Encoding.ASCII.GetString(bytes[..5]).Should().Be("%PDF-");
    }

    [Fact]
    public async Task Renderer_SingleLineItem_RendersSuccessfully()
    {
        // Arrange
        var dto = new LibRealignmentPdfDataDto
        {
            DocumentCode = "FM-USTP-FDP-002",
            RevisionNo = "00",
            EffectiveDate = "04.01.22",
            FiscalYear = "2024",
            DeliveryUnit = "Single Unit Office",
            ReasonKey = "Reassessment",
            Justification = "Single line reallocation test",
            Part2ApprovedBudget = new LibRealignmentPart2Dto
            {
                Goal = "Goal 1",
                PrexcCodeAndTitle = "PREXC 1",
                Activities =
                [
                    new LibRealignmentActivityDto
                    {
                        ActivityName = "Activity 1",
                        Items =
                        [
                            new LibRealignmentItemRowDto
                            {
                                ItemOfExpenditure = "Office Supplies",
                                Q1 = 1000m,
                                Q2 = 0m,
                                Q3 = 0m,
                                Q4 = 0m,
                                Total = 1000m
                            }
                        ],
                        SubTotalQ1 = 1000m,
                        SubTotal = 1000m
                    }
                ],
                TotalQ1 = 1000m,
                GrandTotal = 1000m
            },
            Part3ProposedModification = new LibRealignmentPart3Dto
            {
                Goal = "Goal 1",
                PrexcCodeAndTitle = "PREXC 1",
                TargetActivityName = "Target Activity 1",
                Items =
                [
                    new LibRealignmentItemRowDto
                    {
                        ItemOfExpenditure = "Training Expenses",
                        Q1 = 0m,
                        Q2 = 1000m,
                        Q3 = 0m,
                        Q4 = 0m,
                        Total = 1000m
                    }
                ],
                TotalQ2 = 1000m,
                ProposedGrandTotal = 1000m
            },
            Signatories = LibRealignmentMapper.BuildDefaultSignatories()
        };

        var renderer = new LibRealignmentPdfRenderer();

        // Act
        var bytes = await renderer.RenderAsync(dto);

        // Assert
        bytes.Should().NotBeNull();
        Encoding.ASCII.GetString(bytes[..5]).Should().Be("%PDF-");
    }

    [Fact]
    public async Task Renderer_MultiPageOverflow_RendersSuccessfullyAcrossPages()
    {
        // Arrange
        var (amendment, originalLib, proposedLib) = CreateSampleRealignmentData();
        var dto = LibRealignmentMapper.MapToLibRealignmentPdfDataDto(amendment, originalLib, proposedLib);

        // Add 25 extra activities to force a multi-page split
        for (int i = 1; i <= 25; i++)
        {
            dto.Part2ApprovedBudget.Activities.Add(new LibRealignmentActivityDto
            {
                ActivityName = $"Overflow Activity {i} - Comprehensive Institutional Strategic Enhancement",
                Items =
                [
                    new LibRealignmentItemRowDto { ItemOfExpenditure = $"Equipment Outlay Item {i}A", Q1 = 10000m, Q2 = 15000m, Q3 = 5000m, Q4 = 20000m, Total = 50000m },
                    new LibRealignmentItemRowDto { ItemOfExpenditure = $"Travel & Accommodation {i}B", Q1 = 2000m, Q2 = 3000m, Q3 = 4000m, Q4 = 1000m, Total = 10000m }
                ],
                SubTotalQ1 = 12000m,
                SubTotalQ2 = 18000m,
                SubTotalQ3 = 9000m,
                SubTotalQ4 = 21000m,
                SubTotal = 60000m
            });
        }

        var renderer = new LibRealignmentPdfRenderer();

        // Act
        var bytes = await renderer.RenderAsync(dto);

        // Assert
        bytes.Should().NotBeNull();
        bytes.Length.Should().BeGreaterThan(500);
        Encoding.ASCII.GetString(bytes[..5]).Should().Be("%PDF-");
    }

    [Fact]
    public async Task Renderer_MissingSignatoryTitlesAndNames_DoesNotThrow()
    {
        // Arrange
        var dto = new LibRealignmentPdfDataDto
        {
            FiscalYear = "2024",
            DeliveryUnit = "Test Unit",
            Signatories =
            [
                new LibRealignmentSignatoryDto { Role = "[1] Submitted by:", Name = "", Designation = "" },
                new LibRealignmentSignatoryDto { Role = "[2] Certified as to availability of budget:", Name = "Only Name", Designation = "" },
                new LibRealignmentSignatoryDto { Role = "[3] RECOMMENDING APPROVAL:", Name = "", Designation = "Only Position" },
                new LibRealignmentSignatoryDto { Role = "[4] APPROVED:", Name = "President", Designation = "Final Authority" }
            ]
        };

        var renderer = new LibRealignmentPdfRenderer();

        // Act
        var bytes = await renderer.RenderAsync(dto);

        // Assert
        bytes.Should().NotBeNull();
        Encoding.ASCII.GetString(bytes[..5]).Should().Be("%PDF-");
    }

    [Fact]
    public async Task Renderer_LongTextWrapsInJustifications_RendersCleanly()
    {
        // Arrange
        var longJustification = string.Join(" ", Enumerable.Repeat(
            "This realignment is urgently required due to unexpected operational restructuring and institutional mandate realignments requiring redistribution across all quarters.",
            15));

        var dto = new LibRealignmentPdfDataDto
        {
            FiscalYear = "2024",
            DeliveryUnit = "Innovation and Technology Solutions Division",
            ReasonKey = "AdditionalRequirements",
            Justification = longJustification,
            Signatories = LibRealignmentMapper.BuildDefaultSignatories()
        };

        var renderer = new LibRealignmentPdfRenderer();

        // Act
        var bytes = await renderer.RenderAsync(dto);

        // Assert
        bytes.Should().NotBeNull();
        Encoding.ASCII.GetString(bytes[..5]).Should().Be("%PDF-");
    }

    #endregion

    #region Helper Test Data Builder

    private static (LIBAmendmentRequest Amendment, LibEntity OriginalLib, LibEntity ProposedLib) CreateSampleRealignmentData()
    {
        var officeId = Guid.NewGuid();
        var fiscalYearId = Guid.NewGuid();

        var office = new Office { Id = officeId, Name = "Innovation and Technology Solutions Division" };
        var fiscalYear = new FiscalYear { Id = fiscalYearId, Year = 2024 };

        var originalLibId = Guid.NewGuid();
        var proposedLibId = Guid.NewGuid();

        // Original LIB: 5 activities matching screenshot sample
        var act1 = new LineItemBudgetActivity
        {
            Id = Guid.NewGuid(),
            LineItemBudgetId = originalLibId,
            Name = "Attendance to PHstartup Week"
        };
        act1.LineItemBudgetDetails =
        [
            new LineItemBudgetDetail
            {
                Id = Guid.NewGuid(),
                LineItemBudgetId = originalLibId,
                LineItemBudgetActivityId = act1.Id,
                Description = "Other Maintenance and Operating Expenses",
                Budget = 10000m,
                StartDate = new DateTime(2024, 4, 15) // Q2
            }
        ];

        var act2 = new LineItemBudgetActivity
        {
            Id = Guid.NewGuid(),
            LineItemBudgetId = originalLibId,
            Name = "Conduct of Incubation Program, Faculty Bootcamp, Capacity Building, Ideation/Innovation activities"
        };
        act2.LineItemBudgetDetails =
        [
            new LineItemBudgetDetail
            {
                Id = Guid.NewGuid(),
                LineItemBudgetId = originalLibId,
                LineItemBudgetActivityId = act2.Id,
                Description = "Training and Scholarship Expenses",
                Budget = 10000m,
                StartDate = new DateTime(2024, 7, 10) // Q3
            }
        ];

        var originalLib = new LibEntity
        {
            Id = originalLibId,
            LIBNumber = "LIB-2024-001",
            OfficeId = officeId,
            Office = office,
            FiscalYearId = fiscalYearId,
            FiscalYearEntity = fiscalYear,
            Status = "Approved",
            LineItemBudgetActivities = [act1, act2],
            LineItemBudgetDetails = [.. act1.LineItemBudgetDetails, .. act2.LineItemBudgetDetails]
        };

        // Proposed LIB: Adds Target Activity "National Innovation Day 2024- NorMinRIPE" with 50,000 budget
        var targetAct = new LineItemBudgetActivity
        {
            Id = Guid.NewGuid(),
            LineItemBudgetId = proposedLibId,
            Name = "National Innovation Day 2024- NorMinRIPE"
        };
        targetAct.LineItemBudgetDetails =
        [
            new LineItemBudgetDetail
            {
                Id = Guid.NewGuid(),
                LineItemBudgetId = proposedLibId,
                LineItemBudgetActivityId = targetAct.Id,
                Description = "Rent/Lease Expenses",
                Budget = 50000m,
                StartDate = new DateTime(2024, 5, 24) // Q2
            }
        ];

        var proposedLib = new LibEntity
        {
            Id = proposedLibId,
            LIBNumber = "LIB-2024-001-v2",
            OfficeId = officeId,
            Office = office,
            FiscalYearId = fiscalYearId,
            FiscalYearEntity = fiscalYear,
            Status = "Draft",
            LineItemBudgetActivities = [targetAct],
            LineItemBudgetDetails = [.. targetAct.LineItemBudgetDetails]
        };

        var amendment = new LIBAmendmentRequest
        {
            Id = Guid.NewGuid(),
            LineItemBudgetId = originalLibId,
            ProposedLineItemBudgetId = proposedLibId,
            Reason = "UnforeseenModification",
            Justification = "Booth Rental for the National Innovation Day 2024- NorMinRIPE- May 24, 2024",
            Status = "Submitted",
            LineItemBudget = originalLib,
            ProposedLineItemBudget = proposedLib
        };

        return (amendment, originalLib, proposedLib);
    }

    [Fact]
    public void Mapper_WhenNoItemsModified_Part3ShouldHaveZeroActivities()
    {
        // Arrange: proposedLib is a direct clone of originalLib with no modifications
        var originalLibId = Guid.NewGuid();
        var proposedLibId = Guid.NewGuid();

        var actOriginal = new LineItemBudgetActivity
        {
            Id = Guid.NewGuid(),
            Name = "Academic Enhancement",
            LineItemBudgetDetails =
            [
                new LineItemBudgetDetail
                {
                    Id = Guid.NewGuid(),
                    Object = new PlanningObject { Name = "Office Supplies Expenses" },
                    Description = "Paper supplies",
                    Budget = 50000m,
                    StartDate = new DateTime(2026, 3, 1)
                }
            ]
        };

        var actProposed = new LineItemBudgetActivity
        {
            Id = Guid.NewGuid(),
            Name = "Academic Enhancement",
            LineItemBudgetDetails =
            [
                new LineItemBudgetDetail
                {
                    Id = Guid.NewGuid(),
                    Object = new PlanningObject { Name = "Office Supplies Expenses" },
                    Description = "Paper supplies",
                    Budget = 50000m, // Unchanged
                    StartDate = new DateTime(2026, 3, 1)
                }
            ]
        };

        var origLib = new LibEntity
        {
            Id = originalLibId,
            LineItemBudgetActivities = [actOriginal]
        };

        var propLib = new LibEntity
        {
            Id = proposedLibId,
            LineItemBudgetActivities = [actProposed]
        };

        var amendment = new LIBAmendmentRequest
        {
            Id = Guid.NewGuid(),
            LineItemBudgetId = originalLibId,
            ProposedLineItemBudgetId = proposedLibId
        };

        // Act
        var dto = LibRealignmentMapper.MapToLibRealignmentPdfDataDto(amendment, origLib, propLib);

        // Assert: Part 2 has the original item, Part 3 has NO items because nothing was modified
        dto.Part2ApprovedBudget.Activities.Should().HaveCount(1);
        dto.Part3ProposedModification.Activities.Should().BeEmpty();
        dto.Part3ProposedModification.ProposedGrandTotal.Should().Be(0m);
    }

    [Fact]
    public async Task Renderer_WhenNoItemsModified_GeneratesPdfSuccessfullyWithNoModificationsState()
    {
        // Arrange
        var (amendment, originalLib, proposedLib) = CreateSampleRealignmentData();
        // Clear modifications by matching proposed to original
        proposedLib.LineItemBudgetActivities = originalLib.LineItemBudgetActivities;
        proposedLib.LineItemBudgetDetails = originalLib.LineItemBudgetDetails;

        var dto = LibRealignmentMapper.MapToLibRealignmentPdfDataDto(amendment, originalLib, proposedLib);
        dto.Part3ProposedModification.Activities.Should().BeEmpty();

        var renderer = new LibRealignmentPdfRenderer();

        // Act
        var pdfBytes = await renderer.RenderAsync(dto);

        // Assert
        pdfBytes.Should().NotBeNull();
        pdfBytes.Length.Should().BeGreaterThan(1000);
    }

    [Fact]
    public async Task Renderer_HeaderRendersOrganizationNameOrLetterheadPlaceholder()
    {
        // Arrange
        var (amendment, originalLib, proposedLib) = CreateSampleRealignmentData();
        var dtoWithOrg = LibRealignmentMapper.MapToLibRealignmentPdfDataDto(
            amendment, originalLib, proposedLib, organizationName: "State University System");
        
        var renderer = new LibRealignmentPdfRenderer();

        // Act
        var pdfWithOrg = await renderer.RenderAsync(dtoWithOrg);

        var dtoWithoutOrg = LibRealignmentMapper.MapToLibRealignmentPdfDataDto(
            amendment, originalLib, proposedLib, organizationName: null, agencyName: null);
        var pdfWithoutOrg = await renderer.RenderAsync(dtoWithoutOrg);

        // Assert
        pdfWithOrg.Should().NotBeNull();
        pdfWithoutOrg.Should().NotBeNull();
    }

    [Fact]
    public void Mapper_UnmodifiedItemInModifiedActivity_ShouldNotAppearInPart3()
    {
        // Arrange
        var origLibId = Guid.NewGuid();
        var propLibId = Guid.NewGuid();

        var origAct = new LineItemBudgetActivity
        {
            Id = Guid.NewGuid(),
            Name = "Procurement and Installation of Core Enterprise Server Upgrades",
            LineItemBudgetDetails =
            [
                new LineItemBudgetDetail
                {
                    Id = Guid.NewGuid(),
                    Object = new PlanningObject { Name = "Advertising Expenses" },
                    Description = "Monthly regional radio airtime...",
                    Budget = 150000m,
                    StartDate = new DateTime(2026, 7, 1) // Q3
                }
            ]
        };

        var propAct1 = new LineItemBudgetActivity
        {
            Id = Guid.NewGuid(),
            Name = "Conduct of Vulnerability Assessment and Penetration Testing (VAPT)",
            LineItemBudgetDetails =
            [
                new LineItemBudgetDetail
                {
                    Id = Guid.NewGuid(),
                    Object = new PlanningObject { Name = "Salaries and Wages" },
                    Budget = 20000m,
                    StartDate = new DateTime(2026, 7, 1)
                }
            ]
        };

        var propAct2 = new LineItemBudgetActivity
        {
            Id = Guid.NewGuid(),
            Name = "Procurement and Installation of Core Enterprise Server Upgrades",
            LineItemBudgetDetails =
            [
                new LineItemBudgetDetail
                {
                    Id = Guid.NewGuid(),
                    Object = new PlanningObject { Name = "Advertising Expenses" },
                    Description = "Monthly regional radio airtime...",
                    Budget = 150000m, // EXACT SAME: Unmodified!
                    StartDate = new DateTime(2026, 7, 1)
                },
                new LineItemBudgetDetail
                {
                    Id = Guid.NewGuid(),
                    Object = new PlanningObject { Name = "Property, Plant and Equipment Outlay" },
                    Budget = 1100000m, // Newly added
                    StartDate = new DateTime(2026, 7, 1)
                }
            ]
        };

        var origLib = new LibEntity
        {
            Id = origLibId,
            LineItemBudgetActivities = [origAct],
            LineItemBudgetDetails = [.. origAct.LineItemBudgetDetails]
        };

        var propLib = new LibEntity
        {
            Id = propLibId,
            LineItemBudgetActivities = [propAct1, propAct2],
            LineItemBudgetDetails = [.. propAct1.LineItemBudgetDetails, .. propAct2.LineItemBudgetDetails]
        };

        var amendment = new LIBAmendmentRequest
        {
            Id = Guid.NewGuid(),
            LineItemBudgetId = origLibId,
            ProposedLineItemBudgetId = propLibId
        };

        // Act
        var dto = LibRealignmentMapper.MapToLibRealignmentPdfDataDto(amendment, origLib, propLib);

        // Assert Part 2: Complete approved baseline
        dto.Part2ApprovedBudget.Activities.Should().HaveCount(1);
        dto.Part2ApprovedBudget.Activities[0].ActivityName.Should().Be("Procurement and Installation of Core Enterprise Server Upgrades");
        dto.Part2ApprovedBudget.Activities[0].Items.Should().HaveCount(1);
        dto.Part2ApprovedBudget.Activities[0].Items[0].ItemOfExpenditure.Should().Be("Advertising Expenses");
        dto.Part2ApprovedBudget.GrandTotal.Should().Be(150000m);

        // Assert Part 3: ONLY modified items appear
        dto.Part3ProposedModification.Activities.Should().HaveCount(2);

        var vapt = dto.Part3ProposedModification.Activities.First(a => a.ActivityName.Contains("VAPT"));
        vapt.Items.Should().HaveCount(1);
        vapt.Items[0].ItemOfExpenditure.Should().Be("Salaries and Wages");

        var serverUpgrade = dto.Part3ProposedModification.Activities.First(a => a.ActivityName.Contains("Server Upgrades"));
        // CRUCIAL: Advertising Expenses is NOT in Part 3 because it was unmodified!
        serverUpgrade.Items.Should().HaveCount(1);
        serverUpgrade.Items[0].ItemOfExpenditure.Should().Be("Property, Plant and Equipment Outlay");
        serverUpgrade.SubTotal.Should().Be(1100000m);

        dto.Part3ProposedModification.ProposedGrandTotal.Should().Be(1120000m);
    }

    [Fact]
    public void Mapper_MultiQuarterUnmodifiedDetails_ShouldNotAppearInPart3()
    {
        // Arrange: approved LIB with multiple details for the same object across different quarters
        var origLibId = Guid.NewGuid();
        var propLibId = Guid.NewGuid();

        var origAct = new LineItemBudgetActivity
        {
            Id = Guid.NewGuid(),
            Name = "Configure automated backup pipelines",
            LineItemBudgetDetails =
            [
                new LineItemBudgetDetail
                {
                    Id = Guid.NewGuid(),
                    Object = new PlanningObject { Name = "Supplies and Materials Expenses" },
                    Budget = 10000m,
                    TimelineType = "Quarterly",
                    StartDate = new DateTime(2026, 9, 1), // Q3
                    EndDate = new DateTime(2026, 9, 30)
                },
                new LineItemBudgetDetail
                {
                    Id = Guid.NewGuid(),
                    Object = new PlanningObject { Name = "Supplies and Materials Expenses" },
                    Budget = 10000m,
                    TimelineType = "Quarterly",
                    StartDate = new DateTime(2026, 10, 1), // Q4
                    EndDate = new DateTime(2026, 12, 31)
                }
            ]
        };

        var propAct = new LineItemBudgetActivity
        {
            Id = Guid.NewGuid(),
            Name = "Configure automated backup pipelines",
            LineItemBudgetDetails =
            [
                new LineItemBudgetDetail
                {
                    Id = Guid.NewGuid(),
                    Object = new PlanningObject { Name = "Supplies and Materials Expenses" },
                    Budget = 10000m,
                    TimelineType = "Quarterly",
                    StartDate = new DateTime(2026, 9, 1), // Q3
                    EndDate = new DateTime(2026, 9, 30)
                },
                new LineItemBudgetDetail
                {
                    Id = Guid.NewGuid(),
                    Object = new PlanningObject { Name = "Supplies and Materials Expenses" },
                    Budget = 10000m,
                    TimelineType = "Quarterly",
                    StartDate = new DateTime(2026, 10, 1), // Q4
                    EndDate = new DateTime(2026, 12, 31)
                }
            ]
        };

        var origLib = new LibEntity
        {
            Id = origLibId,
            LineItemBudgetActivities = [origAct],
            LineItemBudgetDetails = [.. origAct.LineItemBudgetDetails]
        };

        var propLib = new LibEntity
        {
            Id = propLibId,
            LineItemBudgetActivities = [propAct],
            LineItemBudgetDetails = [.. propAct.LineItemBudgetDetails]
        };

        var amendment = new LIBAmendmentRequest
        {
            Id = Guid.NewGuid(),
            LineItemBudgetId = origLibId,
            ProposedLineItemBudgetId = propLibId
        };

        // Act
        var dto = LibRealignmentMapper.MapToLibRealignmentPdfDataDto(amendment, origLib, propLib);

        // Assert: Part 2 must show aggregated 20,000 for Supplies and Materials Expenses (10k Q3, 10k Q4)
        dto.Part2ApprovedBudget.Activities.Should().HaveCount(1);
        dto.Part2ApprovedBudget.Activities[0].Items.Should().HaveCount(1);
        dto.Part2ApprovedBudget.Activities[0].Items[0].Q3.Should().Be(10000m);
        dto.Part2ApprovedBudget.Activities[0].Items[0].Q4.Should().Be(10000m);
        dto.Part2ApprovedBudget.Activities[0].Items[0].Total.Should().Be(20000m);
        dto.Part2ApprovedBudget.GrandTotal.Should().Be(20000m);

        // Assert: Part 3 must be completely empty since no quarterly or total modification occurred
        dto.Part3ProposedModification.Activities.Should().BeEmpty();
        dto.Part3ProposedModification.Items.Should().BeEmpty();
        dto.Part3ProposedModification.ProposedGrandTotal.Should().Be(0m);
    }

    [Fact]
    public void Mapper_CleanClone_ShouldProduceZeroModificationsInPart3()
    {
        // Arrange
        var origLibId = Guid.NewGuid();
        var propLibId = Guid.NewGuid();

        var act1 = new LineItemBudgetActivity
        {
            Id = Guid.NewGuid(),
            Name = "Feasibility Assessment",
            LineItemBudgetDetails =
            [
                new LineItemBudgetDetail
                {
                    Id = Guid.NewGuid(),
                    Object = new PlanningObject { Name = "Salaries and Wages" },
                    Budget = 40500m,
                    StartDate = new DateTime(2026, 1, 1) // Q1
                }
            ]
        };

        var origLib = new LibEntity
        {
            Id = origLibId,
            LineItemBudgetActivities = [act1],
            LineItemBudgetDetails = [.. act1.LineItemBudgetDetails]
        };

        // Exact clone with new IDs
        var cloneAct = new LineItemBudgetActivity
        {
            Id = Guid.NewGuid(),
            Name = "Feasibility Assessment",
            LineItemBudgetDetails =
            [
                new LineItemBudgetDetail
                {
                    Id = Guid.NewGuid(),
                    Object = new PlanningObject { Name = "Salaries and Wages" },
                    Budget = 40500m,
                    StartDate = new DateTime(2026, 1, 1)
                }
            ]
        };

        var propLib = new LibEntity
        {
            Id = propLibId,
            LineItemBudgetActivities = [cloneAct],
            LineItemBudgetDetails = [.. cloneAct.LineItemBudgetDetails]
        };

        var amendment = new LIBAmendmentRequest
        {
            Id = Guid.NewGuid(),
            LineItemBudgetId = origLibId,
            ProposedLineItemBudgetId = propLibId
        };

        // Act
        var dto = LibRealignmentMapper.MapToLibRealignmentPdfDataDto(amendment, origLib, propLib);

        // Assert
        dto.Part2ApprovedBudget.GrandTotal.Should().Be(40500m);
        dto.Part3ProposedModification.Activities.Should().BeEmpty();
        dto.Part3ProposedModification.ProposedGrandTotal.Should().Be(0m);
    }

    [Fact]
    public async Task Mapper_ExactUserScenario_WhenUnmodified_Part2HasAll5Items_Part3IsEmpty()
    {
        // Arrange
        var origLibId = Guid.NewGuid();
        var propLibId = Guid.NewGuid();

        var vaptActId = Guid.NewGuid();
        var serverActId = Guid.NewGuid();

        var vaptAct = new LineItemBudgetActivity
        {
            Id = vaptActId,
            LineItemBudgetId = origLibId,
            Name = "Conduct of Vulnerability Assessment and Penetration Testing (VAPT)",
            LineItemBudgetDetails =
            [
                new LineItemBudgetDetail
                {
                    Id = Guid.NewGuid(),
                    LineItemBudgetId = origLibId,
                    LineItemBudgetActivityId = vaptActId,
                    Object = new PlanningObject { Name = "Salaries and Wages" },
                    StartDate = new DateTime(2026, 7, 1),
                    Budget = 20000m
                },
                new LineItemBudgetDetail
                {
                    Id = Guid.NewGuid(),
                    LineItemBudgetId = origLibId,
                    LineItemBudgetActivityId = vaptActId,
                    Object = new PlanningObject { Name = "Supplies and Materials Expenses" },
                    StartDate = new DateTime(2026, 7, 1),
                    Budget = 20000m
                },
                new LineItemBudgetDetail
                {
                    Id = Guid.NewGuid(),
                    LineItemBudgetId = origLibId,
                    LineItemBudgetActivityId = vaptActId,
                    Object = new PlanningObject { Name = "Communication Expenses" },
                    StartDate = new DateTime(2026, 7, 1),
                    Budget = 310000m
                }
            ]
        };

        var serverAct = new LineItemBudgetActivity
        {
            Id = serverActId,
            LineItemBudgetId = origLibId,
            Name = "Procurement and Installation of Core Enterprise Server Upgrades",
            LineItemBudgetDetails =
            [
                new LineItemBudgetDetail
                {
                    Id = Guid.NewGuid(),
                    LineItemBudgetId = origLibId,
                    LineItemBudgetActivityId = serverActId,
                    Object = new PlanningObject { Name = "Advertising Expenses" },
                    StartDate = new DateTime(2026, 7, 1),
                    Budget = 150000m
                },
                new LineItemBudgetDetail
                {
                    Id = Guid.NewGuid(),
                    LineItemBudgetId = origLibId,
                    LineItemBudgetActivityId = serverActId,
                    Object = new PlanningObject { Name = "Property, Plant and Equipment Outlay" },
                    StartDate = new DateTime(2026, 7, 1),
                    Budget = 1100000m
                }
            ]
        };

        var origLib = new LibEntity
        {
            Id = origLibId,
            LineItemBudgetActivities = [vaptAct, serverAct],
            LineItemBudgetDetails = [.. vaptAct.LineItemBudgetDetails, .. serverAct.LineItemBudgetDetails]
        };

        // Clone proposed LIB identically (unmodified)
        var propVaptAct = new LineItemBudgetActivity
        {
            Id = Guid.NewGuid(),
            LineItemBudgetId = propLibId,
            Name = vaptAct.Name,
            LineItemBudgetDetails = vaptAct.LineItemBudgetDetails.Select(d => new LineItemBudgetDetail
            {
                Id = Guid.NewGuid(),
                LineItemBudgetId = propLibId,
                Object = d.Object,
                StartDate = d.StartDate,
                Budget = d.Budget
            }).ToList()
        };

        var propServerAct = new LineItemBudgetActivity
        {
            Id = Guid.NewGuid(),
            LineItemBudgetId = propLibId,
            Name = serverAct.Name,
            LineItemBudgetDetails = serverAct.LineItemBudgetDetails.Select(d => new LineItemBudgetDetail
            {
                Id = Guid.NewGuid(),
                LineItemBudgetId = propLibId,
                Object = d.Object,
                StartDate = d.StartDate,
                Budget = d.Budget
            }).ToList()
        };

        var propLib = new LibEntity
        {
            Id = propLibId,
            LineItemBudgetActivities = [propVaptAct, propServerAct],
            LineItemBudgetDetails = [.. propVaptAct.LineItemBudgetDetails, .. propServerAct.LineItemBudgetDetails]
        };

        var amendment = new LIBAmendmentRequest
        {
            Id = Guid.NewGuid(),
            LineItemBudgetId = origLibId,
            ProposedLineItemBudgetId = propLibId
        };

        // Act
        var dto = LibRealignmentMapper.MapToLibRealignmentPdfDataDto(amendment, origLib, propLib);

        // Assert Part 2: Complete approved baseline
        dto.Part2ApprovedBudget.Activities.Should().HaveCount(2);
        dto.Part2ApprovedBudget.Activities.SelectMany(a => a.Items).Should().HaveCount(5);
        dto.Part2ApprovedBudget.TotalQ3.Should().Be(1600000m);
        dto.Part2ApprovedBudget.GrandTotal.Should().Be(1600000m);

        // Assert Part 3: Clean clone with 0 modifications
        dto.Part3ProposedModification.Activities.Should().BeEmpty();
        dto.Part3ProposedModification.Items.Should().BeEmpty();
        dto.Part3ProposedModification.ProposedGrandTotal.Should().Be(0m);

        // Assert QuestPDF rendering succeeds
        var renderer = new LibRealignmentPdfRenderer();
        var pdfBytes = await renderer.RenderAsync(dto);
        pdfBytes.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Mapper_ExactUserScenario_WhenAdvertisingExpensesReducedTo140k_Part3ContainsOnlyAdvertisingExpenses()
    {
        // Arrange
        var origLibId = Guid.NewGuid();
        var propLibId = Guid.NewGuid();

        var vaptActId = Guid.NewGuid();
        var serverActId = Guid.NewGuid();

        var vaptAct = new LineItemBudgetActivity
        {
            Id = vaptActId,
            LineItemBudgetId = origLibId,
            Name = "Conduct of Vulnerability Assessment and Penetration Testing (VAPT)",
            LineItemBudgetDetails =
            [
                new LineItemBudgetDetail
                {
                    Id = Guid.NewGuid(),
                    LineItemBudgetId = origLibId,
                    LineItemBudgetActivityId = vaptActId,
                    Object = new PlanningObject { Name = "Salaries and Wages" },
                    StartDate = new DateTime(2026, 7, 1),
                    Budget = 20000m
                },
                new LineItemBudgetDetail
                {
                    Id = Guid.NewGuid(),
                    LineItemBudgetId = origLibId,
                    LineItemBudgetActivityId = vaptActId,
                    Object = new PlanningObject { Name = "Supplies and Materials Expenses" },
                    StartDate = new DateTime(2026, 7, 1),
                    Budget = 20000m
                },
                new LineItemBudgetDetail
                {
                    Id = Guid.NewGuid(),
                    LineItemBudgetId = origLibId,
                    LineItemBudgetActivityId = vaptActId,
                    Object = new PlanningObject { Name = "Communication Expenses" },
                    StartDate = new DateTime(2026, 7, 1),
                    Budget = 310000m
                }
            ]
        };

        var serverAct = new LineItemBudgetActivity
        {
            Id = serverActId,
            LineItemBudgetId = origLibId,
            Name = "Procurement and Installation of Core Enterprise Server Upgrades",
            LineItemBudgetDetails =
            [
                new LineItemBudgetDetail
                {
                    Id = Guid.NewGuid(),
                    LineItemBudgetId = origLibId,
                    LineItemBudgetActivityId = serverActId,
                    Object = new PlanningObject { Name = "Advertising Expenses" },
                    StartDate = new DateTime(2026, 7, 1),
                    Budget = 150000m
                },
                new LineItemBudgetDetail
                {
                    Id = Guid.NewGuid(),
                    LineItemBudgetId = origLibId,
                    LineItemBudgetActivityId = serverActId,
                    Object = new PlanningObject { Name = "Property, Plant and Equipment Outlay" },
                    StartDate = new DateTime(2026, 7, 1),
                    Budget = 1100000m
                }
            ]
        };

        var origLib = new LibEntity
        {
            Id = origLibId,
            LineItemBudgetActivities = [vaptAct, serverAct],
            LineItemBudgetDetails = [.. vaptAct.LineItemBudgetDetails, .. serverAct.LineItemBudgetDetails]
        };

        // Proposed LIB: Advertising Expenses modified to 140,000, all other 4 items unchanged
        var propVaptAct = new LineItemBudgetActivity
        {
            Id = Guid.NewGuid(),
            LineItemBudgetId = propLibId,
            Name = vaptAct.Name,
            LineItemBudgetDetails = vaptAct.LineItemBudgetDetails.Select(d => new LineItemBudgetDetail
            {
                Id = Guid.NewGuid(),
                LineItemBudgetId = propLibId,
                Object = d.Object,
                StartDate = d.StartDate,
                Budget = d.Budget
            }).ToList()
        };

        var propServerAct = new LineItemBudgetActivity
        {
            Id = Guid.NewGuid(),
            LineItemBudgetId = propLibId,
            Name = serverAct.Name,
            LineItemBudgetDetails =
            [
                new LineItemBudgetDetail
                {
                    Id = Guid.NewGuid(),
                    LineItemBudgetId = propLibId,
                    Object = new PlanningObject { Name = "Advertising Expenses" },
                    StartDate = new DateTime(2026, 7, 1),
                    Budget = 140000m // MODIFIED: 150,000 -> 140,000
                },
                new LineItemBudgetDetail
                {
                    Id = Guid.NewGuid(),
                    LineItemBudgetId = propLibId,
                    Object = new PlanningObject { Name = "Property, Plant and Equipment Outlay" },
                    StartDate = new DateTime(2026, 7, 1),
                    Budget = 1100000m // UNMODIFIED
                }
            ]
        };

        var propLib = new LibEntity
        {
            Id = propLibId,
            LineItemBudgetActivities = [propVaptAct, propServerAct],
            LineItemBudgetDetails = [.. propVaptAct.LineItemBudgetDetails, .. propServerAct.LineItemBudgetDetails]
        };

        var amendment = new LIBAmendmentRequest
        {
            Id = Guid.NewGuid(),
            LineItemBudgetId = origLibId,
            ProposedLineItemBudgetId = propLibId
        };

        // Act
        var dto = LibRealignmentMapper.MapToLibRealignmentPdfDataDto(amendment, origLib, propLib);

        // Assert Part 2: Complete approved baseline (1.6M)
        dto.Part2ApprovedBudget.Activities.Should().HaveCount(2);
        dto.Part2ApprovedBudget.Activities.SelectMany(a => a.Items).Should().HaveCount(5);
        dto.Part2ApprovedBudget.GrandTotal.Should().Be(1600000m);

        // Assert Part 3: ONLY the modified item (Advertising Expenses 140k)
        dto.Part3ProposedModification.Activities.Should().HaveCount(1);
        dto.Part3ProposedModification.Activities[0].ActivityName.Should().Be("Procurement and Installation of Core Enterprise Server Upgrades");
        dto.Part3ProposedModification.Activities[0].Items.Should().HaveCount(1);
        dto.Part3ProposedModification.Activities[0].Items[0].ItemOfExpenditure.Should().Be("Advertising Expenses");
        dto.Part3ProposedModification.Activities[0].Items[0].Q3.Should().Be(140000m);
        dto.Part3ProposedModification.Activities[0].Items[0].Total.Should().Be(140000m);
        dto.Part3ProposedModification.ProposedGrandTotal.Should().Be(140000m);

        // Assert QuestPDF rendering succeeds
        var renderer = new LibRealignmentPdfRenderer();
        var pdfBytes = await renderer.RenderAsync(dto);
        pdfBytes.Should().NotBeNullOrEmpty();
    }

    #endregion
}

