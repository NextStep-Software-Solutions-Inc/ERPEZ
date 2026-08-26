using ClosedXML.Excel;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.AspNetCore.Http;

namespace ERPEZ.Infrastructure.Services;

public class PositionImportService(IUnitOfWork unitOfWork) : IPositionImportService
{
    public async Task<PositionImportResult> ImportFromExcelAsync(IFormFile file, CancellationToken cancellationToken = default)
    {
        var errors = new List<string>();
        var positions = new List<Position>();
        var successCount = 0;
        var totalRows = 0;

        try
        {
            using var stream = file.OpenReadStream();
            using var workbook = new XLWorkbook(stream);
            var worksheet = workbook.Worksheet(1);

            // Expected headers: Title, FunctionalTitle, Code, JobDescription, Qualifications, FTE, OperationalStatus, PositionTypeCode, PlantillaTypeCode, SalaryGradeCode, StepCode, OfficeCode
            var headerRow = worksheet.Row(1);
            var headers = new Dictionary<string, int>();

            for (int col = 1; col <= headerRow.CellsUsed().Count(); col++)
            {
                var headerValue = headerRow.Cell(col).GetString().Trim();
                headers[headerValue] = col;
            }

            // Validate required headers
            var requiredHeaders = new[] { "Title", "Code", "OperationalStatus", "PositionTypeCode", "PlantillaTypeCode", "SalaryGradeCode", "StepCode", "OfficeCode" };
            var missingHeaders = requiredHeaders.Where(h => !headers.ContainsKey(h)).ToList();

            if (missingHeaders.Any())
            {
                errors.Add($"Missing required headers: {string.Join(", ", missingHeaders)}");
                return new PositionImportResult
                {
                    TotalRows = 0,
                    SuccessCount = 0,
                    FailureCount = 1,
                    Errors = errors
                };
            }

            // Process rows
            var rows = worksheet.RowsUsed().Skip(1); // Skip header
            totalRows = rows.Count();

            foreach (var row in rows)
            {
                var rowNumber = row.RowNumber();

                try
                {
                    var title = GetCellValue(row, headers, "Title");
                    var code = GetCellValue(row, headers, "Code");
                    var operationalStatus = GetCellValue(row, headers, "OperationalStatus");
                    var positionTypeCode = GetCellValue(row, headers, "PositionTypeCode");
                    var plantillaTypeCode = GetCellValue(row, headers, "PlantillaTypeCode");
                    var salaryGradeCode = GetCellValue(row, headers, "SalaryGradeCode");
                    var stepCode = GetCellValue(row, headers, "StepCode");
                    var officeCode = GetCellValue(row, headers, "OfficeCode");

                    // Validate operational status
                    var validStatuses = new[] { "Vacant", "Filled", "Abolished" };
                    if (!validStatuses.Contains(operationalStatus, StringComparer.OrdinalIgnoreCase))
                    {
                        errors.Add($"Row {rowNumber}: Invalid OperationalStatus '{operationalStatus}'. Must be one of: {string.Join(", ", validStatuses)}");
                        continue;
                    }

                    // Look up foreign keys
                    var positionType = await unitOfWork.PositionTypeRepository.FindAsync(
                        x => x.Code == positionTypeCode && x.IsActive,
                        cancellationToken);

                    if (positionType == null)
                    {
                        errors.Add($"Row {rowNumber}: PositionType with code '{positionTypeCode}' not found or inactive.");
                        continue;
                    }

                    var plantillaType = await unitOfWork.PlantillaTypeRepository.FindAsync(
                        x => x.Code == plantillaTypeCode && x.IsActive,
                        cancellationToken);

                    if (plantillaType == null)
                    {
                        errors.Add($"Row {rowNumber}: PlantillaType with code '{plantillaTypeCode}' not found or inactive.");
                        continue;
                    }

                    var salaryGrade = await unitOfWork.SalaryGradeRepository.FindAsync(
                        x => x.Code == salaryGradeCode && x.IsActive,
                        cancellationToken);

                    if (salaryGrade == null)
                    {
                        errors.Add($"Row {rowNumber}: SalaryGrade with code '{salaryGradeCode}' not found or inactive.");
                        continue;
                    }

                    var step = await unitOfWork.StepRepository.FindAsync(
                        x => x.Code == stepCode && x.IsActive,
                        cancellationToken);

                    if (step == null)
                    {
                        errors.Add($"Row {rowNumber}: Step with code '{stepCode}' not found or inactive.");
                        continue;
                    }

                    var office = await unitOfWork.OfficeRepository.FindAsync(
                        x => x.Code == officeCode && !x.IsDeleted,
                        cancellationToken);

                    if (office == null)
                    {
                        errors.Add($"Row {rowNumber}: Office with code '{officeCode}' not found or deleted.");
                        continue;
                    }

                    // Check for duplicate code
                    var existingPosition = await unitOfWork.PositionRepository.FindAsync(
                        x => x.Code == code && !x.IsDeleted,
                        cancellationToken);

                    if (existingPosition != null)
                    {
                        errors.Add($"Row {rowNumber}: Position with code '{code}' already exists.");
                        continue;
                    }

                    // Create position
                    var position = new Position
                    {
                        Id = Guid.NewGuid(),
                        Title = title,
                        FunctionalTitle = GetCellValue(row, headers, "FunctionalTitle", optional: true),
                        Code = code,
                        JobDescription = GetCellValue(row, headers, "JobDescription", optional: true),
                        Qualifications = GetCellValue(row, headers, "Qualifications", optional: true),
                        FTE = decimal.TryParse(GetCellValue(row, headers, "FTE", optional: true), out var fte) ? fte : 1.0m,
                        OperationalStatus = operationalStatus,
                        PositionTypeId = positionType.Id,
                        PlantillaTypeId = plantillaType.Id,
                        SalaryGradeId = salaryGrade.Id,
                        StepId = step.Id,
                        OfficeId = office.Id,
                        CreatedAt = DateTime.UtcNow
                    };

                    positions.Add(position);
                    successCount++;
                }
                catch (Exception ex)
                {
                    errors.Add($"Row {rowNumber}: {ex.Message}");
                }
            }

            // Bulk insert
            if (positions.Any())
            {
                foreach (var position in positions)
                {
                    await unitOfWork.PositionRepository.AddAsync(position, cancellationToken);
                }

                await unitOfWork.SaveChangesAsync(cancellationToken);
            }

            return new PositionImportResult
            {
                TotalRows = totalRows,
                SuccessCount = successCount,
                FailureCount = errors.Count,
                Errors = errors
            };
        }
        catch (Exception ex)
        {
            errors.Add($"Failed to process file: {ex.Message}");
            return new PositionImportResult
            {
                TotalRows = totalRows,
                SuccessCount = 0,
                FailureCount = 1,
                Errors = errors
            };
        }
    }

    private static string GetCellValue(IXLRow row, Dictionary<string, int> headers, string headerName, bool optional = false)
    {
        if (!headers.TryGetValue(headerName, out var colIndex))
        {
            if (optional) return string.Empty;
            throw new InvalidOperationException($"Header '{headerName}' not found.");
        }

        var value = row.Cell(colIndex).GetString().Trim();

        if (!optional && string.IsNullOrWhiteSpace(value))
        {
            throw new InvalidOperationException($"'{headerName}' is required.");
        }

        return value;
    }
}
