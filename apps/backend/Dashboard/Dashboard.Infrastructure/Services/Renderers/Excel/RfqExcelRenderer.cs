using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClosedXML.Excel;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Services.DocumentGeneration;
using ERPEZ.Infrastructure.Services.Renderers.Excel.Base;

namespace ERPEZ.Infrastructure.Services.Renderers.Excel;

internal sealed class RfqExcelRenderer
    : BaseExcelRenderer, IDocumentRenderer<RfqDataDto>
{
    public DocumentType DocumentType => DocumentType.Rfq;
    public ExportFormat Format => ExportFormat.Excel;

    public Task<byte[]> RenderAsync(
        RfqDataDto request,
        CancellationToken cancellationToken = default)
    {
        using var wb = new XLWorkbook();
        var ws = wb.Worksheets.Add("RFQ");

        var primarySupplier = request.Suppliers.FirstOrDefault() ?? new RfqSupplierDataDto();

        // ── Header Block ────────────────────────────────────────────────────────
        ws.Cell(1, 1).Value = request.ProcuringEntity.ToUpper();
        ws.Cell(1, 1).Style.Font.Bold = true;
        ws.Cell(1, 1).Style.Font.FontSize = 12;
        ws.Range(1, 1, 1, 8).Merge();
        ws.Cell(1, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

        if (!string.IsNullOrWhiteSpace(request.ProcuringEntityAddress))
        {
            ws.Cell(2, 1).Value = request.ProcuringEntityAddress;
            ws.Cell(2, 1).Style.Font.FontSize = 9;
            ws.Range(2, 1, 2, 8).Merge();
            ws.Cell(2, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        }

        ws.Cell(3, 1).Value = "REQUEST FOR QUOTATION (RFQ)";
        ws.Cell(3, 1).Style.Font.Bold = true;
        ws.Cell(3, 1).Style.Font.FontSize = 11;
        ws.Range(3, 1, 3, 8).Merge();
        ws.Cell(3, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

        // ── Metadata Info ───────────────────────────────────────────────────────
        int r = 5;
        ws.Cell(r, 1).Value = "RFQ No.:";
        ws.Cell(r, 1).Style.Font.Bold = true;
        ws.Cell(r, 2).Value = request.RFQNumber;
        ws.Cell(r, 5).Value = "Date:";
        ws.Cell(r, 5).Style.Font.Bold = true;
        ws.Cell(r, 6).Value = request.Date;

        r++;
        ws.Cell(r, 1).Value = "PR No.:";
        ws.Cell(r, 1).Style.Font.Bold = true;
        ws.Cell(r, 2).Value = request.PRNumber;
        ws.Cell(r, 5).Value = "Deadline:";
        ws.Cell(r, 5).Style.Font.Bold = true;
        ws.Cell(r, 6).Value = request.Deadline;

        r++;
        ws.Cell(r, 1).Value = "BAC Res. No.:";
        ws.Cell(r, 1).Style.Font.Bold = true;
        ws.Cell(r, 2).Value = !string.IsNullOrWhiteSpace(request.BacResolutionNumber) ? request.BacResolutionNumber : "N/A";
        ws.Cell(r, 5).Value = "Mode of Procurement:";
        ws.Cell(r, 5).Style.Font.Bold = true;
        ws.Cell(r, 6).Value = request.ModeOfProcurement;

        r++;
        ws.Cell(r, 1).Value = "Project Name:";
        ws.Cell(r, 1).Style.Font.Bold = true;
        ws.Cell(r, 2).Value = request.ProjectName;
        ws.Range(r, 2, r, 4).Merge();
        ws.Cell(r, 5).Value = "Approved Budget (ABC):";
        ws.Cell(r, 5).Style.Font.Bold = true;
        ws.Cell(r, 6).Value = request.ApprovedBudgetForContract;
        ws.Cell(r, 6).Style.NumberFormat.Format = "₱#,##0.00";

        // ── Supplier / Bidder Information ─────────────────────────────────────────
        r += 2;
        ws.Cell(r, 1).Value = "SUPPLIER / BIDDER INFORMATION";
        ws.Cell(r, 1).Style.Font.Bold = true;
        ws.Cell(r, 1).Style.Fill.BackgroundColor = XLColor.FromHtml("#EAEAEA");
        ws.Range(r, 1, r, 8).Merge();

        r++;
        ws.Cell(r, 1).Value = "Business / Trade Name:";
        ws.Cell(r, 1).Style.Font.Bold = true;
        ws.Cell(r, 2).Value = primarySupplier.SupplierName;
        ws.Range(r, 2, r, 4).Merge();

        ws.Cell(r, 5).Value = "TIN:";
        ws.Cell(r, 5).Style.Font.Bold = true;
        ws.Cell(r, 6).Value = primarySupplier.TINNumber;

        r++;
        ws.Cell(r, 1).Value = "Address:";
        ws.Cell(r, 1).Style.Font.Bold = true;
        ws.Cell(r, 2).Value = primarySupplier.Address;
        ws.Range(r, 2, r, 4).Merge();

        ws.Cell(r, 5).Value = "PhilGEPS Reg. No.:";
        ws.Cell(r, 5).Style.Font.Bold = true;
        ws.Cell(r, 6).Value = primarySupplier.PhilGEPSNumber;

        r++;
        ws.Cell(r, 1).Value = "Contact Person:";
        ws.Cell(r, 1).Style.Font.Bold = true;
        ws.Cell(r, 2).Value = primarySupplier.ContactPerson;

        ws.Cell(r, 3).Value = "Contact No.:";
        ws.Cell(r, 3).Style.Font.Bold = true;
        ws.Cell(r, 4).Value = primarySupplier.ContactNumber;

        ws.Cell(r, 5).Value = "Email Address:";
        ws.Cell(r, 5).Style.Font.Bold = true;
        ws.Cell(r, 6).Value = primarySupplier.Email;

        // ── Items Quotation Table ────────────────────────────────────────────────
        r += 2;
        int headerRow = r;
        StyleHeader(ws.Cell(headerRow, 1), "Item #");
        StyleHeader(ws.Cell(headerRow, 2), "Item Description & Technical Specifications");
        StyleHeader(ws.Cell(headerRow, 3), "Qty");
        StyleHeader(ws.Cell(headerRow, 4), "Unit");
        StyleHeader(ws.Cell(headerRow, 5), "Approved Unit Cost");
        StyleHeader(ws.Cell(headerRow, 6), "Approved Total ABC");
        StyleHeader(ws.Cell(headerRow, 7), "Brand / Model Offered");
        StyleHeader(ws.Cell(headerRow, 8), "Quoted Unit Price (PHP)");

        var items = primarySupplier.QuotedItems.Count > 0 ? primarySupplier.QuotedItems : request.Items;
        int dataStartRow = headerRow + 1;

        for (int i = 0; i < items.Count; i++)
        {
            var item = items[i];
            int currentRow = dataStartRow + i;

            StyleData(ws.Cell(currentRow, 1), item.ItemNo);
            ws.Cell(currentRow, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

            var desc = !string.IsNullOrWhiteSpace(item.Specifications) && item.Specifications != item.ItemName
                ? $"{item.ItemName}\n{item.Specifications}"
                : item.ItemName;
            StyleData(ws.Cell(currentRow, 2), desc);

            StyleData(ws.Cell(currentRow, 3), item.Quantity);
            ws.Cell(currentRow, 3).Style.NumberFormat.Format = "#,##0";
            ws.Cell(currentRow, 3).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;

            StyleData(ws.Cell(currentRow, 4), item.Unit);
            ws.Cell(currentRow, 4).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

            StyleData(ws.Cell(currentRow, 5), item.ApprovedUnitCost);
            ws.Cell(currentRow, 5).Style.NumberFormat.Format = "₱#,##0.00";
            ws.Cell(currentRow, 5).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;

            StyleData(ws.Cell(currentRow, 6), item.ApprovedTotalCost);
            ws.Cell(currentRow, 6).Style.NumberFormat.Format = "₱#,##0.00";
            ws.Cell(currentRow, 6).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;

            var offer = !string.IsNullOrWhiteSpace(item.OfferedBrand)
                ? $"{item.OfferedBrand} {item.OfferedModel}".Trim()
                : (item.OfferedSpecifications ?? string.Empty);
            StyleData(ws.Cell(currentRow, 7), offer);

            if (!request.IsBlankTemplate && item.QuotedUnitPrice.HasValue && item.QuotedUnitPrice.Value > 0)
            {
                StyleData(ws.Cell(currentRow, 8), item.QuotedUnitPrice.Value);
                ws.Cell(currentRow, 8).Style.NumberFormat.Format = "₱#,##0.00";
                ws.Cell(currentRow, 8).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
            }
            else
            {
                StyleData(ws.Cell(currentRow, 8), string.Empty);
            }
        }

        int lastDataRow = dataStartRow + items.Count - 1;
        int totalRow = lastDataRow + 1;

        ws.Cell(totalRow, 1).Value = "TOTAL";
        ws.Cell(totalRow, 1).Style.Font.Bold = true;
        ws.Range(totalRow, 1, totalRow, 5).Merge();
        ws.Cell(totalRow, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
        ws.Cell(totalRow, 1).Style.Fill.BackgroundColor = XLColor.FromHtml("#EAEAEA");
        ws.Cell(totalRow, 1).Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

        ws.Cell(totalRow, 6).FormulaA1 = $"=SUM(F{dataStartRow}:F{lastDataRow})";
        ws.Cell(totalRow, 6).Style.Font.Bold = true;
        ws.Cell(totalRow, 6).Style.NumberFormat.Format = "₱#,##0.00";
        ws.Cell(totalRow, 6).Style.Fill.BackgroundColor = XLColor.FromHtml("#EAEAEA");
        ws.Cell(totalRow, 6).Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

        ws.Cell(totalRow, 7).Style.Fill.BackgroundColor = XLColor.FromHtml("#EAEAEA");
        ws.Cell(totalRow, 7).Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        ws.Cell(totalRow, 8).Style.Fill.BackgroundColor = XLColor.FromHtml("#EAEAEA");
        ws.Cell(totalRow, 8).Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

        // ── Signatory Section ───────────────────────────────────────────────────
        int sigRow = totalRow + 2;
        ws.Cell(sigRow, 1).Value = "After having carefully read and accepted your General Conditions, I/We quote on the item at prices noted above.";
        ws.Cell(sigRow, 1).Style.Font.Italic = true;
        ws.Cell(sigRow, 1).Style.Font.FontSize = 8;
        ws.Range(sigRow, 1, sigRow, 8).Merge();

        sigRow += 2;
        ws.Cell(sigRow, 5).Value = "Printed Name / Signature:";
        ws.Cell(sigRow, 5).Style.Font.Bold = true;
        ws.Cell(sigRow, 6).Value = (!request.IsBlankTemplate && !string.IsNullOrWhiteSpace(request.SignatoryName)) ? request.SignatoryName : string.Empty;
        ws.Range(sigRow, 6, sigRow, 8).Merge();
        ws.Cell(sigRow, 6).Style.Border.BottomBorder = XLBorderStyleValues.Thin;

        sigRow++;
        ws.Cell(sigRow, 5).Value = "Date:";
        ws.Cell(sigRow, 5).Style.Font.Bold = true;
        var displayDate = (!request.IsBlankTemplate && !string.IsNullOrWhiteSpace(request.DateSigned)) ? request.DateSigned : string.Empty;
        ws.Cell(sigRow, 6).Value = displayDate;
        ws.Range(sigRow, 6, sigRow, 8).Merge();
        ws.Cell(sigRow, 6).Style.Border.BottomBorder = XLBorderStyleValues.Thin;

        ws.Column(1).Width = 8;
        ws.Column(2).Width = 40;
        ws.Column(3).Width = 8;
        ws.Column(4).Width = 10;
        ws.Column(5).Width = 20;
        ws.Column(6).Width = 20;
        ws.Column(7).Width = 25;
        ws.Column(8).Width = 22;

        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return Task.FromResult(ms.ToArray());
    }
}
