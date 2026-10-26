using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Common.Helpers;
using ERPEZ.Application.Features.Procurement.PurchaseOrders.DTOs;
using ERPEZ.Application.Features.Procurement.PurchaseOrders.Utils;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Services;
using ERPEZ.Infrastructure.Services.Renderers.Pdf;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Procurement.PurchaseOrders;

public class PurchaseOrderDocumentGenerationTests
{
    public PurchaseOrderDocumentGenerationTests()
    {
        QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;
    }

    [Fact]
    public async Task PurchaseOrderPdfRenderer_ShouldRenderValidAppendix61Pdf()
    {
        // Arrange
        var renderer = new PurchaseOrderPdfRenderer();

        var dto = new PurchaseOrderDataDto
        {
            Id = Guid.NewGuid(),
            PONumber = "PO-2023-11-0240",
            Date = new DateTime(2023, 11, 27),
            ProcurementMode = "Negotiated Procurement - Small Value Procurement (Sec. 53.9)",
            TypeOfPO = "SVP",
            SourceDocumentType = "AOB",
            SourceDocumentNumber = "AOB-2023-0891",
            ProcuringEntityName = "Agency Name",
            ProcuringEntityOffice = "Procurement Services Unit",

            SupplierId = Guid.NewGuid(),
            SupplierName = "Acme Technologies Inc.",
            SupplierAddress = "123 Tech Blvd, Cagayan de Oro City",
            SupplierTIN = "123-456-789-000",

            PlaceOfDelivery = "USTP CDO Campus, Supply Office",
            DateOfDelivery = new DateTime(2023, 12, 15),
            DeliveryTerm = "Within 30 Calendar Days",
            PaymentTerm = "LDDAP-ADA",

            TotalAmount = 49000m,
            AmountInWords = PhilippineCurrencyWordsHelper.ToPhilippinePesoWords(49000m),

            ApprovedByName = "DR. JANE DOE",
            ApprovedByPosition = "Head of the Procuring Entity",
            ApprovedAt = DateTime.UtcNow,

            Items =
            [
                new PurchaseOrderItemDataDto
                {
                    ItemNumber = 1,
                    StockNo = "1",
                    Unit = "box",
                    Description = "Table and 4 Chairs",
                    Quantity = 1m,
                    UnitPrice = 49000m,
                    Amount = 49000m
                }
            ]
        };

        // Act
        var pdfBytes = await renderer.RenderAsync(dto, CancellationToken.None);

        // Assert
        pdfBytes.Should().NotBeNullOrEmpty();
        pdfBytes.Length.Should().BeGreaterThan(1000);

        // Check PDF magic header '%PDF'
        var header = Encoding.ASCII.GetString(pdfBytes, 0, 4);
        header.Should().Be("%PDF");

    }

    [Fact]
    public async Task PurchaseOrderPdfRenderer_ShouldRenderWithLogoAndLetterhead()
    {
        // Arrange
        var renderer = new PurchaseOrderPdfRenderer();
        var testLogo = Convert.FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");
        var dto = new PurchaseOrderDataDto
        {
            Id = Guid.NewGuid(),
            PONumber = "PO-2026-TEST-LOGO",
            Date = new DateTime(2026, 10, 19),
            LogoBytes = testLogo,
            ProcuringEntityName = "Central Mindanao University",
            ProcuringEntityAddress = "University Town, Musuan, Maramag, Bukidnon, Philippines",
            ProcuringEntityOffice = "Innovation and Technology Solutions Division",
            SupplierName = "Acme Supplies",
            TotalAmount = 1000m,
            AmountInWords = "ONE THOUSAND PESOS ONLY",
            Items =
            [
                new PurchaseOrderItemDataDto
                {
                    ItemNumber = 1,
                    Description = "Test item",
                    Quantity = 1m,
                    UnitPrice = 1000m,
                    Amount = 1000m
                }
            ]
        };

        // Act
        var bytes = await renderer.RenderAsync(dto, CancellationToken.None);

        // Assert
        bytes.Should().NotBeNullOrEmpty();
        var header = Encoding.ASCII.GetString(bytes, 0, 4);
        header.Should().Be("%PDF");
    }

