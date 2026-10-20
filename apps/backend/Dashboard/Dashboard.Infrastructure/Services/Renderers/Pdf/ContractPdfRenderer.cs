using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.Contracts.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Services.DocumentGeneration;
using ERPEZ.Infrastructure.Services.Renderers.Pdf.Base;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ERPEZ.Infrastructure.Services.Renderers.Pdf;

public sealed class ContractPdfRenderer : BasePdfRenderer, IDocumentRenderer<ContractDataDto>
{
    public DocumentType DocumentType => DocumentType.Contract;
    public ExportFormat Format => ExportFormat.Pdf;

    public Task<byte[]> RenderAsync(
        ContractDataDto request,
        CancellationToken cancellationToken = default)
    {
        var logoBytes = LoadDefaultLogo();

        var contractDate = request.ContractDate ?? DateTime.UtcNow;
        var dayOrdinal = GetOrdinal(contractDate.Day);
        var monthName = contractDate.ToString("MMMM");
        var year = contractDate.ToString("yyyy");

        var entityName = CleanEntityName(request.ProcuringEntityName);

        var entityAddress = !string.IsNullOrWhiteSpace(request.ProcuringEntityAddress)
            ? request.ProcuringEntityAddress.Trim()
            : "University Town, Musuan, Maramag, Bukidnon, Philippines";

        var supplierName = !string.IsNullOrWhiteSpace(request.SupplierName)
            ? request.SupplierName.Trim()
            : "Winning Supplier";

        var supplierAddress = !string.IsNullOrWhiteSpace(request.SupplierAddress)
            ? request.SupplierAddress.Trim()
            : "Philippines";

        var projectTitle = !string.IsNullOrWhiteSpace(request.ProjectTitle)
            ? request.ProjectTitle.Trim()
            : request.Description;

        var contactPerson = !string.IsNullOrWhiteSpace(request.ContactPerson)
            ? request.ContactPerson.Trim()
            : "The Authorized Representative";

        var approvedBy = !string.IsNullOrWhiteSpace(request.ApprovedByName)
            ? request.ApprovedByName.Trim()
            : string.Empty;

        var approvedPosition = !string.IsNullOrWhiteSpace(request.ApprovedByPosition)
            ? request.ApprovedByPosition.Trim()
            : (!string.IsNullOrWhiteSpace(approvedBy) ? "Head of the Procuring Entity" : string.Empty);

        var pdf = Document.Create(doc =>
        {
            doc.Page(page =>
            {
                page.Size(PageSizes.A4.Portrait());
                page.Margin(2.0f, Unit.Centimetre);
                page.DefaultTextStyle(t => t.FontSize(9.5f).FontFamily("Arial").LineHeight(1.35f));

                // ── 1. Official Letterhead ───────────────────────────────────
                page.Header().Column(col =>
                {
                    RenderCenteredAgencyHeader(
                        col,
                        request.ProcuringEntityName,
                        request.ProcuringEntityAddress,
                        request.LogoBytes ?? logoBytes,
                        officeName: request.ProcuringEntityOffice);
                });

                // ── 2. Contract Body ─────────────────────────────────────────
                page.Content().PaddingTop(10).Column(col =>
                {
                    // Top Form Label
                    col.Item().AlignCenter().Text("Contract Form").Bold().FontSize(10.5f);
                    col.Item().PaddingTop(2).AlignCenter()
                        .Text("[Note: The duly accomplished form is not required to be submitted with the Bid but shall be submitted within ten (10) days after receiving the Notice of Award]")
                        .Italic().FontSize(7.5f).FontColor(Colors.Grey.Darken2);

                    col.Item().PaddingTop(6).LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten2);

                    // Contract Title
                    col.Item().PaddingTop(10).AlignCenter().Text(t =>
                    {
                        t.Span("CONTRACT FOR ").Bold().FontSize(11.5f);
                        t.Span(projectTitle.ToUpperInvariant()).Bold().FontSize(11.5f);
                    });

                    col.Item().PaddingTop(2).AlignCenter()
                        .Text($"Contract Reference No. {request.ContractNumber}")
                        .Bold().FontSize(9.5f).FontColor(Colors.Grey.Darken3);

                    // Preamble & Parties
                    col.Item().PaddingTop(10).Text(t =>
                    {
                        t.Justify();
                        t.Span($"    This CONTRACT executed on the ");
                        t.Span($"{dayOrdinal} day of {monthName}, {year}").Bold();
                        t.Span(" by and between:");
                    });

                    col.Item().PaddingTop(6).Text(t =>
                    {
                        t.Justify();
                        t.Span("    ");
                        if (!string.IsNullOrWhiteSpace(entityName))
                        {
                            t.Span(entityName).Bold();
                            t.Span(", a government agency of the Republic of the Philippines");
                            if (!string.IsNullOrWhiteSpace(entityAddress))
                            {
                                t.Span($", with principal office at {entityAddress}");
                            }
                            t.Span(", hereinafter called ");
                        }
                        else
                        {
                            t.Span("The Procuring Entity, a government agency of the Republic of the Philippines");
                            if (!string.IsNullOrWhiteSpace(entityAddress))
                            {
                                t.Span($", with principal office at {entityAddress}");
                            }
                            t.Span(", hereinafter called ");
                        }
                        t.Span("\"the Entity\";").Bold();
                    });

                    col.Item().PaddingTop(4).AlignCenter().Text("-and-").Bold();

                    col.Item().PaddingTop(4).Text(t =>
                    {
                        t.Justify();
                        t.Span("    ");
                        t.Span(supplierName).Bold();
                        t.Span(", a company duly organized and existing under the laws of the Republic of the Philippines, with principal office at ");
                        t.Span(supplierAddress);
                        t.Span(", hereinafter called ");
                        t.Span("\"the Supplier/Contractor/Consultant\".");
                    });

                    // Recitals
                    col.Item().PaddingTop(8).Text(t =>
                    {
                        t.Justify();
                        t.Span("    WHEREAS, the Entity invited Bids for certain goods and services/works/consulting services, particularly ");
                        t.Span(projectTitle).Bold();
                        t.Span(";");
                    });

                    col.Item().PaddingTop(6).Text(t =>
                    {
                        t.Justify();
                        t.Span("    WHEREAS, the Supplier/Contractor/Consultant submitted a responsive bid and was awarded the contract for the procurement in the total amount of ");
                        t.Span(request.AmountInWords).Bold();
                        t.Span(", hereinafter referred to as the \"Contract Price.\"");
                    });

                    col.Item().PaddingTop(8).Text("    NOW, THEREFORE, for and in consideration of the foregoing premises, the parties hereby agree as follows:").Bold();

                    // Covenants
                    col.Item().PaddingTop(6).Text(t =>
                    {
                        t.Justify();
                        t.Span("1. Unless otherwise stated, terms and expressions used in this Contract shall have the same meanings as those assigned to them in the Conditions of Contract, which form an integral part of this Contract.");
                    });

                    col.Item().PaddingTop(6).Text(t =>
                    {
                        t.Justify();
                        t.Span("2. The following documents as required by the Implementing Rules and Regulations of Republic Act No. 12009 shall form part and be read and construed as integral parts of this Contract, viz.:");
                    });

                    col.Item().PaddingLeft(14).PaddingTop(4).Column(pbd =>
                    {
                        pbd.Item().Text("a. Philippine Bidding Documents (PBD):").Bold();
                        pbd.Item().PaddingLeft(10).Text("• For Procurement of Goods / Services:");
                        pbd.Item().PaddingLeft(20).Text("i. Invitation to Bid;");
                        pbd.Item().PaddingLeft(20).Text("ii. Instruction to Bidders;");
                        pbd.Item().PaddingLeft(20).Text("iii. Bid Form, including all documents/statements contained in the Bidder's bidding envelopes, as annexes, and all other documents submitted, including corrections to the bid, if any, resulting from the Procuring Entity's bid evaluation;");
                        pbd.Item().PaddingLeft(20).Text("iv. Bid Data Sheet;");
                        pbd.Item().PaddingLeft(20).Text("v. Schedule of Requirements;");
                        pbd.Item().PaddingLeft(20).Text("vi. Technical Specifications;");
                        pbd.Item().PaddingLeft(20).Text("vii. General and Special Conditions of Contract;");
                        pbd.Item().PaddingLeft(20).Text("viii. Supplemental Bid Bulletins, if any; and");
                        pbd.Item().PaddingLeft(20).Text("ix. Other contract documents that may be required by existing laws and/or the Entity.");

                        pbd.Item().PaddingTop(4).Text("b. Winning bidder's bid, including the Eligibility Requirements, Technical and Financial Proposals, and all other documents or statements submitted;");
                        pbd.Item().PaddingTop(2).Text("c. Performance Security;");
                        pbd.Item().PaddingTop(2).Text($"d. Notice of Award of Contract ({(!string.IsNullOrWhiteSpace(request.NOANumber) ? request.NOANumber : "NOA")}); and the Bidder's Conforme thereto; and");
                        pbd.Item().PaddingTop(2).Text("e. Other contract documents that may be required by existing laws and/or the Procuring Entity concerned in the PBD, such as but not limited to the Notice to Proceed and Warranty Security.");
                    });

                    col.Item().PaddingTop(6).Text(t =>
                    {
                        t.Justify();
                        t.Span("3. In consideration of the Contract Price of ");
                        t.Span(request.AmountInWords).Bold();
                        t.Span(", or such other sums as may be determined in accordance with the terms of the Contract, the Supplier/Contractor/Consultant agrees to deliver and perform the items and related services for the ");
                        t.Span(projectTitle);
                        t.Span(" described herein in accordance with the terms and conditions specified in the Contract and its annexed documents.");
                    });

                    col.Item().PaddingTop(6).Text(t =>
                    {
                        t.Justify();
                        t.Span($"4. The {entityName} agrees to pay the above-mentioned sum to the Supplier/Contractor/Consultant in accordance with the schedule and manner provided in the Bidding Documents and its annexes.");
                    });

                    col.Item().PaddingTop(6).Text(t =>
                    {
                        t.Justify();
                        t.Span("5. Any dispute, difference, or claim arising out of or relating to this Contract, including its existence, validity, interpretation, breach, or termination thereof, may be submitted to arbitration or other form of alternative dispute resolution in accordance with the applicable law, such as Republic Act No. 9285 (Alternative Dispute Resolution Act of 2004) or Executive Order No. 1008, series 1985 (Construction Industry Arbitration Law).");
                    });

                    // Execution Clause
                    col.Item().PaddingTop(12).Text(t =>
                    {
                        t.Justify();
                        t.Span("    IN WITNESS WHEREOF, the parties hereto have caused this Contract to be executed in accordance with the laws of the Republic of the Philippines on the day and year first above written.");
                    });

                    // Signatures Grid
                    col.Item().PaddingTop(16).Row(row =>
                    {
                        row.RelativeItem().Column(entitySig =>
                        {
                            entitySig.Item().Text("For the Procuring Entity:").Bold();
                            entitySig.Item().PaddingTop(2).Text("Head of the Procuring Entity or Duly Authorized Representative").FontSize(8.5f).FontColor(Colors.Grey.Darken2);
                            if (!string.IsNullOrWhiteSpace(approvedBy))
                            {
                                entitySig.Item().PaddingTop(28).Text(approvedBy.ToUpperInvariant()).Bold();
                                entitySig.Item().Text(approvedPosition).FontSize(8.5f);
                            }
                            else
                            {
                                entitySig.Item().PaddingTop(42).LineHorizontal(0.5f).LineColor(Colors.Black);
                                entitySig.Item().PaddingTop(2).Text(!string.IsNullOrWhiteSpace(approvedPosition) ? approvedPosition : "Head of the Procuring Entity").FontSize(8.5f);
                            }
                            entitySig.Item().Text($"Date: {contractDate:MMMM dd, yyyy}").FontSize(8.5f);
                        });

                        row.RelativeItem().Column(supplierSig =>
                        {
                            supplierSig.Item().Text("For the Bidder / Supplier:").Bold();
                            supplierSig.Item().PaddingTop(2).Text($"Duly authorized to sign the Contract for and behalf of {supplierName}:").FontSize(8.5f).FontColor(Colors.Grey.Darken2);
                            supplierSig.Item().PaddingTop(28).Text(contactPerson.ToUpperInvariant()).Bold();
                            supplierSig.Item().Text("Authorized Representative").FontSize(8.5f);
                            supplierSig.Item().Text($"Date: {contractDate:MMMM dd, yyyy}").FontSize(8.5f);
                        });
                    });

                    // Witnesses
                    col.Item().PaddingTop(16).Column(wit =>
                    {
                        wit.Item().Text("Signed in the presence of:").Italic().FontSize(8.5f);
                        wit.Item().PaddingTop(10).Row(wRow =>
                        {
                            wRow.RelativeItem().Column(w1 =>
                            {
                                w1.Item().MaxWidth(180).BorderBottom(0.5f).BorderColor(Colors.Black).Text("");
                                w1.Item().PaddingTop(2).Text("Witness – Procuring Entity").FontSize(8f);
                            });

                            wRow.RelativeItem().Column(w2 =>
                            {
                                w2.Item().MaxWidth(180).BorderBottom(0.5f).BorderColor(Colors.Black).Text("");
                                w2.Item().PaddingTop(2).Text("Witness – Supplier").FontSize(8f);
                            });
                        });
                    });

                    // Notarial Acknowledgment
                    col.Item().PaddingTop(20).Column(ack =>
                    {
                        ack.Item().AlignCenter().Text("ACKNOWLEDGMENT").Bold().FontSize(10f);
                        ack.Item().PaddingTop(4).Text("REPUBLIC OF THE PHILIPPINES   )");
                        ack.Item().Text("_____________________________ ) S.S.");

                        ack.Item().PaddingTop(6).Text(t =>
                        {
                            t.Justify();
                            t.Span("    BEFORE ME, A Notary Public for and in __________________________________, this ______ day of ___________________, 20______, personally appeared the above-named persons who have satisfactorily proven to me their identity, through their identifying documents written below their names and signatures, that they are the same persons who executed and voluntarily signed the foregoing instrument consisting of pages, including this page where this Acknowledgment is written, which they acknowledged before me as their free and voluntary act and deed.");
                        });

                        ack.Item().PaddingTop(8).Text("    WITNESS MY HAND AND SEAL this _____ day of ___________________, 20______.");

                        ack.Item().PaddingTop(14).Row(notaryRow =>
                        {
                            notaryRow.RelativeItem().Column(leftNotary =>
                            {
                                leftNotary.Item().Text("Doc. No.   _______");
                                leftNotary.Item().Text("Page No.   _______");
                                leftNotary.Item().Text("Book No.   _______");
                                leftNotary.Item().Text($"Series of  {year}");
                            });

                            notaryRow.RelativeItem().Column(rightNotary =>
                            {
                                rightNotary.Item().Text("NAME OF NOTARY PUBLIC").Bold();
                                rightNotary.Item().Text("Notarial Commission No. __________________");
                                rightNotary.Item().Text("Notary Public for until December 31, ______");
                                rightNotary.Item().Text("Roll of Attorneys No. ___________________");
                                rightNotary.Item().Text("PTR No. _________________________________");
                                rightNotary.Item().Text("IBP No. _________________________________");
                            });
                        });
                    });

                    // ── Annex \"A\": Schedule of Awarded Line Items ──────────────
                    if (request.LineItems != null && request.LineItems.Any())
                    {
                        col.Item().PageBreak();

                        col.Item().AlignCenter().Text("ANNEX \"A\"").Bold().FontSize(11f);
                        col.Item().PaddingTop(2).AlignCenter()
                            .Text("SCHEDULE OF REQUIREMENTS AND AWARDED LINE ITEMS")
                            .Bold().FontSize(10f);
                        col.Item().PaddingTop(2).AlignCenter()
                            .Text($"Attached to and forming part of Contract No. {request.ContractNumber}")
                            .FontSize(8.5f).FontColor(Colors.Grey.Darken2);

                        col.Item().PaddingTop(10).Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(24);          // #
                                columns.RelativeColumn(3.5f);        // Item & Description
                                columns.RelativeColumn(1.8f);        // Category
                                columns.RelativeColumn(1.0f);        // Qty
                                columns.RelativeColumn(1.2f);        // Unit
                                columns.RelativeColumn(2.0f);        // Unit Price
                                columns.RelativeColumn(2.2f);        // Total Amount
                            });

                            // Table Header
                            table.Header(header =>
                            {
                                header.Cell().Border(0.5f).BorderColor(Colors.Grey.Medium).Background(Colors.Grey.Lighten3).Padding(4).AlignCenter().AlignMiddle().Text("#").Bold().FontSize(8f);
                                header.Cell().Border(0.5f).BorderColor(Colors.Grey.Medium).Background(Colors.Grey.Lighten3).Padding(4).AlignCenter().AlignMiddle().Text("Item Name & Specifications").Bold().FontSize(8f);
                                header.Cell().Border(0.5f).BorderColor(Colors.Grey.Medium).Background(Colors.Grey.Lighten3).Padding(4).AlignCenter().AlignMiddle().Text("Category").Bold().FontSize(8f);
                                header.Cell().Border(0.5f).BorderColor(Colors.Grey.Medium).Background(Colors.Grey.Lighten3).Padding(4).AlignCenter().AlignMiddle().Text("Qty").Bold().FontSize(8f);
                                header.Cell().Border(0.5f).BorderColor(Colors.Grey.Medium).Background(Colors.Grey.Lighten3).Padding(4).AlignCenter().AlignMiddle().Text("Unit").Bold().FontSize(8f);
                                header.Cell().Border(0.5f).BorderColor(Colors.Grey.Medium).Background(Colors.Grey.Lighten3).Padding(4).AlignCenter().AlignMiddle().Text("Unit Price").Bold().FontSize(8f);
                                header.Cell().Border(0.5f).BorderColor(Colors.Grey.Medium).Background(Colors.Grey.Lighten3).Padding(4).AlignCenter().AlignMiddle().Text("Total Amount").Bold().FontSize(8f);
                            });

                            // Rows
                            foreach (var item in request.LineItems)
                            {
                                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Medium).Padding(4).AlignCenter().AlignMiddle().Text(item.ItemNumber.ToString()).FontSize(8f);
                                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Medium).Padding(4).AlignLeft().AlignMiddle().Column(desc =>
                                {
                                    desc.Item().Text(item.ItemName).Bold().FontSize(8f);
                                    if (!string.IsNullOrWhiteSpace(item.Specifications) && item.Specifications != item.ItemName)
                                    {
                                        desc.Item().Text(item.Specifications).FontSize(7.5f).FontColor(Colors.Grey.Darken2);
                                    }
                                });
                                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Medium).Padding(4).AlignCenter().AlignMiddle().Text(item.Category ?? "Goods").FontSize(8f);
                                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Medium).Padding(4).AlignCenter().AlignMiddle().Text(item.Quantity.ToString("N0")).FontSize(8f);
                                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Medium).Padding(4).AlignCenter().AlignMiddle().Text(item.UnitOfMeasure ?? "lot").FontSize(8f);
                                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Medium).Padding(4).AlignRight().AlignMiddle().Text($"Php {item.UnitPrice:N2}").FontSize(8f);
                                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Medium).Padding(4).AlignRight().AlignMiddle().Text($"Php {item.TotalAmount:N2}").Bold().FontSize(8f);
                            }

                            // Grand Total Row
                            table.Cell().ColumnSpan(5).Border(0.5f).BorderColor(Colors.Grey.Medium).Background(Colors.Grey.Lighten4).Padding(5).AlignRight().AlignMiddle().Text("TOTAL CONTRACT PRICE:").Bold().FontSize(8.5f);
                            table.Cell().ColumnSpan(2).Border(0.5f).BorderColor(Colors.Grey.Medium).Background(Colors.Grey.Lighten4).Padding(5).AlignRight().AlignMiddle().Text($"Php {request.ContractPrice:N2}").Bold().FontSize(9f);
                        });
                    }
                });

                // ── 3. Page Footer ───────────────────────────────────────────
                page.Footer().Row(footer =>
                {
                    footer.RelativeItem().AlignLeft()
                        .Text("Standard Form: SF-GOOD-66 | Contract Agreement (RA 12009 NGPA Compliant)")
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

    private static string GetOrdinal(int number)
    {
        if (number <= 0) return number.ToString();
        switch (number % 100)
        {
            case 11:
            case 12:
            case 13:
                return $"{number}th";
        }
        switch (number % 10)
        {
            case 1:
                return $"{number}st";
            case 2:
                return $"{number}nd";
            case 3:
                return $"{number}rd";
            default:
                return $"{number}th";
        }
    }
}