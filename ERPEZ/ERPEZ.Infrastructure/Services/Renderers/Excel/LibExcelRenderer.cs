using ClosedXML.Excel;
using ERPEZ.Application.Common.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Services.DocumentGeneration;
using ERPEZ.Infrastructure.Services.Renderers.Excel.Base;

namespace ERPEZ.Infrastructure.Services.Renderers.Excel;

internal sealed class LibExcelRenderer : BaseExcelRenderer, IDocumentRenderer<LibDataDto>
{
	public DocumentType DocumentType => DocumentType.Lib;
	public ExportFormat Format => ExportFormat.Excel;

	public Task<byte[]> RenderAsync(
		LibDataDto request,
		CancellationToken cancellationToken = default)
	{
		using var workbook = new XLWorkbook();
		var sheet = workbook.Worksheets.Add("LIB");

		var currentRow = 1;
		RenderHeader(sheet, request, ref currentRow);

		if (IsActivityScope(request))
		{
			RenderActivitySectionI(sheet, request, ref currentRow);
			currentRow += 2;
			RenderActivitySectionII(sheet, request, ref currentRow);
		}
		else
		{
			RenderLegacySectionI(sheet, request, ref currentRow);
			currentRow += 2;
			RenderLegacySectionII(sheet, request, ref currentRow);
		}

		currentRow += 2;
		RenderSectionIII(sheet, request, ref currentRow);
		currentRow += 2;
		RenderSectionIV(sheet, request, ref currentRow);
		currentRow += 2;
		RenderSectionV(sheet, request, ref currentRow);

		sheet.Columns().AdjustToContents();
		using var ms = new MemoryStream();
		workbook.SaveAs(ms);
		return Task.FromResult(ms.ToArray());
	}

	private static bool IsActivityScope(LibDataDto request) =>
		string.Equals(request.Scope, "ActivityLevel", StringComparison.OrdinalIgnoreCase);

	private static void RenderHeader(IXLWorksheet sheet, LibDataDto request, ref int row)
	{
		sheet.Cell(row, 1).Value = "LINE ITEM BUDGET FORM";
		sheet.Cell(row, 1).Style.Font.Bold = true;
		sheet.Cell(row, 1).Style.Font.FontSize = 12;

		row++;
		sheet.Cell(row, 1).Value = $"FOR FISCAL YEAR {request.FiscalYear}";
		sheet.Cell(row, 1).Style.Font.Bold = true;

		row += 2;
		sheet.Cell(row, 1).Value = "AGENCY:";
		sheet.Cell(row, 1).Style.Font.Bold = true;
		sheet.Cell(row, 2).Value = request.OfficeName;
		sheet.Cell(row, 2).Style.Font.Bold = true;
		row += 2;
	}

	private static void RenderActivitySectionI(IXLWorksheet sheet, LibDataDto request, ref int row)
	{
		sheet.Cell(row, 1).Value = $"I. LINE ITEM BUDGET BY API {request.FiscalYear}";
		sheet.Cell(row, 1).Style.Font.Bold = true;
		row++;
		sheet.Cell(row, 1).Value = $"FUNDSOURCE: {request.FundSource}";
		sheet.Cell(row, 1).Style.Font.Bold = true;
		row += 2;

		foreach (var group in request.ApiGroups)
		{
			WriteMeta(sheet, ref row, "NEP/GAA:", group.NepGaaLabel);
			WriteMeta(sheet, ref row, "PREXC/DYNAMIC/KRA:", group.PrexcDynamicKra);
			WriteMeta(sheet, ref row, "GOALS/OUTCOME:", group.GoalsOutcome);
			WriteMeta(sheet, ref row, "API:", group.ApiLabel);

			WriteRow(sheet, row++, true, "ITEM OF EXPENDITURE", "UACS", "1", "2", "3", "4", "TOTAL");

			foreach (var expenseGroup in group.ExpenseGroups)
			{
				sheet.Cell(row, 1).Value = expenseGroup.ExpenseClassName;
				sheet.Cell(row, 1).Style.Font.Bold = true;
				row++;

				foreach (var item in expenseGroup.Rows)
				{
					WriteRow(
						sheet,
						row++,
						false,
						item.ObjectName,
						item.UACSCode,
						FormatAmount(item.Q1Budget),
						FormatAmount(item.Q2Budget),
						FormatAmount(item.Q3Budget),
						FormatAmount(item.Q4Budget),
						FormatAmount(item.TotalBudget));
				}

				WriteRow(
					sheet,
					row++,
					$"Sub-total, {expenseGroup.ExpenseClassType}",
					string.Empty,
					string.Empty,
					string.Empty,
					string.Empty,
					string.Empty,
					FormatAmount(expenseGroup.SubTotal));
			}

			WriteRow(
				sheet,
				row++,
				true,
				"Sub-total, API",
				string.Empty,
				string.Empty,
				string.Empty,
				string.Empty,
				string.Empty,
				FormatAmount(group.SubTotal));

			row++;
		}

		WriteRow(
			sheet,
			row++,
			"GRAND TOTAL",
			string.Empty,
			string.Empty,
			string.Empty,
			string.Empty,
			string.Empty,
			FormatAmount(request.TotalBudget));
	}