    [Theory]
    [InlineData("SuperAdmin Workspace")]
    [InlineData("USTP")]
    [InlineData("")]
    [InlineData(null)]
    public async Task PurchaseOrderPdfRenderer_ShouldHandleFallbackEntitySafely(string? entityName)
    {
        // Arrange
        var renderer = new PurchaseOrderPdfRenderer();

        var dto = new PurchaseOrderDataDto
        {
            Id = Guid.NewGuid(),
            PONumber = "PO-2023-11-0240",
            Date = new DateTime(2023, 11, 27),
            ProcurementMode = "Negotiated Procurement - Small Value Procurement (Sec. 53.9)",
            TypeOfPO = "SVP",
            SourceDocumentType = "AOB",
            SourceDocumentNumber = "AOB-2023-0891",
            ProcuringEntityName = entityName!,
            ProcuringEntityOffice = "SuperAdmin Workspace Unit",

            SupplierId = Guid.NewGuid(),
            SupplierName = "Acme Technologies Inc.",
            SupplierAddress = "123 Tech Blvd",
            SupplierTIN = "123-456-789-000",

            PlaceOfDelivery = "Supply Office",
            DateOfDelivery = new DateTime(2023, 12, 15),
            DeliveryTerm = "Within 30 Calendar Days",
            PaymentTerm = "LDDAP-ADA",

            TotalAmount = 1000m,
            AmountInWords = "ONE THOUSAND PESOS ONLY***********",

            ApprovedByName = "DR. JANE DOE",
            ApprovedByPosition = "Head of the Procuring Entity",
            ApprovedAt = DateTime.UtcNow,

            Items =
            [
                new PurchaseOrderItemDataDto
                {
                    ItemNumber = 1,
                    StockNo = "1",
                    Unit = "box",
                    Description = "Office Supplies",
                    Quantity = 1m,
                    UnitPrice = 1000m,
                    Amount = 1000m
                }
            ]
        };

        // Act
        var pdfBytes = await renderer.RenderAsync(dto, CancellationToken.None);

        // Assert
        pdfBytes.Should().NotBeNullOrEmpty();
        pdfBytes.Length.Should().BeGreaterThan(1000);
        var header = Encoding.ASCII.GetString(pdfBytes, 0, 4);
        header.Should().Be("%PDF");
    }

    [Fact]
    public void DocumentType_ShouldIncludePurchaseOrder()
    {
        var docType = DocumentType.PurchaseOrder;
        docType.ToString().Should().Be("PurchaseOrder");
    }

    [Fact]
    public async Task PurchaseOrderPdfRenderer_ShouldRenderWithCustomLogoAndAddress()
    {
        // Arrange: 1x1 valid test PNG
        var testLogo = Convert.FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");
        var renderer = new PurchaseOrderPdfRenderer();

        var dto = new PurchaseOrderDataDto
        {
            Id = Guid.NewGuid(),
            PONumber = "PO-2026-CUSTOM-001",
            Date = new DateTime(2026, 10, 19),
            ProcurementMode = "Negotiated Procurement - Small Value Procurement (Sec. 53.9)",
            TypeOfPO = "SVP",
            SourceDocumentType = "AOB",
            SourceDocumentNumber = "AOB-2026-001",
            ProcuringEntityName = "Department of Science and Technology",
            ProcuringEntityAddress = "Gen. Santos Ave, Bicutan, Taguig City, Metro Manila",
            ProcuringEntityOffice = "Procurement Management Division",
            LogoBytes = testLogo,

            SupplierId = Guid.NewGuid(),
            SupplierName = "Acme Technologies Inc.",
            SupplierAddress = "123 Tech Blvd, Manila",
            SupplierTIN = "123-456-789-000",

            PlaceOfDelivery = "DOST Main Campus",
            DateOfDelivery = new DateTime(2026, 11, 15),
            DeliveryTerm = "Within 15 Calendar Days",
            PaymentTerm = "LDDAP-ADA",

            TotalAmount = 75000m,
            AmountInWords = PhilippineCurrencyWordsHelper.ToPhilippinePesoWords(75000m),

            ApprovedByName = "DR. RENATO SOLIDUM JR.",
            ApprovedByPosition = "Secretary",
            ApprovedAt = DateTime.UtcNow,

            Items =
            [
                new PurchaseOrderItemDataDto
                {
                    ItemNumber = 1,
                    StockNo = "1",
                    Unit = "lot",
                    Description = "High-Performance Workstation",
                    Quantity = 1m,
                    UnitPrice = 75000m,
                    Amount = 75000m
                }
            ]
        };

        // Act
        var pdfBytes = await renderer.RenderAsync(dto, CancellationToken.None);

        // Assert
        pdfBytes.Should().NotBeNullOrEmpty();
        pdfBytes.Length.Should().BeGreaterThan(1000);
        var header = Encoding.ASCII.GetString(pdfBytes, 0, 4);
        header.Should().Be("%PDF");
    }

