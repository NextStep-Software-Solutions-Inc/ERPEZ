using ERPEZ.Application.Common.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Services.Renderers.Pdf.Base;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;
using QuestPDF.Helpers;
using ERPEZ.Infrastructure.Services.DocumentGeneration;

namespace ERPEZ.Infrastructure.Services.Renderers.Pdf;

internal sealed class WfpPdfRenderer
    : BasePdfRenderer, IDocumentRenderer<WfpDataDto>
{
    public DocumentType DocumentType => DocumentType.Wfp;
    public ExportFormat Format       => ExportFormat.Pdf;

    public Task<byte[]> RenderAsync(
        WfpDataDto         request,
        CancellationToken  cancellationToken = default)
    {
        var pdf = Document.Create(doc =>
        {
            doc.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(1.5f, Unit.Centimetre);
                page.DefaultTextStyle(t => t.FontSize(8).FontFamily("Arial"));

                page.Header().Column(h =>
                {
                    h.Item().AlignCenter().Text("WORK PLAN-").Bold().FontSize(12);
                    // Funding body label — matches sample ("National Telecommunications Commission Funded Special Project")
                    // Currently not a WFP entity field; render FundSource name if available, else omit.

                    // ── Title row ────────────────────────────────────────────
                    h.Item().PaddingTop(4).Row(r =>
                    {
                        r.ConstantItem(80).Text("Project Title:").Bold().FontSize(8);
                        r.RelativeItem().Text(request.ProjectTitle).Bold().FontSize(8);
                    });

                    // ── Duration / Start / End ───────────────────────────────
                    h.Item().PaddingTop(2).Row(r =>
                    {
                        r.RelativeItem().Text(t =>
                        {
                            t.Span("Project Duration (no. of months): ").Bold().FontSize(8);
                            t.Span(request.DurationMonths.ToString()).FontSize(8);
                        });
                        r.RelativeItem().Text(t =>
                        {
                            t.Span("Project Start Date: ").Bold().FontSize(8);
                            t.Span(request.ProjectStartDate.ToString("MMMM dd, yyyy")).FontSize(8);
                        });
                        r.RelativeItem().Text(t =>
                        {
                            t.Span("Project End Date: ").Bold().FontSize(8);
                            t.Span(request.ProjectEndDate.ToString("MMM dd, yyyy")).FontSize(8);
                        });
                    });

                    // ── Project Owner / Office ───────────────────────────────
                    var ownerLine = !string.IsNullOrWhiteSpace(request.ProjectOwner)
                        ? request.ProjectOwner
                        : request.OfficeName;

                    h.Item().PaddingTop(2).Row(r =>
                    {
                        r.ConstantItem(80).Text("Project Owner:").Bold().FontSize(8);
                        r.RelativeItem().Text(ownerLine).FontSize(8);
                    });
                });

                page.Content().PaddingTop(6).Column(col =>
                {
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(3); // Objectives
                            c.RelativeColumn(3); // Target Activities
                            c.RelativeColumn(3); // Target Accomplishments
                            c.RelativeColumn(1); // Q1
                            c.RelativeColumn(1); // Q2
                            c.RelativeColumn(1); // Q3
                            c.RelativeColumn(1); // Q4
                            c.RelativeColumn(1); // Total
                            c.RelativeColumn(1); // Weighted %
                        });

                        table.Header(h =>
                        {
                            h.Cell().RowSpan(2u).Element(TableHeaderCell).AlignMiddle().Text("OBJECTIVES").Bold();
                            h.Cell().RowSpan(2u).Element(TableHeaderCell).AlignMiddle().Text("TARGET ACTIVITIES").Bold();
                            h.Cell().RowSpan(2u).Element(TableHeaderCell).AlignMiddle()
                                .Text("TARGET ACCOMPLISHMENTS\n(with % weight and objectively verifiable indicators)").Bold();
                            h.Cell().ColumnSpan(6).Element(TableHeaderCell).AlignCenter()
                                .Text("ANNUAL TARGET- 100% (with % weight per quarter)").Bold();
                            h.Cell().Element(TableHeaderCell).AlignCenter().Text("1st Quarter").Bold();
                            h.Cell().Element(TableHeaderCell).AlignCenter().Text("2nd Quarter").Bold();
                            h.Cell().Element(TableHeaderCell).AlignCenter().Text("3rd Quarter").Bold();
                            h.Cell().Element(TableHeaderCell).AlignCenter().Text("4th Quarter").Bold();
                            h.Cell().Element(TableHeaderCell).AlignCenter().Text("Total").Bold();
                            h.Cell().Element(TableHeaderCell).AlignCenter().Text("Weighted %\nTotal").Bold();
                        });

                        foreach (var objective in request.Objectives)
                        {
                            var regularCount = objective.Activities.Count(a => string.IsNullOrEmpty(a.GroupHeader));
                            var groupCount   = objective.Activities.Count(a => !string.IsNullOrEmpty(a.GroupHeader));
                            var totalRowSpan = Math.Max(regularCount + groupCount, 1);
                            var objWritten   = false;

                            if (objective.Activities.Count == 0)
                            {
                                // Defensive: an objective with zero activities still needs a row
                                // so it isn't silently dropped from the document.
                                table.Cell().Element(TableDataCell).Text(objective.ObjectiveText);
                                table.Cell().ColumnSpan(8).Element(TableDataCell).Text(string.Empty);
                                continue;
                            }

                            foreach (var activity in objective.Activities)
                            {
                                if (!objWritten)
                                {
                                    table.Cell().RowSpan((uint)totalRowSpan).Element(TableDataCell)
                                        .Text(objective.ObjectiveText);
                                    objWritten = true;
                                }

                                if (!string.IsNullOrEmpty(activity.GroupHeader))
                                {
                                    table.Cell().ColumnSpan(8).Element(TableDataCell)
                                        .Text(activity.GroupHeader).Bold();
                                    continue;
                                }

                                table.Cell().Element(TableDataCell).Text(activity.TargetActivity);
                                table.Cell().Element(TableDataCell).Text(activity.TargetAccomplishment);
                                table.Cell().Element(TableDataCell).AlignCenter().Text(activity.Q1 ?? "");
                                table.Cell().Element(TableDataCell).AlignCenter().Text(activity.Q2 ?? "");
                                table.Cell().Element(TableDataCell).AlignCenter().Text(activity.Q3 ?? "");
                                table.Cell().Element(TableDataCell).AlignCenter().Text(activity.Q4 ?? "");
                                table.Cell().Element(TableDataCell).AlignCenter().Text(activity.Total);
                                table.Cell().Element(TableDataCell).AlignCenter().Text(activity.WeightedPctTotal);
                            }
                        }
                    });

                    // ── Weighted % Total summary row ─────────────────────────
                    // Mirrors the sample's bottom-right "100.00%" grand total.
                    var grandWeightedTotal = request.Objectives
                        .SelectMany(o => o.Activities)
                        .Where(a => string.IsNullOrEmpty(a.GroupHeader))
                        .Sum(a =>
                        {
                            if (decimal.TryParse(
                                    a.WeightedPctTotal.Replace("%", "").Trim(),
                                    out var v)) return v;
                            return 0m;
                        });

                    col.Item().PaddingTop(2).Table(totalTable =>
                    {
                        totalTable.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(3); // Objectives
                            c.RelativeColumn(3); // Target Activities
                            c.RelativeColumn(3); // Target Accomplishments
                            c.RelativeColumn(1); // Q1
                            c.RelativeColumn(1); // Q2
                            c.RelativeColumn(1); // Q3
                            c.RelativeColumn(1); // Q4
                            c.RelativeColumn(1); // Total
                            c.RelativeColumn(1); // Weighted %
                        });

                        totalTable.Cell().ColumnSpan(8)
                            .Border(1).BorderColor(Colors.Grey.Medium)
                            .Background(Colors.Grey.Lighten3)
                            .Padding(3);

                        totalTable.Cell()
                            .Border(1).BorderColor(Colors.Grey.Medium)
                            .Background(Colors.Grey.Lighten3)
                            .Padding(3).AlignCenter()
                            .Text($"{grandWeightedTotal:0.##}%").Bold().FontSize(8);
                    });

                    // ── Signatories ───────────────────────────────────────────
                    col.Item().PaddingTop(24).Row(row =>
                    {
                        WfpSignatoryBlock(row, "Prepared by:", "Project Leader");
                        row.ConstantItem(20);
                        WfpSignatoryBlock(row, "Funds Available:", "FMS Director");
                        row.ConstantItem(20);
                        WfpSignatoryBlock(row, "Approved:", "Chancellor");
                    });
                });

                page.Footer().AlignCenter().Text(t =>
                {
                    t.Span("Page "); t.CurrentPageNumber(); t.Span(" of "); t.TotalPages();
                });
            });
        }).GeneratePdf();

        return Task.FromResult(pdf);
    }


    // =========================================================================
    // Helpers
    // =========================================================================

    private static void WfpSignatoryBlock(RowDescriptor row, string label, string position)
    {
        row.RelativeItem().Column(sc =>
        {
            sc.Item().Text(label).Bold().FontSize(8);
            sc.Item().PaddingTop(32).BorderBottom(1).BorderColor(Colors.Black).Text(string.Empty);
            sc.Item().Text("Signature over Printed Name").FontSize(7).Italic();
            sc.Item().PaddingTop(2).Text(position).FontSize(7);
        });
    }
}
