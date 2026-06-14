using ERPEZ.Application.Features.Planning.Document.Commands.GenerateWFP;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Services.Renderers.Pdf.Base;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;
using QuestPDF.Helpers;
using ERPEZ.Infrastructure.Services.DocumentGeneration;

namespace ERPEZ.Infrastructure.Services.Renderers.Pdf;

internal sealed class WfpPdfRenderer
    : BasePdfRenderer, IDocumentRenderer<GenerateWfpDocumentCommand>
{
    public DocumentType DocumentType => DocumentType.Wfp;
    public ExportFormat Format       => ExportFormat.Pdf;

    public Task<byte[]> RenderAsync(
        GenerateWfpDocumentCommand request,
        CancellationToken          cancellationToken = default)
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
                    h.Item().PaddingTop(4).Text($"Project Title: {request.ProjectTitle}").Bold().FontSize(9);
                    h.Item().Row(r =>
                    {
                        r.RelativeItem().Text($"Project Duration (no. of months): {request.DurationMonths}").FontSize(8);
                        r.RelativeItem().Text($"Project Start Date: {request.ProjectStartDate:MMMM dd, yyyy}").FontSize(8);
                        r.RelativeItem().Text($"Project End Date: {request.ProjectEndDate:MMM dd, yyyy}").FontSize(8);
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
                            var regularCount  = objective.Activities.Count(a => string.IsNullOrEmpty(a.GroupHeader));
                            var groupCount    = objective.Activities.Count(a => !string.IsNullOrEmpty(a.GroupHeader));
                            var totalRowSpan  = regularCount + groupCount;
                            var objWritten    = false;

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

                    RenderSignatories(col, request.Signatories);
                });

                page.Footer().AlignCenter().Text(t =>
                {
                    t.Span("Page "); t.CurrentPageNumber(); t.Span(" of "); t.TotalPages();
                });
            });
        }).GeneratePdf();

        return Task.FromResult(pdf);
    }
}