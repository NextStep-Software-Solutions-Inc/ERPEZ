using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.DirectContractings.Commands.GenerateDirectContractingDocument;
using ERPEZ.Application.Features.Procurement.DirectContractings.Dtos;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Infrastructure.Persistence;
using ERPEZ.Infrastructure.Services.Renderers.Pdf;
using ERPEZ.Shared.Exceptions;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Sieve.Models;
using Sieve.Services;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Procurement.DirectContractings;

public class DirectContractingTestSieveOptionsAccessor : IOptions<SieveOptions>
{
    public SieveOptions Value => new();
}

public class DirectContractingDocumentGenerationTests
{
    static DirectContractingDocumentGenerationTests()
    {
        QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;
    }

    private static ApplicationDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    private static IUnitOfWork CreateUnitOfWork(ApplicationDbContext context)
    {
        var services = new ServiceCollection();
        services.AddScoped<ISieveProcessor, SieveProcessor>();
        services.AddSingleton<IOptions<SieveOptions>>(new DirectContractingTestSieveOptionsAccessor());
        var serviceProvider = services.BuildServiceProvider();
        return new UnitOfWork(context, serviceProvider);
    }

    [Fact]
    public async Task GenerateDirectContractingDocumentCommandHandler_ShouldPersistDocumentAndReturnId()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var supplier = new Supplier
        {
            Id = Guid.NewGuid(),
            Name = "Sole Proprietary Solutions Inc.",
            Address = "Bonifacio Global City, Taguig",
            TINNumber = "123-456-789-000",
            PhilGEPSNumber = "PHIL-2026-9999"
        };
        await unitOfWork.SupplierRepository.AddAsync(supplier);

        var cpr = new ConsolidatedPR
        {
            Id = Guid.NewGuid(),
            CPRNumber = "CPR-2026-DC-001",
            Description = "Proprietary Software License Renewal",
            TotalAmount = 500000m,
            ConsolidationDate = new DateOnly(2026, 2, 1)
        };
        await unitOfWork.ConsolidatedPRRepository.AddAsync(cpr);

