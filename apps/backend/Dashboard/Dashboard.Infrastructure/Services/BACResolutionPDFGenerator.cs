using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ERPEZ.Infrastructure.Services;

public class BACResolutionPDFGenerator
{
    private readonly IUnitOfWork unitOfWork;

    public BACResolutionPDFGenerator(IUnitOfWork unitOfWork)
    {
        this.unitOfWork = unitOfWork;
    }

    public async Task<byte[]> GeneratePDFAsync(Guid procurementProjectId, CancellationToken cancellationToken = default)
    {
        // Load the procurement project with all required inclusions for printing
        var context = (DbContext)unitOfWork;
        var project = await context.Set<ProcurementProject>()
            .Include(p => p.Office)
            .Include(p => p.FundSource)
            .Include(p => p.ProcurementMode)
            .Include(p => p.BACResolutions)
                .ThenInclude(r => r.SelectedClauses)
            .Include(p => p.APPItem)
                .ThenInclude(ai => ai!.PPMPItem)
            .Include(p => p.ConsolidatedPR)
                .ThenInclude(cpr => cpr!.ConsolidatedPRItems)
                    .ThenInclude(ci => ci.PurchaseRequest)
                        .ThenInclude(pr => pr.Office)
            .Include(p => p.ConsolidatedPR)
                .ThenInclude(cpr => cpr!.ConsolidatedPRItems)
                    .ThenInclude(ci => ci.PurchaseRequest)
                        .ThenInclude(pr => pr.FundSource)
            .Include(p => p.ConsolidatedPR)
                .ThenInclude(cpr => cpr!.ConsolidatedPRItems)
                    .ThenInclude(ci => ci.ProcurementMode)
            .Include(p => p.ConsolidatedPR)
                .ThenInclude(cpr => cpr!.ConsolidatedPRItems)
                    .ThenInclude(ci => ci.PRItem)
            .Include(p => p.EndUserRepresentative)
            .Include(p => p.TechRepresentative)
            .FirstOrDefaultAsync(p => p.Id == procurementProjectId, cancellationToken);

        if (project == null)
        {
            throw new KeyNotFoundException($"Procurement project with ID {procurementProjectId} not found.");
        }

        var resolution = project.BACResolutions.FirstOrDefault()
            ?? throw new InvalidOperationException("No BAC Resolution linked to this project.");

        // Define the columns rows based on source
        var tableRows = new List<ProcurementRowDto>();
        if (project.SourceType == Domain.Enums.ProcurementProjectSourceType.AppItem)
        {
            tableRows.Add(new ProcurementRowDto
            {
                Office = project.Office?.Name ?? "N/A",
                Mode = project.ProcurementMode?.Name ?? "N/A",
                Fund = project.FundSource?.Name ?? "N/A",
                ABC = project.ABC
            });
        }
        else if (project.ConsolidatedPR != null)
        {
            var grouped = project.ConsolidatedPR.ConsolidatedPRItems
                .GroupBy(i => new
                {
                    Office = i.PurchaseRequest?.Office?.Name ?? "N/A",
                    Mode = i.ProcurementMode?.Name ?? project.ProcurementMode?.Name ?? "N/A",
                    Fund = i.PurchaseRequest?.FundSource?.Name ?? "N/A"
                })
                .Select(g => new ProcurementRowDto
                {
                    Office = g.Key.Office,
                    Mode = g.Key.Mode,
                    Fund = g.Key.Fund,
                    ABC = g.Sum(x => x.PRItem?.Amount ?? 0)
                })
                .ToList();

            tableRows.AddRange(grouped);
        }

        // If no rows were resolved, fallback to snapshotted project details
        if (!tableRows.Any())
        {
            tableRows.Add(new ProcurementRowDto
            {
                Office = project.Office?.Name ?? "N/A",
                Mode = project.ProcurementMode?.Name ?? "N/A",
                Fund = project.FundSource?.Name ?? "N/A",
                ABC = project.ABC
            });
        }

        // Generate QuestPDF Document
        var pdfBytes = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(1.5f, Unit.Centimetre);
                page.DefaultTextStyle(t => t.FontSize(9).FontFamily("Arial"));

                // Page Header
                page.Header().Column(header =>
                {
                    header.Item().AlignCenter().Text("UNIVERSITY OF SCIENCE AND TECHNOLOGY OF SOUTHERN PHILIPPINES")
                        .Bold().FontSize(10);
                    header.Item().AlignCenter().Text("BIDS AND AWARDS COMMITTEE")
                        .Bold().FontSize(9);
                    header.Item().PaddingTop(4).AlignCenter().Text($"BAC RESOLUTION NO. {resolution.ResolutionNumber}")
                        .Bold().FontSize(11);
                    header.Item().PaddingTop(2).LineHorizontal(1).LineColor(Colors.Black);
                });

                // Content
                page.Content().PaddingTop(12).Column(column =>
                {
                    // WHEREAS Clauses (DisplayOrder ascending)
                    var sortedClauses = resolution.SelectedClauses.OrderBy(c => c.DisplayOrder).ToList();
                    foreach (var clause in sortedClauses)
                    {
                        var text = clause.ClauseText.Trim();
                        if (!text.StartsWith("WHEREAS", StringComparison.OrdinalIgnoreCase))
                        {
                            text = "WHEREAS, " + text;
                        }
                        column.Item().PaddingBottom(6).Text(text).Justify().LineHeight(1.2f);
                    }

                    // NOW, THEREFORE Recommendation Clause
                    column.Item().PaddingTop(8).PaddingBottom(6).Text(t =>
                    {
                        t.Span("NOW, THEREFORE, ").Bold();
                        t.Span("the members of the Bids and Awards Committee (BAC) hereby RESOLVE to recommend the following procurement parameters for use in the project:");
                    });

                    // Procurement Information Table
                    column.Item().Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(2.5f); // Office (Column 2)
                            c.RelativeColumn(2.5f); // Mode of Procurement (Column 4)
                            c.RelativeColumn(2f);   // Source of Fund (Column 9)
                            c.RelativeColumn(2f);   // Estimated Budget / ABC (Column 10)
                        });

                        table.Header(h =>
                        {
                            h.Cell().Border(1).BorderColor(Colors.Grey.Medium).Background(Colors.Grey.Lighten2)
                                .Padding(4).Text("Office / Implementing Unit").Bold().AlignCenter();
                            h.Cell().Border(1).BorderColor(Colors.Grey.Medium).Background(Colors.Grey.Lighten2)
                                .Padding(4).Text("Mode of Procurement").Bold().AlignCenter();
                            h.Cell().Border(1).BorderColor(Colors.Grey.Medium).Background(Colors.Grey.Lighten2)
                                .Padding(4).Text("Source of Fund").Bold().AlignCenter();
                            h.Cell().Border(1).BorderColor(Colors.Grey.Medium).Background(Colors.Grey.Lighten2)
                                .Padding(4).Text("Estimated Budget / ABC").Bold().AlignCenter();
                        });

                        foreach (var row in tableRows)
                        {
                            table.Cell().Border(1).BorderColor(Colors.Grey.Medium).Padding(4).Text(row.Office);
                            table.Cell().Border(1).BorderColor(Colors.Grey.Medium).Padding(4).Text(row.Mode);
                            table.Cell().Border(1).BorderColor(Colors.Grey.Medium).Padding(4).Text(row.Fund);
                            table.Cell().Border(1).BorderColor(Colors.Grey.Medium).Padding(4).Text($"₱{row.ABC:N2}").AlignRight();
                        }
                    });

                    // Resolved Location and Date line
                    var resolvedDateStr = resolution.DateResolved.ToString("MMMM dd, yyyy");
                    column.Item().PaddingTop(12).Text($"RESOLVED this {resolvedDateStr} at {RequestOrFallbackLocation(resolution.ResolvedLocation, project.Title)}.")
                        .Justify();

                    // Signature block
                    column.Item().PaddingTop(24).Row(row =>
                    {
                        row.RelativeItem().Column(sc =>
                        {
                            sc.Item().Text("Prepared By:").Bold().FontSize(8);
                            sc.Item().PaddingTop(20).MaxWidth(150).BorderBottom(1).BorderColor(Colors.Black).Text("");
                            sc.Item().Text(project.EndUserRepresentative?.FullName ?? "Provisional End-User Rep").Bold();
                            sc.Item().Text("End-User Representative").FontSize(8).Italic();
                        });

                        row.RelativeItem().Column(sc =>
                        {
                            sc.Item().Text("Reviewed By:").Bold().FontSize(8);
                            sc.Item().PaddingTop(20).MaxWidth(150).BorderBottom(1).BorderColor(Colors.Black).Text("");
                            sc.Item().Text(project.TechRepresentative?.FullName ?? "Provisional Technical Rep").Bold();
                            sc.Item().Text("Technical Representative").FontSize(8).Italic();
                        });
                    });

                    column.Item().PaddingTop(20).Row(row =>
                    {
                        row.RelativeItem().Column(sc =>
                        {
                            sc.Item().Text("Regular Member:").Bold().FontSize(8);
                            sc.Item().PaddingTop(20).MaxWidth(150).BorderBottom(1).BorderColor(Colors.Black).Text("");
                            sc.Item().Text("BAC IV Regular Member").Bold();
                            sc.Item().Text("Committee Member").FontSize(8).Italic();
                        });

                        row.RelativeItem().Column(sc =>
                        {
                            sc.Item().Text("Approved By:").Bold().FontSize(8);
                            sc.Item().PaddingTop(20).MaxWidth(150).BorderBottom(1).BorderColor(Colors.Black).Text("");
                            sc.Item().Text("BAC IV Chairperson").Bold();
                            sc.Item().Text("Committee Chairperson").FontSize(8).Italic();
                        });
                    });

                    // HOPE Section
                    column.Item().PaddingTop(30).Column(hope =>
                    {
                        hope.Item().AlignCenter().Text("Action of the Head of the Procuring Entity (HoPE):")
                            .Bold().FontSize(8).Italic();
                        hope.Item().PaddingTop(8).AlignCenter().Row(r =>
                        {
                            r.RelativeItem().AlignCenter().Text("[  ] APPROVED").Bold();
                            r.RelativeItem().AlignCenter().Text("[  ] DISAPPROVED").Bold();
                        });
                        hope.Item().PaddingTop(24).AlignCenter().MaxWidth(200).BorderBottom(1).BorderColor(Colors.Black).Text("");
                        hope.Item().AlignCenter().Text("PRESIDENT / HOPE-SYSTEM").Bold();
                        hope.Item().AlignCenter().Text("Head of the Procuring Entity").FontSize(8).Italic();
                    });
                });

                // Page Footer
                page.Footer().AlignCenter().Text(t =>
                {
                    t.Span("Generated on ").FontSize(7).Italic();
                    t.Span(DateTime.UtcNow.AddHours(8).ToString("MM/dd/yyyy HH:mm:ss")).FontSize(7).Italic();
                    t.Span(" | Page ").FontSize(7).Italic();
                    t.CurrentPageNumber().FontSize(7).Italic();
                });
            });
        }).GeneratePdf();

        return pdfBytes;
    }

    private static string RequestOrFallbackLocation(string? text, string title)
    {
        if (!string.IsNullOrWhiteSpace(text)) return text;
        return "University of Science and Technology of Southern Philippines, Cagayan de Oro City";
    }

    private class ProcurementRowDto
    {
        public string Office { get; set; } = string.Empty;
        public string Mode { get; set; } = string.Empty;
        public string Fund { get; set; } = string.Empty;
        public decimal ABC { get; set; }
    }
}