    [Fact]
    public async Task PurchaseOrderDataResolver_ShouldResolveAgencyLetterhead_WhenAgencyExists()
    {
        // Arrange
        using var context = PurchaseOrderTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = PurchaseOrderTestHelpers.CreateUnitOfWork(context);

        var testLogo = Convert.FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");
        var agency = new Agency
        {
            Name = "Department of Budget and Management",
            Address = "Gen. Solano St, San Miguel, Manila",
            LogoImage = testLogo
        };
        await unitOfWork.AgencyRepository.AddAsync(agency);
        await unitOfWork.SaveChangesAsync();

        var po = new PurchaseOrder
        {
            Id = Guid.NewGuid(),
            PONumber = "PO-2026-TEST-002",
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            SupplierId = Guid.NewGuid(),
            ProcurementMode = POProcurementModeEnum.SVP,
            SourceDocumentType = SourceDocumentTypeEnum.AOB,
            SourceDocumentId = Guid.NewGuid(),
            TotalAmount = 50000m
        };

        // Act
        var resolvedDto = await PurchaseOrderDataResolver.ResolveDataDtoAsync(po, unitOfWork);

        // Assert
        resolvedDto.ProcuringEntityName.Should().Be("Department of Budget and Management");
        resolvedDto.ProcuringEntityAddress.Should().Be("Gen. Solano St, San Miguel, Manila");
        resolvedDto.LogoBytes.Should().NotBeNull();
        resolvedDto.LogoBytes.Should().BeEquivalentTo(testLogo);
    }

    [Fact]
    public async Task AgencyLetterheadService_ShouldManageLetterheadLifecycle()
    {
        // Arrange
        using var context = PurchaseOrderTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = PurchaseOrderTestHelpers.CreateUnitOfWork(context);
        var service = new AgencyLetterheadService(unitOfWork);

        // 1. Initial get (when no agency exists) -> returns fallback defaults
        var initial = await service.GetLetterheadAsync();
        initial.Should().NotBeNull();
        initial.HasLogo.Should().BeFalse();
        initial.LogoBytes.Should().BeNull();

        // 2. Update letterhead name and address with logo
        var testLogo = Convert.FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");
        var updateRequest = new UpdateAgencyLetterheadRequest
        {
            Name = "National Economic and Development Authority",
            Address = "Pasig City, Metro Manila",
            LogoBytes = testLogo,
            UpdateLogo = true
        };

        var updated = await service.UpdateLetterheadAsync(updateRequest);
        updated.Name.Should().Be("National Economic and Development Authority");
        updated.Address.Should().Be("Pasig City, Metro Manila");
        updated.HasLogo.Should().BeTrue();
        updated.LogoBytes.Should().BeEquivalentTo(testLogo);

        // 3. Verify GetLogoAsync returns the logo
        var logo = await service.GetLogoAsync();
        logo.Should().NotBeNull();
        logo.Should().BeEquivalentTo(testLogo);

        // 4. Clear logo
        await service.ClearLogoAsync();
        var afterClear = await service.GetLetterheadAsync();
        afterClear.HasLogo.Should().BeFalse();
        afterClear.LogoBytes.Should().BeNull();
        afterClear.Name.Should().Be("National Economic and Development Authority");
    }
}
