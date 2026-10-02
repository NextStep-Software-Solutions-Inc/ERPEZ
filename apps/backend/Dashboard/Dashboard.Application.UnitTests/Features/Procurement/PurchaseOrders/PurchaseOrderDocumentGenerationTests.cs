using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Common.Helpers;
using ERPEZ.Application.Features.Procurement.PurchaseOrders.DTOs;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Services.Renderers.Pdf;
using FluentAssertions;
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
            ProcuringEntityName = entityName,
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
}
