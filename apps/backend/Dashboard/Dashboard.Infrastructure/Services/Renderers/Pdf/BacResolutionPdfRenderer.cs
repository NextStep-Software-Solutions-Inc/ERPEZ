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

                    col.Item().AlignCenter().Text("UNIVERSITY OF SCIENCE AND TECHNOLOGY OF SOUTHERN PHILIPPINES")
                        .Bold().FontSize(10);

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
                            t.Span("PR Number: ").Bold();
                            t.Span(request.PrNumber);
                        });
                        details.Item().Text(t =>
                        {
                            t.Span("End-user: ").Bold();
                            t.Span(request.EndUserRepName.ToUpper());
                        });
                        details.Item().Text(t =>
                        {
                            t.Span("Amount of Purchase Request: ").Bold();
                            t.Span($"Php {request.ABC:N2}");
                        });
                        details.Item().Text(t =>
                        {
                            t.Span("Name of Project: ").Bold();
                            t.Span(request.ProjectTitle);
                        });
                    });

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
                            : "University of Science and Technology of Southern Philippines, Cagayan de Oro City";

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
                                    sc.Item().Text(left.Name).Bold();
                                    sc.Item().Text(left.Position).FontSize(8);
                                });

                                if (right != null)
                                {
                                    row.RelativeItem().Column(sc =>
                                    {
                                        sc.Item().Text(right.Name).Bold();
                                        sc.Item().Text(right.Position).FontSize(8);
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
                            head.Item().Text(request.HeadOfAgencyName.ToUpper()).Bold().FontSize(10);
                            head.Item().Text(request.HeadOfAgencyTitle.ToUpper()).FontSize(8);
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
        if (string.IsNullOrWhiteSpace(role)) return "BAC MEMBER";
        if (role.StartsWith("BAC", StringComparison.OrdinalIgnoreCase))
        {
            return role.ToUpper();
        }

        var spacedRole = System.Text.RegularExpressions.Regex.Replace(role, "(?<!^)([A-Z])", " $1").Trim().ToUpper();
        return $"BAC IV {spacedRole}";
    }

    private static List<SignatoryItem> BuildSignatoryPairs(BacResolutionDataDto request)
    {
        var list = new List<SignatoryItem>();

        // 1. Provisional Representatives
        list.Add(new SignatoryItem
        {
            Name = request.EndUserRepName.ToUpper(),
            Position = request.EndUserRepPosition
        });

        list.Add(new SignatoryItem
        {
            Name = request.TechRepName.ToUpper(),
            Position = request.TechRepPosition
        });

        // 2. BAC Members from Database (if available)
        if (request.BacMembers != null && request.BacMembers.Any())
        {
            foreach (var member in request.BacMembers)
            {
                var position = !string.IsNullOrWhiteSpace(member.Role)
                    ? FormatRole(member.Role)
                    : (!string.IsNullOrWhiteSpace(member.Position) ? member.Position : "BAC MEMBER");

                list.Add(new SignatoryItem
                {
                    Name = member.FullName.ToUpper(),
                    Position = position
                });
            }
        }
        else
        {
            // Default BAC Members fallback matching standard structure
            list.Add(new SignatoryItem { Name = "ATTY. NIVRA LYN K. EMPIALES", Position = "BAC IV REGULAR MEMBER" });
            list.Add(new SignatoryItem { Name = "DR. GREG M. CUBIO", Position = "BAC IV REGULAR MEMBER" });
            list.Add(new SignatoryItem { Name = "ATTY. SARAH JANE F. BEHIGA", Position = "BAC IV VICE CHAIRPERSON" });
            list.Add(new SignatoryItem { Name = "ENGR. ALEX L. MAUREAL", Position = "BAC IV CHAIRPERSON" });
        }

        return list;
    }
}
