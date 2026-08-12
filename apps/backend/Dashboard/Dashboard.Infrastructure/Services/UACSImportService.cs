using System.Globalization;
using System.Text.Json;
using CsvHelper;
using CsvHelper.Configuration;
using ClosedXML.Excel;
using ERPEZ.Application.Features.Planning.UACSImport.Dtos;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using ObjectEntity = ERPEZ.Domain.Entities.Planning.Object;
using System.Text;

namespace ERPEZ.Infrastructure.Services;

/// <summary>
/// Service for importing UACS data from CSV files with validation and batch processing.
/// </summary>
public class UACSImportService : IUACSCsvImporter
{
    private readonly IUnitOfWork unitOfWork;
    private readonly IServiceProvider serviceProvider;

    public UACSImportService(IUnitOfWork unitOfWork, IServiceProvider serviceProvider)
    {
        this.unitOfWork = unitOfWork;
        this.serviceProvider = serviceProvider;
    }

    /// <inheritdoc/>
    public async Task<UACSImportResultResponse> ImportAsync(
        IFormFile file,
        UACSSegmentTypeEnum segmentType,
        bool isDryRun,
        string importedBy,
        CancellationToken cancellationToken = default)
    {
        var importId = Guid.NewGuid();
        var errors = new List<ImportError>();
        var validRecords = new List<object>();

        int totalRows;
        try
        {
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            var isExcel = extension is ".xlsx" or ".xls";

            using var stream = file.OpenReadStream();
            using var reader = isExcel
                ? CreateCsvTextReaderFromExcel(stream)
                : new StreamReader(stream);

            using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HasHeaderRecord = true,
                TrimOptions = TrimOptions.Trim,
                MissingFieldFound = null,
                BadDataFound = null
            });

