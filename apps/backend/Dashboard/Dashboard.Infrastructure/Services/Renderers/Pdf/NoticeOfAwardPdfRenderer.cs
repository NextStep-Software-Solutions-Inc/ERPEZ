using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Services.DocumentGeneration;
using ERPEZ.Infrastructure.Services.Renderers.Pdf.Base;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ERPEZ.Infrastructure.Services.Renderers.Pdf;

public sealed class NoticeOfAwardPdfRenderer : BasePdfRenderer, IDocumentRenderer<NoticeOfAwardDataDto>
{
    public DocumentType DocumentType => DocumentType.NoticeOfAward;
    public ExportFormat Format => ExportFormat.Pdf;

    public Task<byte[]> RenderAsync(
        NoticeOfAwardDataDto request,
        CancellationToken cancellationToken = default)
    {
        var logoBytes = LoadDefaultLogo();

        var pdf = Document.Create(doc =>
        {
            doc.Page(page =>
            {
                page.Size(PageSizes.A4.Portrait());
                page.Margin(2.54f, Unit.Centimetre);
                page.DefaultTextStyle(t => t.FontSize(10.5f).FontFamily("Arial").LineHeight(1.5f));

                // -- 1. Universal Agency Header with Logo ----------------------
                page.Header().Column(col =>
                {
                    if (logoBytes != null && logoBytes.Length > 0)
                    {
                        col.Item().AlignCenter().Height(42).Image(logoBytes);
                    }

                    col.Item().AlignCenter()
                        .Text("Republic of the Philippines")
                        .FontSize(9).FontColor(Colors.Grey.Darken2);

                    col.Item().PaddingTop(2).AlignCenter()
                        .Text("[Agency Letterhead with Logo]")
                        .Bold().FontSize(11).FontColor(Colors.Grey.Darken4);

                    col.Item().PaddingTop(2).AlignCenter()
                        .Text("OFFICE OF THE HEAD OF THE PROCURING ENTITY")
                        .FontSize(9).FontColor(Colors.Grey.Darken2);

                    col.Item().PaddingTop(4).LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten1);
                });

                // -- 2. Body Content ------------------------------------------
                page.Content().PaddingTop(12).Column(col =>
                {
                    // Title
                    col.Item().AlignCenter()
                        .Text("NOTICE OF AWARD")
                        .Bold().FontSize(13.5f);

                    // Date
                    var formalDate = request.Date?.ToString("MMMM dd, yyyy") ?? DateTime.UtcNow.ToString("MMMM dd, yyyy");
                    col.Item().PaddingTop(10).Text(formalDate);

                    // Addressee Block
                    col.Item().PaddingTop(8).Column(addr =>
                    {
                        var contact = request.ContactPerson?.Trim();
                        var supplier = !string.IsNullOrWhiteSpace(request.SupplierName) ? request.SupplierName.Trim() : "Winning Supplier";

                        var isDuplicateOrGeneric = IsDuplicateOrGenericContact(contact, supplier);

                        if (!isDuplicateOrGeneric && !string.IsNullOrWhiteSpace(contact))
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

                    // Body Paragraph 1 (Award Acceptance)
                    var formalBidDate = request.DateBid?.ToString("MMMM dd, yyyy") ?? "the declared bid date";
                    var projectName = !string.IsNullOrWhiteSpace(request.ProjectName) ? request.ProjectName : request.Description;

                    col.Item().PaddingTop(6).Text(text =>
                    {
                        text.Justify();
                        text.Span("    We are happy to notify you that your bid dated ");
                        text.Span(formalBidDate);
                        text.Span(" for the ");
                        text.Span(projectName);
                        text.Span(" for a Contract Price equivalent to ");
                        text.Span(request.AmountInWords).Bold();
                        text.Span(" is hereby accepted.");
                    });

                    // Body Paragraph 2 (RA 12009 Statutory SLA & Performance Security)
                    col.Item().PaddingTop(6).Text(text =>
                    {
                        text.Justify();
                        text.Span("    You are hereby required within Ten (10) calendar days from the receipt of this Notice of Award to post and submit the performance security in the form and amount stipulated in the Implementing Rules and Regulations of Republic Act No. 12009. Failure to comply with all the foregoing shall constitute a sufficient ground for cancellation of this award and forfeiture of your bid security.");
                    });

                    // Sign-off
                    col.Item().PaddingTop(12).Text("Very truly yours,");

                    col.Item().PaddingTop(24).Column(sig =>
                    {
                        var hasOfficialName = !string.IsNullOrWhiteSpace(request.ApprovedByName) &&
                            !IsTechnicalOrAdminAccount(request.ApprovedByName);

                        if (hasOfficialName)
                        {
                            sig.Item().Text(request.ApprovedByName!.ToUpperInvariant()).Bold();
                        }

                        sig.Item().Text("Head of the Procuring Entity");
                    });

                    // Conforme Section
                    col.Item().PaddingTop(14).Column(conf =>
                    {
                        conf.Item().LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten1);
                        conf.Item().PaddingTop(6).Text("Conforme:").Bold();
                        conf.Item().PaddingTop(6).Text("Authorized Signature: _______________________________________________");
                        conf.Item().PaddingTop(4).Text($"Name of Bidder:        {request.SupplierName}");
                        conf.Item().PaddingTop(4).Text("Date:                  _______________________________________________");
                    });
                });

                // -- 3. Footer ------------------------------------------------
                page.Footer().AlignCenter()
                    .Text("Standard Form: SF-GOOD-65 | Notice of Award (RA 12009 NGPA Compliant)")
                    .FontSize(7.5f)
                    .FontColor(Colors.Grey.Medium);
            });
        });

        return Task.FromResult(pdf.GeneratePdf());
    }

    private static bool IsDuplicateOrGenericContact(string? contact, string supplierName)
    {
        if (string.IsNullOrWhiteSpace(contact))
        {
            return true;
        }

        var cleanContact = NormalizeEntityName(contact);
        var cleanSupplier = NormalizeEntityName(supplierName);

        if (string.IsNullOrWhiteSpace(cleanContact) || string.IsNullOrWhiteSpace(cleanSupplier))
        {
            return true;
        }

        if (string.Equals(cleanContact, cleanSupplier, StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        if (cleanContact.Contains(cleanSupplier, StringComparison.OrdinalIgnoreCase) ||
            cleanSupplier.Contains(cleanContact, StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        return false;
    }

    private static string NormalizeEntityName(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            return string.Empty;
        }

        var sanitized = input.ToUpperInvariant();
        sanitized = System.Text.RegularExpressions.Regex.Replace(sanitized, @"[,\.\-\'\(\)\/]", " ");
        sanitized = System.Text.RegularExpressions.Regex.Replace(sanitized, @"\b(INC|INCORPORATED|CORP|CORPORATION|LTD|LIMITED|CO|COMPANY|ENTERPRISE|ENTERPRISES|LLC|TRADING)\b", " ");
        return System.Text.RegularExpressions.Regex.Replace(sanitized, @"\s+", " ").Trim();
    }

    private static bool IsTechnicalOrAdminAccount(string? name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return true;
        }

        var upper = name.ToUpperInvariant();
        return upper.Contains("ADMIN") ||
               upper.Contains("SUPER") ||
               upper.Contains("DEV") ||
               upper.Contains("SYSTEM") ||
               upper.Contains("TEST") ||
               upper.Contains("USER") ||
               upper.Contains("HEAD OF THE PROCURING ENTITY");
    }
}
