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
using Microsoft.Extensions.DependencyInjection;
using ERPEZ.Infrastructure.Persistence;
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
        bool isAlreadyHandled = false;
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
                    if (isExcel && !isDryRun)
                    {
                        var dbContext = serviceProvider.GetRequiredService<ApplicationDbContext>();
                        using var excelStream = file.OpenReadStream();
                        var importedCount = await ERPEZ.Infrastructure.Persistence.Seeders.FundSourceSeeder.SeedFromExcelAsync(dbContext, excelStream, cancellationToken);
                        totalRows = importedCount;
                        for (int i = 0; i < importedCount; i++) validRecords.Add(new object());
                        isAlreadyHandled = true;
                    }
                    else
                    {
                        totalRows = await ProcessFundSourcesAsync(csv, validRecords, errors, cancellationToken);
                    }
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
        // totalRows from ProcessObjectsAsync counts only raw CSV rows, but for Objects we also
        // synthesise parent hierarchy nodes (Classification, Sub-Class, Group) that are added to
        // validRecords. Normalise so that failedRows = errors.Count (never negative).
        var effectiveTotalRows = successfulRows + errors.Count;
        var failedRows = errors.Count;

        if (!isDryRun && !isAlreadyHandled && validRecords.Count > 0)
        {
            await BatchInsertRecordsAsync(validRecords, cancellationToken);
        }

        await LogImportResultAsync(importId, file.FileName, effectiveTotalRows, successfulRows, failedRows, errors, importedBy, cancellationToken);

        return new UACSImportResultResponse
        {
            ImportId = importId,
            FileName = file.FileName,
            TotalRows = effectiveTotalRows,
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
                var code = csv.TryGetField<string>("Code", out var cVal) && !string.IsNullOrWhiteSpace(cVal)
                    ? cVal
                    : (csv.TryGetField<string>("UACS Code", out var uacsVal) && !string.IsNullOrWhiteSpace(uacsVal)
                        ? uacsVal
                        : (csv.TryGetField<string>("UACS", out var uacsShortVal) ? uacsShortVal : string.Empty));

                var name = csv.TryGetField<string>("Name", out var nVal) && !string.IsNullOrWhiteSpace(nVal)
                    ? nVal
                    : (csv.TryGetField<string>("Fund Sub-Category", out var subCatVal) && !string.IsNullOrWhiteSpace(subCatVal)
                        ? subCatVal
                        : (csv.TryGetField<string>("Fund Category", out var catVal) && !string.IsNullOrWhiteSpace(catVal)
                            ? catVal
                            : (csv.TryGetField<string>("Description", out var descVal) ? descVal : string.Empty)));

                var typeStr = csv.TryGetField<string>("Type", out var tVal) ? tVal : null;
                FundSourceTypeEnum type = FundSourceTypeEnum.FundSubCategory;

                if (!string.IsNullOrWhiteSpace(typeStr) && Enum.TryParse<FundSourceTypeEnum>(typeStr, true, out var parsedType))
                {
                    type = parsedType;
                }
                else
                {
                    var cleanCode = System.Text.RegularExpressions.Regex.Replace(code ?? string.Empty, @"[^\d]", "");
                    type = cleanCode.Length switch
                    {
                        2 => FundSourceTypeEnum.FundCluster,
                        3 => FundSourceTypeEnum.FinancingSource,
                        5 => FundSourceTypeEnum.AuthorizationCode,
                        _ => FundSourceTypeEnum.FundSubCategory
                    };
                }

                var record = new FundSource
                {
                    Code = code ?? string.Empty,
                    Name = name ?? string.Empty,
                    Type = type,
                    IsActive = true
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

        // --- Pass 1: read all raw rows into memory ---
        var rawRows = new List<(int Line, string Classification, string SubClass, string Group, string ObjectCodeName, string Uacs, bool IsActive)>();

        while (await csv.ReadAsync())
        {
            lineNumber++;
            totalRows++;

            try
            {
                var classification = csv.TryGetField<string>("Classification", out var clsVal) ? clsVal?.Trim() ?? string.Empty : string.Empty;
                var subClass      = csv.TryGetField<string>("Sub-Class",      out var scVal)  ? scVal?.Trim()  ?? string.Empty : string.Empty;
                var group         = csv.TryGetField<string>("Group",           out var grpVal) ? grpVal?.Trim() ?? string.Empty : string.Empty;
                var objectCodeName = string.Empty;
                if (csv.TryGetField<string>("Object Code", out var ocVal) && !string.IsNullOrWhiteSpace(ocVal))
                    objectCodeName = ocVal.Trim();
                else if (csv.TryGetField<string>("Name", out var nameVal) && !string.IsNullOrWhiteSpace(nameVal))
                    objectCodeName = nameVal.Trim();

                var uacs = string.Empty;
                if (csv.TryGetField<string>("UACS", out var uacsVal) && !string.IsNullOrWhiteSpace(uacsVal))
                    uacs = uacsVal.Trim();
                else if (csv.TryGetField<string>("UACS Code", out var uacsCodeVal) && !string.IsNullOrWhiteSpace(uacsCodeVal))
                    uacs = uacsCodeVal.Trim();
                else if (csv.TryGetField<string>("Code", out var codeVal) && !string.IsNullOrWhiteSpace(codeVal))
                    uacs = codeVal.Trim();

                var isActive = true;
                if (csv.TryGetField<string>("Status", out var statusStr) && !string.IsNullOrWhiteSpace(statusStr))
                    isActive = !statusStr.Equals("Inactive", StringComparison.OrdinalIgnoreCase);
                else if (csv.TryGetField<bool>("IsActive", out var activeBool))
                    isActive = activeBool;

                if (string.IsNullOrWhiteSpace(uacs))
                {
                    errors.Add(new ImportError { LineNumber = lineNumber, Message = "UACS code is required.", RawData = csv.Context.Parser?.RawRecord });
                    continue;
                }

                rawRows.Add((lineNumber, classification, subClass, group, objectCodeName, uacs, isActive));
            }
            catch (Exception ex)
            {
                errors.Add(new ImportError { LineNumber = lineNumber, Message = $"Failed to parse row: {ex.Message}", RawData = csv.Context.Parser?.RawRecord });
            }
        }

        // --- Pass 2: build hierarchy (Classification → Sub-Class → Group → Object Code) ---
        // Maps: unique label → pre-assigned Guid (for records not yet in DB)
        var classificationMap = new Dictionary<string, Guid>(StringComparer.OrdinalIgnoreCase);
        var subClassMap       = new Dictionary<string, Guid>(StringComparer.OrdinalIgnoreCase); // key: "cls|subClass"
        var groupMap          = new Dictionary<string, Guid>(StringComparer.OrdinalIgnoreCase); // key: "cls|subClass|group"

        foreach (var row in rawRows)
        {
            if (!string.IsNullOrWhiteSpace(row.Classification) && !classificationMap.ContainsKey(row.Classification))
                classificationMap[row.Classification] = Guid.NewGuid();

            var scKey = $"{row.Classification}|{row.SubClass}";
            if (!string.IsNullOrWhiteSpace(row.SubClass) && !subClassMap.ContainsKey(scKey))
                subClassMap[scKey] = Guid.NewGuid();

            var gKey = $"{row.Classification}|{row.SubClass}|{row.Group}";
            if (!string.IsNullOrWhiteSpace(row.Group) && !groupMap.ContainsKey(gKey))
                groupMap[gKey] = Guid.NewGuid();
        }

        // Emit Classification nodes (no parent)
        foreach (var kvp in classificationMap)
        {
            validRecords.Add(new ObjectEntity
            {
                Id       = kvp.Value,
                Code     = $"CLS:{kvp.Key}",   // synthetic code to avoid collision with UACS codes
                Name     = kvp.Key,
                IsActive = true,
                ParentId = null
            });
        }

        // Emit Sub-Class nodes
        foreach (var kvp in subClassMap)
        {
            var parts = kvp.Key.Split('|', 2);
            var cls   = parts[0];
            var sc    = parts.Length > 1 ? parts[1] : string.Empty;
            classificationMap.TryGetValue(cls, out var clsId);

            validRecords.Add(new ObjectEntity
            {
                Id       = kvp.Value,
                Code     = $"SC:{sc}",
                Name     = sc,
                IsActive = true,
                ParentId = clsId == Guid.Empty ? null : clsId
            });
        }

        // Emit Group nodes
        foreach (var kvp in groupMap)
        {
            var parts = kvp.Key.Split('|', 3);
            var cls   = parts[0];
            var sc    = parts.Length > 1 ? parts[1] : string.Empty;
            var grp   = parts.Length > 2 ? parts[2] : string.Empty;
            var scKey = $"{cls}|{sc}";
            subClassMap.TryGetValue(scKey, out var scId);

            validRecords.Add(new ObjectEntity
            {
                Id       = kvp.Value,
                Code     = $"GRP:{grp}",
                Name     = grp,
                IsActive = true,
                ParentId = scId == Guid.Empty ? null : scId
            });
        }

        // Emit leaf Object Code nodes
        foreach (var row in rawRows)
        {
            // Resolve the deepest available parent
            Guid? parentId = null;
            var gKey  = $"{row.Classification}|{row.SubClass}|{row.Group}";
            var scKey = $"{row.Classification}|{row.SubClass}";

            if (!string.IsNullOrWhiteSpace(row.Group) && groupMap.TryGetValue(gKey, out var gId))
                parentId = gId;
            else if (!string.IsNullOrWhiteSpace(row.SubClass) && subClassMap.TryGetValue(scKey, out var scId))
                parentId = scId;
            else if (!string.IsNullOrWhiteSpace(row.Classification) && classificationMap.TryGetValue(row.Classification, out var clsId))
                parentId = clsId;

            var leafName = !string.IsNullOrWhiteSpace(row.ObjectCodeName) ? row.ObjectCodeName
                           : !string.IsNullOrWhiteSpace(row.Group)         ? row.Group
                           : !string.IsNullOrWhiteSpace(row.SubClass)       ? row.SubClass
                           : row.Classification;

            var record = new ObjectEntity
            {
                Code     = row.Uacs,
                Name     = leafName,
                IsActive = row.IsActive,
                ParentId = parentId
            };

            var validationErrors = await ValidateRecordAsync(record, cancellationToken);
            if (validationErrors.Any())
            {
                errors.Add(new ImportError
                {
                    LineNumber = row.Line,
                    Message    = string.Join("; ", validationErrors),
                });
            }
            else
            {
                validRecords.Add(record);
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
                // Tracks code → DB id so child ParentIds can be resolved to real DB ids.
                var codeToDbId = new Dictionary<string, Guid>(StringComparer.OrdinalIgnoreCase);

                // Parents are emitted first, so iterate in order.
                foreach (var obj in objects)
                {
                    // Resolve in-memory ParentId to the real DB id (already persisted above).
                    if (obj.ParentId.HasValue)
                    {
                        var parentObj = objects.FirstOrDefault(o => o.Id == obj.ParentId.Value);
                        if (parentObj != null && codeToDbId.TryGetValue(parentObj.Code, out var resolvedParentId))
                        {
                            obj.ParentId = resolvedParentId;
                        }
                    }

                    // 1. Exact match on (ParentId, Code) — already correct, just track ID.
                    var exactMatch = await unitOfWork.ObjectRepository.FindAsync(
                        x => x.Code == obj.Code && x.ParentId == obj.ParentId, cancellationToken);
                    if (exactMatch != null)
                    {
                        codeToDbId[obj.Code] = exactMatch.Id;
                        continue;
                    }

                    // 2. Same code exists but with a null ParentId (old flat record) — migrate it.
                    var flatExisting = await unitOfWork.ObjectRepository.FindAsync(
                        x => x.Code == obj.Code && x.ParentId == null, cancellationToken);
                    if (flatExisting != null && obj.ParentId.HasValue)
                    {
                        flatExisting.ParentId = obj.ParentId;
                        unitOfWork.ObjectRepository.Update(flatExisting);
                        await unitOfWork.SaveChangesAsync(cancellationToken);
                        codeToDbId[obj.Code] = flatExisting.Id;
                        continue;
                    }

                    // 3. Same code exists with a different (non-null) ParentId — don't overwrite, just track.
                    if (flatExisting != null)
                    {
                        codeToDbId[obj.Code] = flatExisting.Id;
                        continue;
                    }

                    // 4. No record at all — insert fresh.
                    await unitOfWork.ObjectRepository.AddAsync(obj, cancellationToken);
                    await unitOfWork.SaveChangesAsync(cancellationToken);
                    codeToDbId[obj.Code] = obj.Id;
                }
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