        var project = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "Proprietary Software License Renewal",
            ConsolidatedPRId = cpr.Id,
            ABC = 500000m
        };
        await unitOfWork.ProcurementProjectRepository.AddAsync(project);

        var dc = new DirectContracting
        {
            Id = Guid.NewGuid(),
            DCNumber = "DC-2026-001",
            Name = "Proprietary Software License Renewal",
            BACProjectId = project.Id,
            ExclusiveSupplierId = supplier.Id,
            TotalABC = 500000m,
            Status = DirectContractingStatusEnum.FOR_REVIEW,
            SubmissionDeadline = DateTime.UtcNow.AddDays(7),
            ReviewRemarks = "Single source proprietary provider confirmed by tech evaluation."
        };
        await unitOfWork.DirectContractingRepository.AddAsync(dc);

        var proposal = new DirectContractingProposal
        {
            Id = Guid.NewGuid(),
            DirectContractingId = dc.Id,
            SupplierId = supplier.Id,
            TotalProposalAmount = 480000m,
            ProposalRemarks = "Exclusive distributor quoted with statutory warranty.",
            ExclusivityDocumentUrl = "https://documents.erpez.gov.ph/certs/exclusivity-2026.pdf"
        };
        await unitOfWork.DirectContractingProposalRepository.AddAsync(proposal);

        await unitOfWork.BACMemberRepository.AddAsync(new BACMember
        {
            Id = Guid.NewGuid(),
            FullName = "Atty. Juan Dela Cruz",
            Position = "Director, Administrative Service",
            Role = "Chairperson",
            Order = 1,
            IsActive = true
        });

        var office = new Office
        {
            Id = Guid.NewGuid(),
            Name = "Procurement Management Office",
            IsDeleted = false
        };
        await unitOfWork.OfficeRepository.AddAsync(office);

        await unitOfWork.SaveChangesAsync();

        var expectedPdfBytes = Encoding.UTF8.GetBytes("%PDF-1.7 Test Content");
        var rendererMock = new Mock<IDocumentRendererService>();
        rendererMock.Setup(r => r.RenderAsync(
            It.IsAny<DirectContractingPdfDataDto>(),
            DocumentType.DirectContracting,
            ExportFormat.Pdf,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedPdfBytes);

        var storageMock = new Mock<IDocumentStorageService>();
        storageMock.Setup(s => s.SaveAsync(
            It.IsAny<byte[]>(),
            It.IsAny<string>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync("/documents/dc/DC-2026-001.pdf");

        var configMock = new Mock<IConfiguration>();
        configMock.Setup(c => c["BacDocument:HeadOfAgencyName"]).Returns("Dr. Maria Santos");
        configMock.Setup(c => c["BacDocument:HeadOfAgencyTitle"]).Returns("University President");

        var loggerMock = new Mock<ILogger<GenerateDirectContractingDocumentCommandHandler>>();

        var handler = new GenerateDirectContractingDocumentCommandHandler(
            unitOfWork,
            rendererMock.Object,
            storageMock.Object,
            configMock.Object,
            loggerMock.Object);

        var command = new GenerateDirectContractingDocumentCommand
        {
            DirectContractingId = dc.Id,
            Format = ExportFormat.Pdf,
            GeneratedBy = "bac.officer"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeEmpty();

        var savedDoc = await unitOfWork.GeneratedDocumentRepository.FindAsync(d => d.Id == result.Data);
        savedDoc.Should().NotBeNull();
        savedDoc!.DocumentType.Should().Be(DocumentType.DirectContracting);
        savedDoc.SourceDocumentId.Should().Be(dc.Id);
        savedDoc.OfficeId.Should().Be(office.Id);
        savedDoc.GeneratedBy.Should().Be("bac.officer");

        rendererMock.Verify(r => r.RenderAsync(
            It.Is<DirectContractingPdfDataDto>(dto =>
                dto.DirectContractingId == dc.Id &&
                dto.DocumentControlNumber == "DC-2026-001" &&
                dto.ApprovedBudgetForContract == 500000m &&
                dto.TotalProposalAmount == 480000m &&
                dto.Supplier.Name == "Sole Proprietary Solutions Inc." &&
                dto.HeadOfAgencyName == "Dr. Maria Santos"),
            DocumentType.DirectContracting,
            ExportFormat.Pdf,
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GenerateDirectContractingDocumentCommandHandler_WhenProposalExceedsABC_ShouldThrowInvalidOperationException()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var office = new Office
        {
            Id = Guid.NewGuid(),
            Name = "Procurement Office",
            IsDeleted = false
        };
        await unitOfWork.OfficeRepository.AddAsync(office);

        var supplier = new Supplier { Id = Guid.NewGuid(), Name = "Sole Supplier" };
        await unitOfWork.SupplierRepository.AddAsync(supplier);

        var project = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "Overpriced Project",
            ABC = 100000m
        };
        await unitOfWork.ProcurementProjectRepository.AddAsync(project);

        var dc = new DirectContracting
        {
            Id = Guid.NewGuid(),
            DCNumber = "DC-EXCEED-001",
            Name = "Overpriced Direct Contracting",
            BACProjectId = project.Id,
            TotalABC = 100000m,
            ExclusiveSupplierId = supplier.Id
        };
        await unitOfWork.DirectContractingRepository.AddAsync(dc);

        var proposal = new DirectContractingProposal
        {
            Id = Guid.NewGuid(),
            DirectContractingId = dc.Id,
            SupplierId = supplier.Id,
            TotalProposalAmount = 150000m // Exceeds ABC of 100,000
        };
        await unitOfWork.DirectContractingProposalRepository.AddAsync(proposal);
        await unitOfWork.SaveChangesAsync();

        var rendererMock = new Mock<IDocumentRendererService>();
        var storageMock = new Mock<IDocumentStorageService>();
        var configMock = new Mock<IConfiguration>();
        var loggerMock = new Mock<ILogger<GenerateDirectContractingDocumentCommandHandler>>();

        var handler = new GenerateDirectContractingDocumentCommandHandler(
            unitOfWork,
            rendererMock.Object,
            storageMock.Object,
            configMock.Object,
            loggerMock.Object);

        var command = new GenerateDirectContractingDocumentCommand
        {
            DirectContractingId = dc.Id
        };

        // Act & Assert
        var act = async () => await handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*exceeds the Approved Budget for the Contract*");
    }

    [Fact]
    public async Task GenerateDirectContractingDocumentCommandHandler_WhenNotFound_ShouldThrowNotFoundException()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var rendererMock = new Mock<IDocumentRendererService>();
        var storageMock = new Mock<IDocumentStorageService>();
        var configMock = new Mock<IConfiguration>();
        var loggerMock = new Mock<ILogger<GenerateDirectContractingDocumentCommandHandler>>();

        var handler = new GenerateDirectContractingDocumentCommandHandler(
            unitOfWork,
            rendererMock.Object,
            storageMock.Object,
            configMock.Object,
            loggerMock.Object);

        var command = new GenerateDirectContractingDocumentCommand
        {
            DirectContractingId = Guid.NewGuid()
        };

        // Act & Assert
        var act = async () => await handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task DirectContractingPdfRenderer_ShouldGenerateNonEmptyPdfBytes()
    {
        // Arrange
        var renderer = new DirectContractingPdfRenderer();
        var dataDto = new DirectContractingPdfDataDto
        {
            DirectContractingId = Guid.NewGuid(),
            DocumentControlNumber = "DC-2026-TEST",
            ProcurementProjectReference = "Mission-Critical Proprietary Servers",
            OfficeName = "Information Technology Division",
            Date = DateTime.UtcNow,
            ApprovedBudgetForContract = 1200000m,
            TotalProposalAmount = 1150000m,
            Supplier = new DirectContractingPdfSupplierDto
            {
                Name = "Exclusive Hardware Corp.",
                Address = "Makati City, Metro Manila",
                TINNumber = "999-888-777",
                PhilGEPSNumber = "PHIL-987654"
            },
            Items =
            [
                new DirectContractingPdfItemDto
                {
                    ItemNo = 1,
                    ItemName = "Proprietary Server Unit",
                    Description = "Rackmount Server with proprietary bus architecture",
                    Specifications = "Intel Xeon 32-core, 128GB ECC RAM",
                    Quantity = 2,
                    Unit = "unit",
                    UnitABC = 600000m,
                    TotalABC = 1200000m,
                    UnitBid = 575000m,
                    TotalBid = 1150000m,
                    Brand = "EnterprisePro",
                    Model = "X-9000"
                }
            ],
            Signatories =
            [
                new DirectContractingPdfSignatoryDto { Name = "BAC Member 1", Position = "Regular Member", Role = "Member", Order = 1 },
                new DirectContractingPdfSignatoryDto { Name = "BAC Member 2", Position = "Regular Member", Role = "Member", Order = 2 },
                new DirectContractingPdfSignatoryDto { Name = "BAC Chair", Position = "Chairperson", Role = "Chairperson", Order = 3 }
            ],
            HeadOfAgencyName = "Hon. Secretary Procuring Entity",
            HeadOfAgencyTitle = "Cabinet Secretary / HoPE"
        };

        // Act
        var pdfBytes = await renderer.RenderAsync(dataDto, CancellationToken.None);

        // Assert
        pdfBytes.Should().NotBeNull();
        pdfBytes.Length.Should().BeGreaterThan(100);
        // Standard PDF signature check "%PDF"
        pdfBytes[0].Should().Be(0x25); // %
        pdfBytes[1].Should().Be(0x50); // P
        pdfBytes[2].Should().Be(0x44); // D
        pdfBytes[3].Should().Be(0x46); // F
    }
}