	private static void RenderLegacySectionI(IXLWorksheet sheet, LibDataDto request, ref int row)
	{
		sheet.Cell(row, 1).Value = $"I. LINE ITEM BUDGET BY API {request.FiscalYear}";
		sheet.Cell(row, 1).Style.Font.Bold = true;
		row++;
		sheet.Cell(row, 1).Value = $"FUNDSOURCE: {request.FundSource}";
		row += 2;

		WriteRow(sheet, row++, true, "UACS Code", "Item of Expenditure", "Description", "Q1", "Q2", "Q3", "Q4", "TOTAL");

		foreach (var group in request.ApiGroups)
		{
			sheet.Cell(row, 1).Value = group.ActivityName;
			sheet.Cell(row, 1).Style.Font.Bold = true;
			row++;

			foreach (var expenseGroup in group.ExpenseGroups)
			{
				sheet.Cell(row, 1).Value = expenseGroup.ExpenseClassName;
				sheet.Cell(row, 1).Style.Font.Bold = true;
				row++;

				foreach (var item in expenseGroup.Rows)
				{
					WriteRow(
						sheet,
						row++,
						false,
						item.UACSCode,
						item.ObjectName,
						item.Description ?? string.Empty,
						FormatAmount(item.Q1Budget),
						FormatAmount(item.Q2Budget),
						FormatAmount(item.Q3Budget),
						FormatAmount(item.Q4Budget),
						FormatAmount(item.TotalBudget));
				}
			}
		}

		WriteRow(
			sheet,
			row++,
			true,
			"GRAND TOTAL",
			string.Empty,
			string.Empty,
			string.Empty,
			string.Empty,
			string.Empty,
			string.Empty,
			FormatAmount(request.TotalBudget));
	}

	private static void RenderActivitySectionII(IXLWorksheet sheet, LibDataDto request, ref int row)
	{
		sheet.Cell(row, 1).Value = "II. LINE ITEM BUDGET BY TARGET";
		sheet.Cell(row, 1).Style.Font.Bold = true;
		row++;
		sheet.Cell(row, 1).Value = $"FUNDSOURCE: {request.FundSource}";
		row += 2;

		foreach (var target in request.TargetGroups)
		{
			WriteMeta(sheet, ref row, "NEP/GAA:", target.NepGaaLabel);
			WriteMeta(sheet, ref row, "PREXC/DYNAMIC/KRA:", target.PrexcDynamicKra);
			WriteMeta(sheet, ref row, "GOALS/OUTCOME:", target.GoalsOutcome);
			WriteMeta(sheet, ref row, "KPI:", target.KpiLabel);

			if (target.Targets.Count > 0)
			{
				sheet.Cell(row, 1).Value = "TARGETS";
				sheet.Cell(row, 1).Style.Font.Bold = true;
				row++;

				foreach (var targetLine in target.Targets)
				{
					sheet.Cell(row, 1).Value = targetLine;
					row++;
				}
			}

			WriteRow(
				sheet,
				row++,
				"OBJECTS OF EXPENDITURE",
				"UACS",
				"JAN",
				"FEB",
				"MAR",
				"APR",
				"MAY",
				"JUN",
				"JUL",
				"AUG",
				"SEP",
				"OCT",
				"NOV",
				"DEC",
				"TOTAL");

			foreach (var expenseGroup in target.ExpenseGroups)
			{
				sheet.Cell(row, 1).Value = $"{expenseGroup.ExpenseClassName} - {expenseGroup.ExpenseClassType}";
				sheet.Cell(row, 1).Style.Font.Bold = true;
				row++;

				foreach (var detail in expenseGroup.Rows)
				{
					WriteRow(
						sheet,
						row++,
						false,
						detail.ObjectName,
						detail.UACSCode,
						FormatAmount(detail.JanBudget),
						FormatAmount(detail.FebBudget),
						FormatAmount(detail.MarBudget),
						FormatAmount(detail.AprBudget),
						FormatAmount(detail.MayBudget),
						FormatAmount(detail.JunBudget),
						FormatAmount(detail.JulBudget),
						FormatAmount(detail.AugBudget),
						FormatAmount(detail.SepBudget),
						FormatAmount(detail.OctBudget),
						FormatAmount(detail.NovBudget),
						FormatAmount(detail.DecBudget),
						FormatAmount(detail.TotalBudget));
				}
			}

			WriteRow(sheet, row++, true, "TOTAL", string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, FormatAmount(target.SubTotal));
			row++;
		}

		WriteRow(sheet, row++, true, "GRAND TOTAL", string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, FormatAmount(request.TotalBudget));
	}

