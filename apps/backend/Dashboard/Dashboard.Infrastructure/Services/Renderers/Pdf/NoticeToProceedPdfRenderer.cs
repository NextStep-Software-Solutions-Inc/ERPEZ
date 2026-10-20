using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Services.DocumentGeneration;
using ERPEZ.Infrastructure.Services.Renderers.Pdf.Base;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ERPEZ.Infrastructure.Services.Renderers.Pdf;

/// <summary>
/// QuestPDF document renderer for official Notice to Proceed (NTP) instruments.
/// Compliant with RA 12009 Section 66 and GPPB Resolution No. 03-2025 Standard Forms.
/// </summary>
public sealed class NoticeToProceedPdfRenderer : BasePdfRenderer, IDocumentRenderer<NoticeToProceedDataDto>
{
    public DocumentType DocumentType => DocumentType.NoticeToProceed;
    public ExportFormat Format => ExportFormat.Pdf;

    public Task<byte[]> RenderAsync(
        NoticeToProceedDataDto request,
        CancellationToken cancellationToken = default)
    {
        var logoBytes = request.LogoBytes ?? LoadDefaultLogo();

        var pdf = Document.Create(doc =>
        {
            doc.Page(page =>
            {
                page.Size(PageSizes.A4.Portrait());
                page.Margin(2.54f, Unit.Centimetre);
                page.DefaultTextStyle(t => t.FontSize(10.5f).FontFamily("Arial").LineHeight(1.5f));

                // -- 1. Universal Agency Header ---------------------------------
                page.Header().Column(col =>
                {
                    RenderCenteredAgencyHeader(
                        col,
                        request.ProcuringEntityName,
                        request.ProcuringEntityAddress,
                        logoBytes,
                        officeName: null);
                });

                // -- 2. Body Content ------------------------------------------
                page.Content().PaddingTop(12).Column(col =>
                {
                    // Title
                    col.Item().AlignCenter()
                        .Text("NOTICE TO PROCEED")
                        .Bold().FontSize(14);

                    // NTP Number & Date
                    var formalDate = request.NTPDate?.ToString("MMMM dd, yyyy") ?? DateTime.UtcNow.ToString("MMMM dd, yyyy");
                    col.Item().PaddingTop(8).Row(row =>
                    {
                        row.RelativeItem().Text(formalDate);
                        row.RelativeItem().AlignRight().Text($"NTP No.: {request.NTPNumber}").Bold();
                    });

                    // Addressee Block
                    col.Item().PaddingTop(10).Column(addr =>
                    {
                        var contact = request.ContactPerson?.Trim();
                        var supplier = !string.IsNullOrWhiteSpace(request.SupplierName) ? request.SupplierName.Trim() : "Winning Contractor/Supplier";

                        if (!string.IsNullOrWhiteSpace(contact) && !string.Equals(contact, supplier, StringComparison.OrdinalIgnoreCase))
                        {
                            addr.Item().Text(contact.ToUpperInvariant()).Bold();
                            addr.Item().Text("Authorized Representative");
                        }
                        else
                        {
                            addr.Item().Text("THE AUTHORIZED REPRESENTATIVE").Bold();
                        }

                        addr.Item().Text(supplier.ToUpperInvariant()).Bold();
                        addr.Item().Text(!string.IsNullOrWhiteSpace(request.SupplierAddress) ? request.SupplierAddress : "Philippines");
                    });

                    // Salutation
                    col.Item().PaddingTop(8).Text("Dear Sir / Madam:");

                    // Directive Body Paragraph 1 (Notice of Commencement & Contract Reference)
                    var projectTitle = !string.IsNullOrWhiteSpace(request.ProjectTitle) ? request.ProjectTitle : request.Description;
                    var contractRef = !string.IsNullOrWhiteSpace(request.ContractNumber) ? $"under Contract No. {request.ContractNumber}" : "under the approved contract agreement";
                    var effectivityStr = request.EffectivityDate?.ToString("MMMM dd, yyyy") ?? "the date of receipt of this Notice";

                    col.Item().PaddingTop(6).Text(text =>
                    {
                        text.Justify();
                        text.Span("    The attached Contract Agreement having been approved, notice is hereby given to ");
                        text.Span(request.SupplierName.ToUpperInvariant()).Bold();
                        text.Span(" that work / delivery may commence on the ");
                        text.Span(projectTitle).Bold();
                        text.Span($" {contractRef}, for a Contract Price equivalent to ");
                        text.Span(request.AmountInWords).Bold();
                        text.Span($" (₱{request.ContractPrice:N2}), effective on ");
                        text.Span(effectivityStr).Bold();
                        text.Span(".");
                    });

                    // Directive Body Paragraph 2 (Obligation to Perform)
                    col.Item().PaddingTop(6).Text(text =>
                    {
                        text.Justify();
                        text.Span("    Upon receipt of this Notice, you are responsible for performing the services / delivering the goods under the terms and conditions of the Agreement and in accordance with the Implementation Schedule and Technical Specifications.");
                    });

                    // Directive Body Paragraph 3 (Timeline & Completion)
                    if (request.ImplementationPeriodDays.HasValue && request.ImplementationPeriodDays.Value > 0)
                    {
                        var deadlineStr = request.DeliveryCompletionDeadline?.ToString("MMMM dd, yyyy");
                        col.Item().PaddingTop(6).Text(text =>
                        {
                            text.Justify();
                            text.Span($"    The contract implementation period is ");
                            text.Span($"{request.ImplementationPeriodDays.Value} calendar days").Bold();
                            if (!string.IsNullOrWhiteSpace(deadlineStr))
                            {
                                text.Span($" and must be fully completed on or before ");
                                text.Span(deadlineStr).Bold();
                            }
                            text.Span(". Please acknowledge receipt and acceptance of this notice by signing both copies in the space provided below. Keep one copy and return the other to the Procuring Entity.");
                        });
                    }
                    else
                    {
                        col.Item().PaddingTop(6).Text(text =>
                        {
                            text.Justify();
                            text.Span("    Please acknowledge receipt and acceptance of this notice by signing both copies in the space provided below. Keep one copy and return the other to the Procuring Entity.");
                        });
                    }

                    // Sign-off
                    col.Item().PaddingTop(14).Text("Very truly yours,");

                    col.Item().PaddingTop(24).Column(sig =>
                    {
                        var issuedBy = !string.IsNullOrWhiteSpace(request.IssuedByName) ? request.IssuedByName : "HEAD OF THE PROCURING ENTITY";
                        sig.Item().Text(issuedBy.ToUpperInvariant()).Bold();
                        sig.Item().Text(!string.IsNullOrWhiteSpace(request.IssuedByPosition) ? request.IssuedByPosition : "Head of the Procuring Entity");
                    });

                    // Conforme Section (GPPB Resolution No. 03-2025 Standard Form)
                    col.Item().PaddingTop(18).Column(conf =>
                    {
                        conf.Item().LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten1);
                        conf.Item().PaddingTop(6).Text("Conforme / Acknowledgment of Receipt:").Bold();

                        var hasReceipt = request.ReceivedAt.HasValue && !string.IsNullOrWhiteSpace(request.ReceivedByName);

                        if (hasReceipt)
                        {
                            conf.Item().PaddingTop(4).Text($"Received By:           {request.ReceivedByName}").Bold();
                            conf.Item().PaddingTop(2).Text($"Date Received:         {request.ReceivedAt:MMMM dd, yyyy}").Bold();
                            conf.Item().PaddingTop(2).Text($"Authorized Signature:  [Signed digitally / on file]");
                        }
                        else
                        {
                            conf.Item().PaddingTop(6).Text("I acknowledge receipt of this Notice on: _____________________________________");
                            conf.Item().PaddingTop(4).Text($"Name of Authorized Representative:       _____________________________________");
                            conf.Item().PaddingTop(4).Text("Authorized Signature:                    _____________________________________");
                        }
                    });
                });

                // -- 3. Footer ------------------------------------------------
                page.Footer().Row(footer =>
                {
                    footer.RelativeItem().AlignLeft()
                        .Text("Standard Form: SF-GOOD-67 | Notice to Proceed (RA 12009 NGPA Compliant)")
                        .FontSize(7f).FontColor(Colors.Grey.Medium);

                    footer.RelativeItem().AlignRight().Text(text =>
                    {
                        text.Span("Page ").FontSize(7f).FontColor(Colors.Grey.Medium);
                        text.CurrentPageNumber().FontSize(7f).FontColor(Colors.Grey.Medium);
                        text.Span(" of ").FontSize(7f).FontColor(Colors.Grey.Medium);
                        text.TotalPages().FontSize(7f).FontColor(Colors.Grey.Medium);
                    });
                });
            });
        });

        return Task.FromResult(pdf.GeneratePdf());
    }
}
