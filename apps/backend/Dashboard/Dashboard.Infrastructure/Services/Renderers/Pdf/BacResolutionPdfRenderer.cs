using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.Projects.Commands.GenerateBacResolutionDocument;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Services.DocumentGeneration;
using ERPEZ.Infrastructure.Services.Renderers.Pdf.Base;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ERPEZ.Infrastructure.Services.Renderers.Pdf;

internal sealed class BacResolutionPdfRenderer : BasePdfRenderer, IDocumentRenderer<BacResolutionDataDto>
{
    public DocumentType DocumentType => DocumentType.BacResolution;
    public ExportFormat Format => ExportFormat.Pdf;

    public Task<byte[]> RenderAsync(
        BacResolutionDataDto request,
        CancellationToken cancellationToken = default)
    {
        var logoBytes = LoadDefaultLogo();

        var pdf = Document.Create(doc =>
        {
            doc.Page(page =>
            {
                page.Size(PageSizes.A4.Portrait());
                page.Margin(1.5f, Unit.Centimetre);
                page.DefaultTextStyle(t => t.FontSize(9).FontFamily("Arial"));

                // ── Header ──────────────────────────────────────────────────
                page.Header().Column(col =>
                {
                    if (logoBytes != null && logoBytes.Length > 0)
                    {
                        col.Item().AlignCenter().Height(50).Image(logoBytes);
                    }

                    col.Item().PaddingTop(2).AlignCenter()
                        .Text("[Agency Letterhead with Logo]")
                        .Bold().FontSize(9.5f).Italic();

                    col.Item().PaddingTop(6).AlignCenter()
                        .Text($"BAC Resolution No. {request.ResolutionNumber}")
                        .Bold().FontSize(10);
                });

                // ── Body Content ─────────────────────────────────────────────
                page.Content().PaddingTop(12).Column(col =>
                {
                    // 1. WHEREAS Clauses
                    if (request.WhereasClauses != null && request.WhereasClauses.Any())
                    {
                        foreach (var clause in request.WhereasClauses.OrderBy(c => c.Order))
                        {
                            var body = clause.Body?.Trim() ?? string.Empty;
                            if (body.StartsWith("WHEREAS,", StringComparison.OrdinalIgnoreCase))
                            {
                                body = body.Substring(8).TrimStart();
                            }
                            else if (body.StartsWith("WHEREAS", StringComparison.OrdinalIgnoreCase))
                            {
                                body = body.Substring(7).TrimStart();
                            }

                            col.Item().PaddingBottom(8).Text(text =>
                            {
                                text.Span("WHEREAS, ").Bold();
                                text.Span(body);
                                if (!body.EndsWith(";") && !body.EndsWith("."))
                                {
                                    text.Span(";");
                                }
                            });
                        }
                    }
                    else
                    {
                        col.Item().PaddingBottom(8).Text(text =>
                        {
                            text.Span("WHEREAS, ").Bold();
                            text.Span("Section 12 of the Revised IRR of R.A. 9184 provides that the BAC shall recommend to the Head of the Procuring Entity the use of Alternative Methods of Procurement as provided for in the Rules;");
                        });
                    }

                    // 2. NOW, THEREFORE Clauses
                    if (request.NowThereforeClauses != null && request.NowThereforeClauses.Any())
                    {
                        foreach (var clause in request.NowThereforeClauses.OrderBy(c => c.Order))
                        {
                            var body = clause.Body?.Trim() ?? string.Empty;
                            if (body.StartsWith("NOW, THEREFORE,", StringComparison.OrdinalIgnoreCase))
                            {
                                body = body.Substring(15).TrimStart();
                            }
                            else if (body.StartsWith("NOW THEREFORE,", StringComparison.OrdinalIgnoreCase))
                            {
                                body = body.Substring(14).TrimStart();
                            }
                            else if (body.StartsWith("NOW THEREFORE", StringComparison.OrdinalIgnoreCase))
                            {
                                body = body.Substring(13).TrimStart();
                            }

                            col.Item().PaddingTop(4).PaddingBottom(8).Text(text =>
                            {
                                text.Span("NOW, THEREFORE, ").Bold();
                                text.Span(body);
                            });
                        }
                    }
                    else
                    {
                        col.Item().PaddingTop(4).PaddingBottom(8).Text(text =>
                        {
                            text.Span("NOW, THEREFORE, ").Bold();
                            text.Span("We, the members of the Bids and Awards Committee (BAC) hereby ");
                            text.Span("RESOLVE ").Bold();
                            text.Span("as it is hereby ");
                            text.Span("RESOLVED ").Bold();
                            text.Span("to recommend the use of:");
                        });
                    }

                    // 3. Project Details Block
                    col.Item().PaddingLeft(12).PaddingBottom(10).Column(details =>
                    {
                        details.Item().Text(t =>
                        {
                            t.Span("Method: ").Bold();
                            t.Span(request.ModeOfProcurement);
                        });
                        details.Item().Text(t =>
                        {
                            t.Span(request.SourceType == "APPItem" ? "APP Number(s): " : "PR Number: ").Bold();
                            t.Span(request.PrNumber);
                        });
                        details.Item().Text(t =>
                        {
                            t.Span("End-user / Office: ").Bold();
                            t.Span(request.EndUserRepName.ToUpper());
                        });
                        details.Item().Text(t =>
                        {
                            t.Span("Amount (ABC): ").Bold();
                            t.Span($"Php {request.ABC:N2}");
                        });
                        details.Item().Text(t =>
                        {
                            t.Span("Name of Project: ").Bold();
                            t.Span(request.ProjectTitle);
                        });
                    });

                    // 3.1. Nested Item Breakdown by APP / Consolidated PR
                    if (request.ItemGroups != null && request.ItemGroups.Any())
                    {
                        col.Item().PaddingTop(4).PaddingBottom(10).Column(itemsSection =>
                        {
                            if (request.SourceType == "APPItem")
                            {
                                int groupIndex = 1;
                                foreach (var group in request.ItemGroups)
                                {
                                    if (request.ItemGroups.Count > 1)
                                    {
                                        itemsSection.Item().PaddingTop(6).PaddingBottom(3).Text($"{groupIndex}. {group.GroupTitle}").Bold().FontSize(8.5f);
                                    }
                                    else
                                    {
                                        itemsSection.Item().PaddingTop(4).PaddingBottom(3).Text(group.GroupTitle).Bold().FontSize(8.5f);
                                    }

                                    // Aggregate line items by (PAPCode, ProcurementModeName, OfficeName)
                                    var aggregatedRows = group.Items
                                        .GroupBy(i => new
                                        {
                                            PAPCode = !string.IsNullOrWhiteSpace(i.PAPCode) ? i.PAPCode : (!string.IsNullOrWhiteSpace(i.ItemCode) ? i.ItemCode : "—"),
                                            Mode = !string.IsNullOrWhiteSpace(i.ProcurementModeName) ? i.ProcurementModeName : (!string.IsNullOrWhiteSpace(request.ModeOfProcurement) ? request.ModeOfProcurement : "Small Value Procurement"),
                                            Office = !string.IsNullOrWhiteSpace(i.OfficeName) ? i.OfficeName : "—"
                                        })
                                        .Select(g => new
                                        {
                                            g.Key.PAPCode,
                                            ModesOfProcurement = g.Key.Mode,
                                            EndUser = g.Key.Office,
                                            Amount = g.Sum(x => x.TotalAmount)
                                        })
                                        .ToList();

                                    itemsSection.Item().Table(table =>
                                    {
                                        table.ColumnsDefinition(columns =>
                                        {
                                            columns.RelativeColumn(2.5f); // Code (PAP)
                                            columns.RelativeColumn(3.5f); // Modes of Procurement
                                            columns.RelativeColumn(3.5f); // End-User or Implementing Unit
                                            columns.RelativeColumn(2.5f); // Amount of Estimated Budget
                                        });

                                        // Header
                                        table.Header(header =>
                                        {
                                            header.Cell().Border(0.5f).BorderColor(Colors.Grey.Medium).Background(Colors.Grey.Lighten3).Padding(4).AlignCenter().AlignMiddle().Text("Code (PAP)").Bold().FontSize(7.5f);
                                            header.Cell().Border(0.5f).BorderColor(Colors.Grey.Medium).Background(Colors.Grey.Lighten3).Padding(4).AlignCenter().AlignMiddle().Text("Modes of Procurement").Bold().FontSize(7.5f);
                                            header.Cell().Border(0.5f).BorderColor(Colors.Grey.Medium).Background(Colors.Grey.Lighten3).Padding(4).AlignCenter().AlignMiddle().Text("End-User or Implementing Unit").Bold().FontSize(7.5f);
                                            header.Cell().Border(0.5f).BorderColor(Colors.Grey.Medium).Background(Colors.Grey.Lighten3).Padding(4).AlignCenter().AlignMiddle().Text("Amount of Estimated Budget").Bold().FontSize(7.5f);
                                        });

                                        // Rows
                                        foreach (var row in aggregatedRows)
                                        {
                                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Medium).Padding(4).AlignCenter().AlignMiddle().Text(row.PAPCode).FontSize(7.5f);
                                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Medium).Padding(4).AlignCenter().AlignMiddle().Text(row.ModesOfProcurement).FontSize(7.5f);
                                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Medium).Padding(4).AlignCenter().AlignMiddle().Text(row.EndUser).FontSize(7.5f);
                                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Medium).Padding(4).AlignRight().AlignMiddle().Text($"Php {row.Amount:N2}").FontSize(7.5f);
                                        }

                                        // Total Row
                                        var groupTotal = aggregatedRows.Sum(r => r.Amount);
                                        table.Cell().ColumnSpan(3).Border(0.5f).BorderColor(Colors.Grey.Medium).Padding(4).AlignRight().AlignMiddle().Text("Total:").Bold().FontSize(7.5f);
                                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Medium).Padding(4).AlignRight().AlignMiddle().Text($"Php {groupTotal:N2}").Bold().FontSize(7.5f);
                                    });

                                    groupIndex++;
                                }

                                var grandTotal = request.ItemGroups.Sum(g => g.Subtotal);
                                if (request.ItemGroups.Count > 1 && grandTotal > 0)
                                {
                                    itemsSection.Item().PaddingTop(4).AlignRight().Text(t =>
                                    {
                                        t.Span("Grand Total: ").Bold().FontSize(8.5f);
                                        t.Span($"Php {grandTotal:N2}").Bold().FontSize(8.5f).FontColor(Colors.Green.Darken2);
                                    });
                                }
                            }
                            else
                            {
                                itemsSection.Item().PaddingBottom(4).Text("ITEM SPECIFICATIONS & ALLOCATIONS").Bold().FontSize(8.5f);

                                foreach (var group in request.ItemGroups)
                                {
                                    itemsSection.Item().PaddingTop(4).PaddingBottom(2).Background(Colors.Grey.Lighten3).Padding(4).Row(gh =>
                                    {
                                        gh.RelativeItem().Text(group.GroupTitle).Bold().FontSize(8);
                                        gh.ConstantItem(140).AlignRight().Text($"Subtotal: Php {group.Subtotal:N2}").Bold().FontSize(8);
                                    });

                                    itemsSection.Item().Table(table =>
                                    {
                                        table.ColumnsDefinition(columns =>
                                        {
                                            columns.ConstantColumn(20); // #
                                            columns.RelativeColumn(3.5f); // Item Name / Description
                                            columns.RelativeColumn(2); // Office
                                            columns.ConstantColumn(30); // Qty
                                            columns.ConstantColumn(30); // Unit
                                            columns.ConstantColumn(60); // Unit Cost
                                            columns.ConstantColumn(70); // Total Cost
                                        });

                                        // Header
                                        table.Header(header =>
                                        {
                                            header.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Medium).Padding(2).Text("#").Bold().FontSize(7);
                                            header.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Medium).Padding(2).Text("Item / Description").Bold().FontSize(7);
                                            header.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Medium).Padding(2).Text("Office / End-User").Bold().FontSize(7);
                                            header.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Medium).Padding(2).AlignCenter().Text("Qty").Bold().FontSize(7);
                                            header.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Medium).Padding(2).AlignCenter().Text("Unit").Bold().FontSize(7);
                                            header.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Medium).Padding(2).AlignRight().Text("Unit Cost").Bold().FontSize(7);
                                            header.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Medium).Padding(2).AlignRight().Text("Total Amount").Bold().FontSize(7);
                                        });

                                        // Rows
                                        int itemIndex = 1;
                                        foreach (var item in group.Items)
                                        {
                                            var bg = itemIndex % 2 == 0 ? Colors.Grey.Lighten4 : Colors.White;
                                            table.Cell().Background(bg).Padding(2).Text(itemIndex.ToString()).FontSize(7);
                                            table.Cell().Background(bg).Padding(2).Column(c =>
                                            {
                                                c.Item().Text(item.ItemName).Bold().FontSize(7);
                                                if (!string.IsNullOrWhiteSpace(item.Description) && item.Description != item.ItemName)
                                                {
                                                    c.Item().Text(item.Description).FontSize(6).Italic();
                                                }
                                                if (!string.IsNullOrWhiteSpace(item.ItemCode) && item.ItemCode != item.ItemName)
                                                {
                                                    c.Item().Text($"Code: {item.ItemCode}").FontSize(6).FontColor(Colors.Grey.Darken2);
                                                }
                                            });
                                            table.Cell().Background(bg).Padding(2).Text(item.OfficeName).FontSize(7);
                                            table.Cell().Background(bg).Padding(2).AlignCenter().Text(item.Quantity.ToString()).FontSize(7);
                                            table.Cell().Background(bg).Padding(2).AlignCenter().Text(item.Unit).FontSize(7);
                                            table.Cell().Background(bg).Padding(2).AlignRight().Text($"Php {item.UnitCost:N2}").FontSize(7);
                                            table.Cell().Background(bg).Padding(2).AlignRight().Text($"Php {item.TotalAmount:N2}").Bold().FontSize(7);
                                            itemIndex++;
                                        }
                                    });
                                }

                                var grandTotal = request.ItemGroups.Sum(g => g.Subtotal);
                                if (grandTotal > 0)
                                {
                                    itemsSection.Item().PaddingTop(3).AlignRight().Text(t =>
                                    {
                                        t.Span("Grand Total: ").Bold().FontSize(8);
                                        t.Span($"Php {grandTotal:N2}").Bold().FontSize(8).FontColor(Colors.Green.Darken2);
                                    });
                                }
                            }
                        });
                    }

                    // 4. RESOLVED Clauses
                    if (request.ResolvedClauses != null && request.ResolvedClauses.Any())
                    {
                        int resolvedIndex = 0;
                        foreach (var clause in request.ResolvedClauses.OrderBy(c => c.Order))
                        {
                            var body = clause.Body?.Trim() ?? string.Empty;
                            string prefix = resolvedIndex == 0 ? "RESOLVED, " : "FURTHER RESOLVED, ";

                            if (body.StartsWith("FURTHER RESOLVED,", StringComparison.OrdinalIgnoreCase))
                            {
                                prefix = "FURTHER RESOLVED, ";
                                body = body.Substring(17).TrimStart();
                            }
                            else if (body.StartsWith("FURTHER RESOLVED", StringComparison.OrdinalIgnoreCase))
                            {
                                prefix = "FURTHER RESOLVED, ";
                                body = body.Substring(16).TrimStart();
                            }
                            else if (body.StartsWith("RESOLVED,", StringComparison.OrdinalIgnoreCase))
                            {
                                prefix = "RESOLVED, ";
                                body = body.Substring(9).TrimStart();
                            }
                            else if (body.StartsWith("RESOLVED", StringComparison.OrdinalIgnoreCase))
                            {
                                prefix = "RESOLVED, ";
                                body = body.Substring(8).TrimStart();
                            }

                            col.Item().PaddingBottom(10).Text(t =>
                            {
                                t.Span(prefix).Bold();
                                t.Span(body);
                            });
                            resolvedIndex++;
                        }
                    }
                    else
                    {
                        var dateFormatted = request.DateResolved != default
                            ? request.DateResolved.ToString("dddd, MMMM dd, yyyy")
                            : DateTime.Now.ToString("dddd, MMMM dd, yyyy");
                        var location = !string.IsNullOrWhiteSpace(request.ResolvedLocation)
                            ? request.ResolvedLocation
                            : "Procuring Entity Premises";

                        col.Item().PaddingBottom(10).Text(t =>
                        {
                            t.Span("RESOLVED ").Bold();
                            t.Span($"this day of {dateFormatted} at {location}.");
                        });
                    }

                    // 5. Note
                    col.Item().PaddingBottom(16).Text(t =>
                    {
                        t.Span("Note: ").Bold().Italic();
                        t.Span("Reference to this Resolution shall be indicated in the corresponding purchase request.").Italic();
                    });

                    // 6. Signatories Block
                    col.Item().Text("Approved by:").Bold();

                    // Signatories pairing (2 columns)
                    var signatories = BuildSignatoryPairs(request);

                    col.Item().PaddingTop(8).Column(sigCol =>
                    {
                        for (int i = 0; i < signatories.Count; i += 2)
                        {
                            var left = signatories[i];
                            var right = i + 1 < signatories.Count ? signatories[i + 1] : null;

                            sigCol.Item().PaddingBottom(16).Row(row =>
                            {
                                row.RelativeItem().Column(sc =>
                                {
                                    sc.Item().PaddingTop(18).MaxWidth(180).BorderBottom(1).BorderColor(Colors.Black).PaddingBottom(2)
                                        .Text(left.Name).Bold();
                                    sc.Item().PaddingTop(2).Text(left.Position).FontSize(8);
                                });

                                if (right != null)
                                {
                                    row.RelativeItem().Column(sc =>
                                    {
                                        sc.Item().PaddingTop(18).MaxWidth(180).BorderBottom(1).BorderColor(Colors.Black).PaddingBottom(2)
                                            .Text(right.Name).Bold();
                                        sc.Item().PaddingTop(2).Text(right.Position).FontSize(8);
                                    });
                                }
                                else
                                {
                                    row.RelativeItem();
                                }
                            });
                        }
                    });

                    // 7. Detachable Approval Slip at Bottom
                    col.Item().PaddingTop(12).LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten2);

                    col.Item().PaddingTop(8).Column(slip =>
                    {
                        slip.Item().Text($"BAC Resolution No. {request.ResolutionNumber}").Bold();
                        slip.Item().PaddingTop(2).Text("Recommendation:").Italic();

                        slip.Item().PaddingTop(4).Row(r =>
                        {
                            r.ConstantItem(120).Text("☐ Approved").Bold();
                            r.ConstantItem(120).Text("☐ Disapproved").Bold();
                        });

                        slip.Item().PaddingTop(24).AlignCenter().Column(head =>
                        {
                            var headName = !string.IsNullOrWhiteSpace(request.HeadOfAgencyName) &&
                                           !request.HeadOfAgencyName.Contains("CULTURA", StringComparison.OrdinalIgnoreCase)
                                ? request.HeadOfAgencyName.ToUpper()
                                : string.Empty;

                            head.Item().MinWidth(220).BorderBottom(1).BorderColor(Colors.Black).PaddingBottom(2).AlignCenter()
                                .Text(headName).Bold().FontSize(10);

                            var title = !string.IsNullOrWhiteSpace(request.HeadOfAgencyTitle) &&
                                        !request.HeadOfAgencyTitle.Contains("USTP", StringComparison.OrdinalIgnoreCase)
                                ? request.HeadOfAgencyTitle.ToUpper()
                                : "HEAD OF THE PROCURING ENTITY";

                            head.Item().PaddingTop(3).AlignCenter().Text(title).FontSize(8);
                        });
                    });
                });

                // ── Footer ───────────────────────────────────────────────────
                page.Footer().AlignRight().Text(t =>
                {
                    t.Span("Page ").FontSize(7);
                    t.CurrentPageNumber().FontSize(7);
                    t.Span(" of ").FontSize(7);
                    t.TotalPages().FontSize(7);
                });
            });
        }).GeneratePdf();

        return Task.FromResult(pdf);
    }

    private class SignatoryItem
    {
        public string Name { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
    }

    private static string FormatRole(string role)
    {
        if (string.IsNullOrWhiteSpace(role)) return "BAC REGULAR MEMBER";
        if (role.StartsWith("BAC", StringComparison.OrdinalIgnoreCase))
        {
            var clean = System.Text.RegularExpressions.Regex.Replace(role, @"^BAC\s+(?:[IVXLCDM]+\s+)?", "BAC ", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            return clean.Trim().ToUpper();
        }

        var spacedRole = System.Text.RegularExpressions.Regex.Replace(role, "(?<!^)([A-Z])", " $1").Trim().ToUpper();
        return $"BAC {spacedRole}";
    }

    private static List<SignatoryItem> BuildSignatoryPairs(BacResolutionDataDto request)
    {
        var list = new List<SignatoryItem>();

        // 1. Provisional Representatives
        list.Add(new SignatoryItem
        {
            Name = request.EndUserRepName ?? string.Empty,
            Position = !string.IsNullOrWhiteSpace(request.EndUserRepPosition)
                ? request.EndUserRepPosition
                : "Provisional Member, End-user Rep"
        });

        list.Add(new SignatoryItem
        {
            Name = request.TechRepName ?? string.Empty,
            Position = !string.IsNullOrWhiteSpace(request.TechRepPosition)
                ? request.TechRepPosition
                : "Provisional Member, Tech Rep"
        });

        // 2. BAC Members
        if (request.BacMembers != null && request.BacMembers.Any())
        {
            foreach (var member in request.BacMembers)
            {
                var position = !string.IsNullOrWhiteSpace(member.Role)
                    ? FormatRole(member.Role)
                    : (!string.IsNullOrWhiteSpace(member.Position) ? member.Position : "BAC REGULAR MEMBER");

                list.Add(new SignatoryItem
                {
                    Name = member.FullName ?? string.Empty,
                    Position = position
                });
            }
        }
        else
        {
            list.Add(new SignatoryItem { Name = string.Empty, Position = "BAC REGULAR MEMBER" });
            list.Add(new SignatoryItem { Name = string.Empty, Position = "BAC REGULAR MEMBER" });
            list.Add(new SignatoryItem { Name = string.Empty, Position = "BAC VICE CHAIRPERSON" });
            list.Add(new SignatoryItem { Name = string.Empty, Position = "BAC CHAIRPERSON" });
        }

        return list;
    }
}
