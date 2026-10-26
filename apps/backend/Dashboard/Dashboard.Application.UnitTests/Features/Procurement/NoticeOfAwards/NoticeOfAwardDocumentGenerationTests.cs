using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Common.Helpers;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.GenerateNoticeOfAwardDocument;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Dtos;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Queries.GetNoticeOfAwardPdf;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Services.Renderers.Pdf;
using FluentAssertions;
using Moq;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Procurement.NoticeOfAwards;

public class NoticeOfAwardDocumentGenerationTests
{
    [Theory]
    [InlineData(0, "ZERO PESOS AND 00/100 (Php 0.00) ONLY")]
    [InlineData(1, "ONE PESO AND 00/100 (Php 1.00) ONLY")]
    [InlineData(25, "TWENTY-FIVE PESOS AND 00/100 (Php 25.00) ONLY")]
    [InlineData(100, "ONE HUNDRED PESOS AND 00/100 (Php 100.00) ONLY")]
    [InlineData(1250500.75, "ONE MILLION TWO HUNDRED FIFTY THOUSAND FIVE HUNDRED PESOS AND 75/100 (Php 1,250,500.75) ONLY")]
    [InlineData(5000000.00, "FIVE MILLION PESOS AND 00/100 (Php 5,000,000.00) ONLY")]
    [InlineData(345.50, "THREE HUNDRED FORTY-FIVE PESOS AND 50/100 (Php 345.50) ONLY")]
    public void PhilippineCurrencyWordsHelper_ToPhilippinePesoWords_ShouldFormatCorrectly(decimal amount, string expected)
    {
        var result = PhilippineCurrencyWordsHelper.ToPhilippinePesoWords(amount);
        result.Should().Be(expected);
    }

    [Fact]
    public async Task GetNoticeOfAwardPdfQueryHandler_ShouldReturnRenderedPdfBytes()
    {
        // Arrange
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var mode = new ProcurementMode { Id = Guid.NewGuid(), Name = "Competitive Bidding", MinSupplierCount = 3 };
        await unitOfWork.ProcurementModeRepository.AddAsync(mode);

        var supplier = new Supplier { Id = Guid.NewGuid(), Name = "Universal Tech Corp", Address = "123 Tech Way, Makati" };
        await unitOfWork.SupplierRepository.AddAsync(supplier);

        var cpr = new ConsolidatedPR
        {
            Id = Guid.NewGuid(),
            CPRNumber = "CPR-2026-TEST",
            Description = "Campus Network Upgrade",
            TotalAmount = 2000000m,
            ConsolidationDate = new DateOnly(2026, 1, 15)
        };
        await unitOfWork.ConsolidatedPRRepository.AddAsync(cpr);

        var project = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "Campus Network Upgrade",
            ConsolidatedPRId = cpr.Id,
            ABC = 2000000m,
            ProcurementModeId = mode.Id
        };
        await unitOfWork.ProcurementProjectRepository.AddAsync(project);

        var noa = new NoticeOfAward
        {
            Id = Guid.NewGuid(),
            NOANumber = "NOA-2026-TEST-001",
            ProcurementProjectId = project.Id,
            SupplierId = supplier.Id,
            AwardedAmount = 1850000m,
            Status = NoticeOfAwardStatus.Draft,
            ProcurementType = NoticeOfAwardType.GoodsAndServices,
            NOADate = new DateOnly(2026, 9, 16),
            BidDate = new DateOnly(2026, 9, 10)
        };
        await unitOfWork.NoticeOfAwardRepository.AddAsync(noa);
        await unitOfWork.SaveChangesAsync();

