using ERPEZ.Application.Common.Dtos;
using ERPEZ.Application.Features.Planning.Document.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Services.DocumentGeneration;
using ERPEZ.Infrastructure.Services.Renderers.Pdf.Base;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ERPEZ.Infrastructure.Services.Renderers.Pdf;

internal sealed class MarketScopingPdfRenderer : BasePdfRenderer, IDocumentRenderer<MarketScopingDataDto>
{
    public DocumentType DocumentType => DocumentType.MarketScoping;
    public ExportFormat Format => ExportFormat.Pdf;

    public Task<byte[]> RenderAsync(MarketScopingDataDto request, CancellationToken cancellationToken = default)
    {
        var pdf = Document.Create(doc =>
        {
            doc.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(1.5f, Unit.Centimetre);
                page.DefaultTextStyle(t => t.FontSize(10).FontFamily("Arial"));

                page.Header().Column(col =>
                {
                    col.Item().AlignCenter().Text("Agency Letterhead with Logo").Bold().FontSize(12);
                    col.Item().PaddingTop(10).PaddingBottom(10).LineHorizontal(1).LineColor(Colors.Blue.Darken2);
                    col.Item().AlignCenter().Text("MARKET SCOPING CHECKLIST").Bold().FontSize(12);
                    col.Item().PaddingTop(10).PaddingBottom(10).LineHorizontal(1).LineColor(Colors.Blue.Darken2);
                });

                page.Content().Column(col =>
                {
                    // 1. AGENCY INFORMATION
                    col.Item().PaddingTop(10).Text("1. AGENCY INFORMATION").Bold();
                    col.Item().PaddingTop(5).Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(1);
                            c.RelativeColumn(2);
                        });

                        DrawRow(table, "Name of Procuring Entity", request.ProcuringEntity);
                        DrawRow(table, "End-User/Implementing Unit", request.ImplementingUnit);
                        DrawRow(table, "Name & Designation of Representative", request.RepresentativeNameAndDesignation);
                    });

                    // 2. PROJECT OVERVIEW
                    col.Item().PaddingTop(15).Text("2. PROJECT OVERVIEW").Bold();
                    col.Item().PaddingTop(5).Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(1);
                            c.RelativeColumn(2);
                        });

                        DrawRow(table, "Project Name", request.ProjectName);
                        DrawRow(table, "Estimated Budget", $"Php {request.EstimatedBudget:N2}");
                        DrawRow(table, "Period of Market Scoping\n[From (mm/yyyy) To (mm/yyyy)]", 
                            $"{request.PeriodFrom:MM/yyyy} - {request.PeriodTo:MM/yyyy}");
                        DrawRow(table, "Expected Date of Delivery (mm/yyyy)", request.ExpectedDeliveryDate.ToString("MM/yyyy"));
                    });

                    // 3. MARKET SCOPING ACTIVITY/IES CONDUCTED
                    col.Item().PaddingTop(15).Text("3. MARKET SCOPING ACTIVITY/IES CONDUCTED (Check all that apply)").Bold();
                    col.Item().PaddingTop(5).Text("This confirms that market scoping activities were conducted in accordance with Section 10 of Republic Act No. 12009 and its Implementing Rules and Regulations (IRR), and considered in the Project Procurement Management Plan, consistent with the Principle of Proportionality.");
                    
                    col.Item().PaddingTop(5).Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.ConstantColumn(50);
                            c.RelativeColumn(2);
                            c.RelativeColumn(2);
                        });

                        table.Header(h =>
                        {
                            h.Cell().Element(TableHeaderCell).AlignCenter().Text("Check\n(✓)").Bold();
                            h.Cell().Element(TableHeaderCell).AlignCenter().Text("Activity/ies Conducted").Bold();
                            h.Cell().Element(TableHeaderCell).AlignCenter().Text("Documentation\n(as may be applicable)").Bold();
                        });

                        foreach (var act in request.Activities)
                        {
                            table.Cell().Element(TableDataCell).AlignCenter().AlignMiddle().Width(12).Height(12).Border(0.5f).BorderColor(Colors.Black).AlignCenter().AlignMiddle().Text(act.IsChecked ? "✓" : "").FontSize(9).Bold();
                            table.Cell().Element(TableDataCell).Text(act.Description);
                            table.Cell().Element(TableDataCell).Text(act.Documentation);
                        }
                    });

                    col.Item().PaddingTop(5).Text("Notes:\n  i. The market scoping activities shall be identified and undertaken at the option of the End-User or Implementing Unit based on its needs and objectives.\n  ii. The list of supporting documents in the Documentation column is not exclusive and may include other documents that may be gathered by the End-User or Implementing Unit pertinent to the activity/ies conducted.").FontSize(9).Italic();

                    // 4. MARKET SCOPING RESULTS
                    col.Item().PaddingTop(15).Text("4. MARKET SCOPING RESULTS").Bold();
                    col.Item().PaddingTop(5).Text("Indicate recommendations in the column provided based on the results of the market scoping activities undertaken. These recommendations shall be considered in the development of a comprehensive and realistic PPMP, taking into account the parameters outlined under Section 10.4 of the IRR of RA 12009, as may be applicable.");
                    
                    col.Item().PaddingTop(5).Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(2);
                            c.RelativeColumn(1);
                            c.RelativeColumn(2);
                        });

                        table.Header(h =>
                        {
                            h.Cell().Element(TableHeaderCell).AlignCenter().Text("Parameters").Bold();
                            h.Cell().Element(TableHeaderCell).AlignCenter().Text("Considered?\n(Yes/No/ Not\nApplicable)").Bold();
                            h.Cell().Element(TableHeaderCell).AlignCenter().Text("Recommendations\nbased on the Market Scoping\n(Attach additional documents\nif necessary)").Bold();
                        });

                        var letters = new[] { "a", "b", "c", "d", "e", "f", "g", "h" };
                        var i = 0;
                        foreach (var param in request.Parameters)
                        {
                            table.Cell().Element(TableDataCell).Text(t =>
                            {
                                t.Span($"{letters[i]}. {param.ParameterName}").Bold();
                                t.Span($"\n\n[{param.GuidedQuestion}]").Italic().FontSize(8.5f);
                            });
                            table.Cell().Element(TableDataCell).AlignCenter().AlignMiddle().Text(param.Considered);
                            table.Cell().Element(TableDataCell).Text(param.Recommendations);
                            i++;
                        }
                    });

                    // Signatories
                    col.Item().PaddingTop(30).Row(row =>
                    {
                        SignatoryBlock(row, "Prepared by:\nPersonnel-in-Charge, End-User or\nImplementing Unit", request.PreparedBy);
                        row.ConstantItem(40);
                        SignatoryBlock(row, "Approved by:\nHead, End-User or Implementing Unit", request.ApprovedBy);
                    });
                });

                page.Footer().Row(row =>
                {
                    row.RelativeItem().Text(t =>
                    {
                        t.Span("Page ");
                        t.CurrentPageNumber();
                        t.Span(" of ");
                        t.TotalPages();
                        t.EmptyLine();
                        t.Span("Market Scoping Checklist").Italic();
                    });
                });
            });
        }).GeneratePdf();

        return Task.FromResult(pdf);
    }

    private static void DrawRow(TableDescriptor table, string label, string value)
    {
        table.Cell().Element(TableDataCell).Text(label);
        table.Cell().Element(TableDataCell).Text(value);
    }

    private static void SignatoryBlock(RowDescriptor row, string headerLabel, SignatoryDto sig)
    {
        row.RelativeItem().Column(sc =>
        {
            sc.Item().Text(headerLabel).FontSize(10);
            sc.Item().PaddingTop(30).BorderBottom(1).BorderColor(Colors.Black).Text(string.Empty);
            sc.Item().Text($"[{sig.PrintedName}]").Bold();
            sc.Item().Text($"[{sig.Position}]");
            if (sig.Date.HasValue)
            {
                sc.Item().Text($"[{sig.Date.Value:MM/dd/yyyy}]");
            }
            else
            {
                sc.Item().Text("[Date]");
            }
        });
    }
}
