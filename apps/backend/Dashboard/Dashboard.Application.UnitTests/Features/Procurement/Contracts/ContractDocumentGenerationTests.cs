using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.Contracts.Commands.GenerateContractDocument;
using ERPEZ.Application.Features.Procurement.Contracts.Dtos;
using ERPEZ.Application.Features.Procurement.Contracts.Queries.GetContractPdf;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Services.Renderers.Pdf;
using FluentAssertions;
using Moq;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Procurement.Contracts;

public class ContractDocumentGenerationTests
{
    static ContractDocumentGenerationTests()
    {
        QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;
    }
    [Fact]
    public async Task GenerateContractDocumentCommandHandler_ShouldRenderAndSaveDocument()
    {
        // Arrange
        using var context = ContractTestHelpers.CreateInMemoryDbContext();
        var (noa, supplier, project) = await ContractTestHelpers.SeedApprovedNoaAsync(context);

        var office = new Office { Id = Guid.NewGuid(), Name = "Procurement Management Office" };
        context.Offices?.Add(office);

        var contract = new Contract
        {
            Id = Guid.NewGuid(),
            ContractNumber = "CONTRACT-2026-TEST-001",
            NoticeOfAwardId = noa.Id,
            ContractDate = new DateOnly(2026, 6, 20),
            Description = "Test Procurement Contract",
            Status = ContractStatus.Approved,
            ApprovedByName = "DR. AMBROSIO B. CULTURA II",
            ApprovedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "BAC User"
        };
        context.Contracts?.Add(contract);
        await context.SaveChangesAsync();

        var unitOfWork = ContractTestHelpers.CreateUnitOfWork(context);

        var mockPdfBytes = Encoding.UTF8.GetBytes("%PDF-1.7 Test Contract PDF Stream");
        var rendererMock = new Mock<IDocumentRendererService>();
        rendererMock.Setup(r => r.RenderAsync(
            It.IsAny<ContractDataDto>(),
            DocumentType.Contract,
            ExportFormat.Pdf,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(mockPdfBytes);

        var storageMock = new Mock<IDocumentStorageService>();
        storageMock.Setup(s => s.SaveAsync(
            It.IsAny<byte[]>(),
            It.IsAny<string>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync("/storage/contracts/CONTRACT-2026-TEST-001.pdf");

        var handler = new GenerateContractDocumentCommandHandler(
            unitOfWork,
            rendererMock.Object,
            storageMock.Object);

        var command = new GenerateContractDocumentCommand
        {
            ContractId = contract.Id,
            Format = ExportFormat.Pdf,
            GeneratedBy = "HOPE User"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeEmpty();

        var savedDoc = await unitOfWork.GeneratedDocumentRepository.FindAsync(d => d.Id == result.Data);
        savedDoc.Should().NotBeNull();
        savedDoc!.DocumentType.Should().Be(DocumentType.Contract);
        savedDoc.SourceDocumentId.Should().Be(contract.Id);
        savedDoc.FileName.Should().Contain("CONTRACT-2026-TEST-001");
    }

    [Fact]
    public async Task GetContractPdfQueryHandler_ShouldReturnRenderedPdfBytes()
    {
        // Arrange
        using var context = ContractTestHelpers.CreateInMemoryDbContext();
        var (noa, supplier, project) = await ContractTestHelpers.SeedApprovedNoaAsync(context);

        var contract = new Contract
        {
            Id = Guid.NewGuid(),
            ContractNumber = "CONTRACT-2026-TEST-002",
            NoticeOfAwardId = noa.Id,
            ContractDate = new DateOnly(2026, 6, 20),
            Description = "Test Contract For PDF Stream",
            Status = ContractStatus.ForApproval,
            CreatedAt = DateTime.UtcNow
        };
        context.Contracts?.Add(contract);
        await context.SaveChangesAsync();

        var unitOfWork = ContractTestHelpers.CreateUnitOfWork(context);

        var mockPdfBytes = Encoding.UTF8.GetBytes("%PDF-1.7 Test PDF Stream Bytes");
        var rendererMock = new Mock<IDocumentRendererService>();
        rendererMock.Setup(r => r.RenderAsync(
            It.IsAny<ContractDataDto>(),
            DocumentType.Contract,
            ExportFormat.Pdf,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(mockPdfBytes);

        var handler = new GetContractPdfQueryHandler(unitOfWork, rendererMock.Object);

        // Act
        var result = await handler.Handle(new GetContractPdfQuery(contract.Id), CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.FileBytes.Should().BeEquivalentTo(mockPdfBytes);
        result.Data.FileName.Should().Be("CONTRACT-2026-TEST-002_Contract_Agreement.pdf");
        result.Data.ContentType.Should().Be("application/pdf");
    }

    [Fact]
    public async Task ContractPdfRenderer_ShouldGenerateValidPdfBytes()
    {
        // Arrange
        var renderer = new ContractPdfRenderer();
        var dataDto = new ContractDataDto
        {
            Id = Guid.NewGuid(),
            ContractNumber = "CONTRACT-2026-001",
            ContractDate = new DateTime(2026, 9, 21),
            Description = "Supply and Delivery of Office Equipment (MEARB Test Project)",
            Status = "Approved",
            ProcuringEntityName = "University of Science and Technology of Southern Philippines",
            SupplierName = "MEARB Test Supplier B - High Quality",
            SupplierAddress = "0005 Juan C Legaspi St., Iligan City",
            ContactPerson = "MR. EDGARDO A. MONTERO",
            ProjectTitle = "Supply and Delivery of Office Equipment (MEARB Test Project)",
            ModeOfProcurement = "Public Bidding - Goods",
            ContractPrice = 900000m,
            AmountInWords = "NINE HUNDRED THOUSAND PESOS ONLY (Php 900,000.00)",
            ApprovedByName = "DR. AMBROSIO B. CULTURA II",
            ApprovedByPosition = "President, USTP-System",
            LineItems =
            [
                new ContractLineItemDataDto
                {
                    ItemNumber = 1,
                    ItemName = "Supply and Delivery of Office Equipment (MEARB Test Project)",
                    Specifications = "Standard Office Grade Ergonomic Desks and Multi-function Printers",
                    Category = "Goods & Services",
                    Quantity = 1,
                    UnitOfMeasure = "lot",
                    UnitPrice = 900000m,
                    TotalAmount = 900000m
                }
            ]
        };

        // Act
        var pdfBytes = await renderer.RenderAsync(dataDto);

        // Assert
        pdfBytes.Should().NotBeNull();
        pdfBytes.Length.Should().BeGreaterThan(1000);

        // Verify PDF Magic Bytes (%PDF-)
        var header = Encoding.ASCII.GetString(pdfBytes, 0, 5);
        header.Should().Be("%PDF-");
    }
}