	private static void RenderLegacySectionII(IXLWorksheet sheet, LibDataDto request, ref int row)
	{
		sheet.Cell(row, 1).Value = "II. LINE ITEM BUDGET BY TARGET";
		sheet.Cell(row, 1).Style.Font.Bold = true;
		row += 2;

		WriteRow(sheet, row++, true, "UACS Code", "Item of Expenditure", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "TOTAL");

		foreach (var expenseGroup in request.MonthlyExpenseGroups)
		{
			sheet.Cell(row, 1).Value = expenseGroup.ExpenseClassName;
			sheet.Cell(row, 1).Style.Font.Bold = true;
			row++;

			foreach (var detail in expenseGroup.Rows)
			{
				WriteRow(
					sheet,
					row++,
					detail.UACSCode,
					detail.ObjectName,
					FormatAmount(detail.JanBudget),
					FormatAmount(detail.FebBudget),
					FormatAmount(detail.MarBudget),
					FormatAmount(detail.AprBudget),
					FormatAmount(detail.MayBudget),
					FormatAmount(detail.JunBudget),
					FormatAmount(detail.JulBudget),
					FormatAmount(detail.AugBudget),
					FormatAmount(detail.SepBudget),
					FormatAmount(detail.OctBudget),
					FormatAmount(detail.NovBudget),
					FormatAmount(detail.DecBudget),
					FormatAmount(detail.TotalBudget));
			}
		}
	}

	private static void RenderSectionIII(IXLWorksheet sheet, LibDataDto request, ref int row)
	{
		sheet.Cell(row, 1).Value = "III. SUMMARY BY ACCOUNT GROUP AND BY QUARTER";
		sheet.Cell(row, 1).Style.Font.Bold = true;
		row++;
		WriteRow(sheet, row++, true, "ACCOUNT GROUP", "Q1", "Q2", "Q3", "Q4", "TOTAL");

		foreach (var summary in request.AccountGroupSummaries)
		{
			sheet.Cell(row, 1).Value = summary.ExpenseClassType;
			sheet.Cell(row, 1).Style.Font.Bold = true;
			row++;

			foreach (var detail in summary.Rows)
			{
				WriteRow(
					sheet,
					row++,
					detail.AccountGroupName,
					FormatAmount(detail.Q1Budget),
					FormatAmount(detail.Q2Budget),
					FormatAmount(detail.Q3Budget),
					FormatAmount(detail.Q4Budget),
					FormatAmount(detail.TotalBudget));
			}
		}
	}

	private static void RenderSectionIV(IXLWorksheet sheet, LibDataDto request, ref int row)
	{
		sheet.Cell(row, 1).Value = "IV. SUMMARY BY QUARTER";
		sheet.Cell(row, 1).Style.Font.Bold = true;
		row++;
		WriteRow(sheet, row++, true, "ALLOTMENT CLASS", "Q1", "Q2", "Q3", "Q4", "TOTAL");

		foreach (var summary in request.QuarterSummaries)
		{
			WriteRow(
				sheet,
				row++,
				false,
				summary.AllotmentClass,
				FormatAmount(summary.Q1Budget),
				FormatAmount(summary.Q2Budget),
				FormatAmount(summary.Q3Budget),
				FormatAmount(summary.Q4Budget),
				FormatAmount(summary.TotalBudget));
		}
	}

	private static void RenderSectionV(IXLWorksheet sheet, LibDataDto request, ref int row)
	{
		if (request.FundSourceSummary is null)
			return;

		sheet.Cell(row, 1).Value = "V. SUMMARY BY FUNDSOURCE";
		sheet.Cell(row, 1).Style.Font.Bold = true;
		row++;

		WriteRow(
			sheet,
			row++,
			true,
			"ALLOTMENT CLASS",
			"ACCOUNT GROUP",
			request.FundSourceSummary.FundSource,
			"TOTAL");

		foreach (var item in request.FundSourceSummary.AccountGroups)
		{
			WriteRow(
				sheet,
				row++,
				false,
				item.AllotmentClass,
				item.AccountGroupName,
				FormatAmount(item.Amount),
				FormatAmount(item.Amount));
		}

		WriteRow(sheet, row++, true, "TOTAL", string.Empty, FormatAmount(request.FundSourceSummary.TotalBudget), FormatAmount(request.FundSourceSummary.TotalBudget));
	}

	private static void WriteMeta(IXLWorksheet sheet, ref int row, string label, string value)
	{
		sheet.Cell(row, 1).Value = label;
		sheet.Cell(row, 1).Style.Font.Bold = true;
		sheet.Cell(row, 2).Value = string.IsNullOrWhiteSpace(value) ? "-" : value;
		row++;
	}

	private static string FormatAmount(decimal amount) => amount.ToString("N2");

	private static void WriteRow(IXLWorksheet sheet, int row, params string[] values)
	{
		WriteRow(sheet, row, false, values);
	}

	private static void WriteRow(IXLWorksheet sheet, int row, bool bold, params string[] values)
	{
		for (var i = 0; i < values.Length; i++)
		{
			var cell = sheet.Cell(row, i + 1);
			cell.Value = values[i];
			cell.Style.Font.Bold = bold;
			cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
		}
	}
}