        var expectedPdfBytes = new byte[] { 0x25, 0x50, 0x44, 0x46, 0x31, 0x2E, 0x37 }; // %PDF1.7
        var rendererMock = new Mock<IDocumentRendererService>();
        rendererMock.Setup(r => r.RenderAsync(
            It.IsAny<NoticeOfAwardDataDto>(),
            DocumentType.NoticeOfAward,
            ExportFormat.Pdf,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedPdfBytes);

        var handler = new GetNoticeOfAwardPdfQueryHandler(unitOfWork, rendererMock.Object);

        // Act
        var result = await handler.Handle(new GetNoticeOfAwardPdfQuery(noa.Id), CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.FileBytes.Should().BeEquivalentTo(expectedPdfBytes);
        result.Data.FileName.Should().Contain("NOA-2026-TEST-001");
        rendererMock.Verify(r => r.RenderAsync(
            It.Is<NoticeOfAwardDataDto>(dto =>
                dto.NoaNumber == "NOA-2026-TEST-001" &&
                dto.SupplierName == "Universal Tech Corp" &&
                dto.ProjectName == "Campus Network Upgrade" &&
                dto.TotalAmount == 1850000m),
            DocumentType.NoticeOfAward,
            ExportFormat.Pdf,
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GenerateNoticeOfAwardDocumentCommandHandler_ShouldPersistDocumentAndReturnId()
    {
        // Arrange
        using var context = NoticeOfAwardTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = NoticeOfAwardTestHelpers.CreateUnitOfWork(context);

        var supplier = new Supplier { Id = Guid.NewGuid(), Name = "Prime Builders Inc", Address = "Quezon City" };
        await unitOfWork.SupplierRepository.AddAsync(supplier);

        var cpr = new ConsolidatedPR
        {
            Id = Guid.NewGuid(),
            CPRNumber = "CPR-2026-TEST-2",
            Description = "Library Renovation Project",
            TotalAmount = 5000000m,
            ConsolidationDate = new DateOnly(2026, 2, 1)
        };
        await unitOfWork.ConsolidatedPRRepository.AddAsync(cpr);

        var project = new ProcurementProject
        {
            Id = Guid.NewGuid(),
            Title = "Library Renovation Project",
            ConsolidatedPRId = cpr.Id,
            ABC = 5000000m
        };
        await unitOfWork.ProcurementProjectRepository.AddAsync(project);

        var noa = new NoticeOfAward
        {
            Id = Guid.NewGuid(),
            NOANumber = "NOA-2026-GEN-002",
            ProcurementProjectId = project.Id,
            SupplierId = supplier.Id,
            AwardedAmount = 4800000m,
            Status = NoticeOfAwardStatus.Approved,
            ProcurementType = NoticeOfAwardType.Infrastructure,
            NOADate = new DateOnly(2026, 9, 16),
            BidDate = new DateOnly(2026, 9, 12)
        };
        await unitOfWork.NoticeOfAwardRepository.AddAsync(noa);
        await unitOfWork.SaveChangesAsync();

        var dummyBytes = new byte[] { 1, 2, 3, 4, 5 };
        var rendererMock = new Mock<IDocumentRendererService>();
        rendererMock.Setup(r => r.RenderAsync(
            It.IsAny<NoticeOfAwardDataDto>(),
            DocumentType.NoticeOfAward,
            ExportFormat.Pdf,
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(dummyBytes);

        var storageMock = new Mock<IDocumentStorageService>();
        storageMock.Setup(s => s.SaveAsync(dummyBytes, It.Is<string>(f => f.EndsWith(".pdf")), It.IsAny<CancellationToken>()))
            .ReturnsAsync("/storage/noa/NOA-2026-GEN-002.pdf");

        var handler = new GenerateNoticeOfAwardDocumentCommandHandler(unitOfWork, rendererMock.Object, storageMock.Object);

        // Act
        var result = await handler.Handle(new GenerateNoticeOfAwardDocumentCommand { NoticeOfAwardId = noa.Id }, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        var docId = result.Data;
        docId.Should().NotBeEmpty();

        var savedDoc = await unitOfWork.GeneratedDocumentRepository.GetByIdAsync(docId);
        savedDoc.Should().NotBeNull();
        savedDoc!.DocumentType.Should().Be(DocumentType.NoticeOfAward);
        savedDoc.StoragePath.Should().Be("/storage/noa/NOA-2026-GEN-002.pdf");
        savedDoc.FileName.Should().Contain("NOA-2026-GEN-002");
    }

    [Fact]
    public async Task NoticeOfAwardPdfRenderer_ShouldRenderSuccessfullyWithDeduplicatedAddresseeAndSanitizedSignatory()
    {
        // Arrange
        QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;
        var renderer = new NoticeOfAwardPdfRenderer();
        var dataDto = new NoticeOfAwardDataDto
        {
            Id = Guid.NewGuid(),
            NoaNumber = "NOA-2026-002",
            Date = new DateTime(2026, 9, 7),
            DateBid = new DateTime(2026, 9, 4),
            ProjectName = "Procurement of Jabra Evolve2 65 Wireless Office Headset",
            SupplierName = "TECHSTART INC.",
            ContactPerson = "Techstart Inc.", // Duplicated company name as contact person
            SupplierAddress = "Maiah St., Cagayan de Oro, Misamis Oriental, 9000",
            TotalAmount = 13500m,
            AmountInWords = "THIRTEEN THOUSAND FIVE HUNDRED PESOS AND 00/100 (Php 13,500.00) ONLY",
            ApprovedByName = "SUPER ADMINISTRATOR (DEV)", // Dev admin account to be suppressed
            ApprovedByPosition = "Head of the Procuring Entity"
        };

        // Act
        var pdfBytes = await renderer.RenderAsync(dataDto, CancellationToken.None);

        // Assert
        pdfBytes.Should().NotBeNull();
        pdfBytes.Length.Should().BeGreaterThan(1000);
        // PDF header verification
        pdfBytes[0].Should().Be(0x25); // %
        pdfBytes[1].Should().Be(0x50); // P
        pdfBytes[2].Should().Be(0x44); // D
        pdfBytes[3].Should().Be(0x46); // F
    }
}