            switch (segmentType)
            {
                case UACSSegmentTypeEnum.FundSource:
                    totalRows = await ProcessFundSourcesAsync(csv, validRecords, errors, cancellationToken);
                    break;
                case UACSSegmentTypeEnum.Organization:
                    totalRows = await ProcessOrganizationsAsync(csv, validRecords, errors, cancellationToken);
                    break;
                case UACSSegmentTypeEnum.Location:
                    totalRows = await ProcessLocationsAsync(csv, validRecords, errors, cancellationToken);
                    break;
                case UACSSegmentTypeEnum.MFOPAP:
                    totalRows = await ProcessMFOPAPsAsync(csv, validRecords, errors, cancellationToken);
                    break;
                case UACSSegmentTypeEnum.Object:
                    totalRows = await ProcessObjectsAsync(csv, validRecords, errors, cancellationToken);
                    break;
                default:
                    throw new ArgumentException($"Unsupported segment type: {segmentType}");
            }
        }
        catch (Exception ex)
        {
            totalRows = 0;
            errors.Add(new ImportError
            {
                LineNumber = 0,
                Message = $"Failed to read file: {ex.Message}"
            });
        }

        var successfulRows = validRecords.Count;
        var failedRows = totalRows - successfulRows;

        if (!isDryRun && validRecords.Count > 0)
        {
            await BatchInsertRecordsAsync(validRecords, cancellationToken);
        }

        await LogImportResultAsync(importId, file.FileName, totalRows, successfulRows, failedRows, errors, importedBy, cancellationToken);

        return new UACSImportResultResponse
        {
            ImportId = importId,
            FileName = file.FileName,
            TotalRows = totalRows,
            SuccessfulRows = successfulRows,
            FailedRows = failedRows,
            Errors = errors,
            IsDryRun = isDryRun,
            ImportedAt = DateTime.UtcNow
        };
    }

    private async Task<int> ProcessFundSourcesAsync(
        CsvReader csv,
        List<object> validRecords,
        List<ImportError> errors,
        CancellationToken cancellationToken)
    {
        var lineNumber = 1;
        var totalRows = 0;
        csv.Read();
        csv.ReadHeader();

        while (await csv.ReadAsync())
        {
            lineNumber++;
            totalRows++;

            try
            {
                var record = new FundSource
                {
                    Code = csv.GetField<string>("Code") ?? string.Empty,
                    Name = csv.GetField<string>("Name") ?? string.Empty,
                    Type = Enum.Parse<FundSourceTypeEnum>(csv.GetField<string>("Type") ?? "Other"),
                    IsActive = csv.GetField<bool>("IsActive")
                };

                var validationErrors = await ValidateRecordAsync(record, cancellationToken);
                if (validationErrors.Any())
                {
                    errors.Add(new ImportError
                    {
                        LineNumber = lineNumber,
                        Message = string.Join("; ", validationErrors),
                        RawData = csv.Context.Parser?.RawRecord
                    });
                }
                else
                {
                    validRecords.Add(record);
                }
            }
            catch (Exception ex)
            {
                errors.Add(new ImportError
                {
                    LineNumber = lineNumber,
                    Message = $"Failed to parse row: {ex.Message}",
                    RawData = csv.Context.Parser?.RawRecord
                });
            }
        }
        return totalRows;
    }

    private async Task<int> ProcessOrganizationsAsync(
        CsvReader csv,
        List<object> validRecords,
        List<ImportError> errors,
        CancellationToken cancellationToken)
    {
        var lineNumber = 1;
        var totalRows = 0;
        csv.Read();
        csv.ReadHeader();

        while (await csv.ReadAsync())
        {
            lineNumber++;
            totalRows++;

            try
            {
                var record = new Organization
                {
                    Code = csv.GetField<string>("Code") ?? string.Empty,
                    Name = csv.GetField<string>("Name") ?? string.Empty,
                    IsActive = csv.GetField<bool>("IsActive")
                };

                var validationErrors = await ValidateRecordAsync(record, cancellationToken);
                if (validationErrors.Any())
                {
                    errors.Add(new ImportError
                    {
                        LineNumber = lineNumber,
                        Message = string.Join("; ", validationErrors),
                        RawData = csv.Context.Parser?.RawRecord
                    });
                }
                else
                {
                    validRecords.Add(record);
                }
            }
            catch (Exception ex)
            {
                errors.Add(new ImportError
                {
                    LineNumber = lineNumber,
                    Message = $"Failed to parse row: {ex.Message}",
                    RawData = csv.Context.Parser?.RawRecord
                });
            }
        }
        return totalRows;
    }

    private async Task<int> ProcessLocationsAsync(
        CsvReader csv,
        List<object> validRecords,
        List<ImportError> errors,
        CancellationToken cancellationToken)
    {
        var lineNumber = 1;
        var totalRows = 0;
        csv.Read();
        csv.ReadHeader();

        while (await csv.ReadAsync())
        {
            lineNumber++;
            totalRows++;

            try
            {
                var record = new Location
                {
                    Code = csv.GetField<string>("Code") ?? string.Empty,
                    Name = csv.GetField<string>("Name") ?? string.Empty,
                    IsActive = csv.GetField<bool>("IsActive")
                };

                var validationErrors = await ValidateRecordAsync(record, cancellationToken);
                if (validationErrors.Any())
                {
                    errors.Add(new ImportError
                    {
                        LineNumber = lineNumber,
                        Message = string.Join("; ", validationErrors),
                        RawData = csv.Context.Parser?.RawRecord
                    });
                }
                else
                {
                    validRecords.Add(record);
                }
            }
            catch (Exception ex)
            {
                errors.Add(new ImportError
                {
                    LineNumber = lineNumber,
                    Message = $"Failed to parse row: {ex.Message}",
                    RawData = csv.Context.Parser?.RawRecord
                });
            }
        }
        return totalRows;
    }

    private async Task<int> ProcessMFOPAPsAsync(
        CsvReader csv,
        List<object> validRecords,
        List<ImportError> errors,
        CancellationToken cancellationToken)
    {
        var lineNumber = 1;
        var totalRows = 0;
        csv.Read();
        csv.ReadHeader();

        while (await csv.ReadAsync())
        {
            lineNumber++;
            totalRows++;

            try
            {
                var record = new MFOPAP
                {
                    Code = csv.GetField<string>("Code") ?? string.Empty,
                    Name = csv.GetField<string>("Name") ?? string.Empty,
                    IsActive = csv.GetField<bool>("IsActive")
                };

                var validationErrors = await ValidateRecordAsync(record, cancellationToken);
                if (validationErrors.Any())
                {
                    errors.Add(new ImportError
                    {
                        LineNumber = lineNumber,
                        Message = string.Join("; ", validationErrors),
                        RawData = csv.Context.Parser?.RawRecord
                    });
                }
                else
                {
                    validRecords.Add(record);
                }
            }
            catch (Exception ex)
            {
                errors.Add(new ImportError
                {
                    LineNumber = lineNumber,
                    Message = $"Failed to parse row: {ex.Message}",
                    RawData = csv.Context.Parser?.RawRecord
                });
            }
        }
        return totalRows;
    }

    private async Task<int> ProcessObjectsAsync(
        CsvReader csv,
        List<object> validRecords,
        List<ImportError> errors,
        CancellationToken cancellationToken)
    {
        var lineNumber = 1;
        var totalRows = 0;
        csv.Read();
        csv.ReadHeader();

        while (await csv.ReadAsync())
        {
            lineNumber++;
            totalRows++;

            try
            {
                var code = csv.TryGetField<string>("Code", out var cVal) && !string.IsNullOrWhiteSpace(cVal)
                    ? cVal
                    : (csv.TryGetField<string>("UACS", out var uacsVal) ? uacsVal : string.Empty);

                var name = csv.TryGetField<string>("Name", out var nVal) && !string.IsNullOrWhiteSpace(nVal)
                    ? nVal
                    : (csv.TryGetField<string>("Object Code", out var objCodeVal) && !string.IsNullOrWhiteSpace(objCodeVal)
                        ? objCodeVal
                        : (csv.TryGetField<string>("Group", out var grpVal) && !string.IsNullOrWhiteSpace(grpVal)
                            ? grpVal
                            : (csv.TryGetField<string>("Sub-Class", out var subClassVal) && !string.IsNullOrWhiteSpace(subClassVal)
                                ? subClassVal
                                : (csv.TryGetField<string>("Classification", out var classVal) ? classVal : string.Empty))));

                var isActive = true;
                if (csv.TryGetField<string>("Status", out var statusStr) && !string.IsNullOrWhiteSpace(statusStr))
                {
                    isActive = !statusStr.Equals("Inactive", StringComparison.OrdinalIgnoreCase);
                }
                else if (csv.TryGetField<bool>("IsActive", out var activeBool))
                {
                    isActive = activeBool;
                }

                if (string.IsNullOrWhiteSpace(code) || string.IsNullOrWhiteSpace(name))
                {
                    continue; // Skip header-only or blank code rows
                }

                var record = new ObjectEntity
                {
                    Code = code.Trim(),
                    Name = name.Trim(),
                    IsActive = isActive
                };

                var validationErrors = await ValidateRecordAsync(record, cancellationToken);
                if (validationErrors.Any())
                {
                    errors.Add(new ImportError
                    {
                        LineNumber = lineNumber,
                        Message = string.Join("; ", validationErrors),
                        RawData = csv.Context.Parser?.RawRecord
                    });
                }
                else
                {
                    validRecords.Add(record);
                }
            }
            catch (Exception ex)
            {
                errors.Add(new ImportError
                {
                    LineNumber = lineNumber,
                    Message = $"Failed to parse row: {ex.Message}",
                    RawData = csv.Context.Parser?.RawRecord
                });
            }
        }
        return totalRows;
    }

    private async Task<List<string>> ValidateRecordAsync<T>(T record, CancellationToken cancellationToken)
    {
        var errors = new List<string>();
        var validator = serviceProvider.GetService(typeof(IValidator<T>)) as IValidator<T>;

        if (validator == null)
        {
            return errors;
        }

        var validationResult = await validator.ValidateAsync(record, cancellationToken);
        if (!validationResult.IsValid)
        {
            errors.AddRange(validationResult.Errors.Select(e => e.ErrorMessage));
        }

        return errors;
    }

    private static TextReader CreateCsvTextReaderFromExcel(Stream fileStream)
    {
        // Convert the first worksheet of the Excel file into a CSV representation
        // so we can reuse the existing CsvHelper parsing and validation pipeline.
        var workbook = new XLWorkbook(fileStream);
        var worksheet = workbook.Worksheets.First();

        var lastRow = worksheet.LastRowUsed()?.RowNumber() ?? 0;
        if (lastRow < 1)
        {
            return new StringReader(string.Empty);
        }

        var headerCells = worksheet.Row(1).Cells().ToList();
        var headerCount = headerCells.Count;
        if (headerCount == 0)
        {
            throw new InvalidOperationException("Excel file is missing a header row.");
        }

        var stringBuilder = new StringBuilder();
        using (var stringWriter = new StringWriter(stringBuilder))
        using (var csvWriter = new CsvWriter(stringWriter, CultureInfo.InvariantCulture))
        {
            // Write header row
            foreach (var cell in headerCells)
            {
                csvWriter.WriteField(cell.GetString());
            }
            csvWriter.NextRecord();

            // Write data rows
            for (var rowNumber = 2; rowNumber <= lastRow; rowNumber++)
            {
                var row = worksheet.Row(rowNumber);
                var cells = row.Cells(1, headerCount).ToList();

                // Skip empty rows
                var isEmpty = cells.All(c => string.IsNullOrWhiteSpace(c.GetString()));
                if (isEmpty)
                {
                    continue;
                }

                foreach (var cell in cells)
                {
                    csvWriter.WriteField(cell.GetString());
                }
                csvWriter.NextRecord();
            }
        }

        return new StringReader(stringBuilder.ToString());
    }

    private async Task BatchInsertRecordsAsync(List<object> records, CancellationToken cancellationToken)
    {
        if (records.Count == 0) return;

        var firstRecord = records.First();
        var recordType = firstRecord.GetType();

        if (recordType == typeof(FundSource))
        {
            var fundSources = records.Cast<FundSource>().ToList();
            await unitOfWork.ExecuteInTransactionAsync(async () =>
            {
                foreach (var fundSource in fundSources)
                {
                    await unitOfWork.FundSourceRepository.AddAsync(fundSource, cancellationToken);
                }
                await unitOfWork.SaveChangesAsync(cancellationToken);
            }, cancellationToken);
        }
        else if (recordType == typeof(Organization))
        {
            var organizations = records.Cast<Organization>().ToList();
            await unitOfWork.ExecuteInTransactionAsync(async () =>
            {
                foreach (var organization in organizations)
                {
                    await unitOfWork.OrganizationRepository.AddAsync(organization, cancellationToken);
                }
                await unitOfWork.SaveChangesAsync(cancellationToken);
            }, cancellationToken);
        }
        else if (recordType == typeof(Location))
        {
            var locations = records.Cast<Location>().ToList();
            await unitOfWork.ExecuteInTransactionAsync(async () =>
            {
                foreach (var location in locations)
                {
                    await unitOfWork.LocationRepository.AddAsync(location, cancellationToken);
                }
                await unitOfWork.SaveChangesAsync(cancellationToken);
            }, cancellationToken);
        }
        else if (recordType == typeof(MFOPAP))
        {
            var mfopaps = records.Cast<MFOPAP>().ToList();
            await unitOfWork.ExecuteInTransactionAsync(async () =>
            {
                foreach (var mfopap in mfopaps)
                {
                    await unitOfWork.MFOPAPRepository.AddAsync(mfopap, cancellationToken);
                }
                await unitOfWork.SaveChangesAsync(cancellationToken);
            }, cancellationToken);
        }
        else if (recordType == typeof(ObjectEntity))
        {
            var objects = records.Cast<ObjectEntity>().ToList();
            await unitOfWork.ExecuteInTransactionAsync(async () =>
            {
                foreach (var obj in objects)
                {
                    var existing = await unitOfWork.ObjectRepository.FindAsync(x => x.Code == obj.Code, cancellationToken);
                    if (existing == null)
                    {
                        await unitOfWork.ObjectRepository.AddAsync(obj, cancellationToken);
                    }
                }
                await unitOfWork.SaveChangesAsync(cancellationToken);
            }, cancellationToken);
        }
    }

    private async Task LogImportResultAsync(
        Guid importId,
        string fileName,
        int totalRows,
        int successfulRows,
        int failedRows,
        List<ImportError> errors,
        string importedBy,
        CancellationToken cancellationToken)
    {
        var errorLogJson = JsonSerializer.Serialize(errors);

        var importLog = new UACSImportLog
        {
            ImportId = importId,
            FileName = fileName,
            TotalRows = totalRows,
            SuccessfulRows = successfulRows,
            FailedRows = failedRows,
            ErrorLog = errorLogJson,
            ImportedBy = importedBy,
            ImportedAt = DateTime.UtcNow
        };

        await unitOfWork.UACSImportLogRepository.AddAsync(importLog, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
