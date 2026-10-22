using ClosedXML.Excel;
using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace ERPEZ.Infrastructure.Persistence.Seeders;

/// <summary>
/// Seeder and Excel Importer for UACS Fund Source structures.
/// Parses 8-digit UACS codes into hierarchical FundSource entities:
/// Segment 1 (Digits 1-2): Fund Cluster
/// Segment 2 (Digit 3): Financing Source
/// Segment 3 (Digits 4-5): Authorization Code
/// Segment 4 (Digits 6-8): Fund Category / Sub-Category
/// </summary>
public static class FundSourceSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        await SeedDefaultAsync(context);
    }

    /// <summary>
    /// Reads an Excel (.xlsx / .xls) stream containing UACS Fund Source data and seeds the database.
    /// Expected columns:
    /// Col A: Fund Cluster
    /// Col B: Financing Source
    /// Col C: Authorization
    /// Col D: Fund Category
    /// Col E: Fund Sub-Category
    /// Col F: Description
    /// Col G: Department
    /// Col H: Agency
    /// Col I: UACS (8-digit code string)
    /// Col J: Status (Active / Inactive)
    /// </summary>
    public static async Task<int> SeedFromExcelAsync(ApplicationDbContext context, Stream excelStream, CancellationToken cancellationToken = default)
    {        using var workbook = new XLWorkbook(excelStream);
        var worksheet = workbook.Worksheets.FirstOrDefault() 
            ?? throw new InvalidOperationException("Excel workbook has no worksheets.");

        var lastRow = worksheet.LastRowUsed()?.RowNumber() ?? 0;
        if (lastRow <= 1)
        {
            return 0; // Empty or header-only
        }

        var importedCount = 0;
        var existingSources = await context.FundSources!
            .ToDictionaryAsync(fs => fs.Code, StringComparer.OrdinalIgnoreCase, cancellationToken);

        var existingOrgs = await context.Organizations!
            .ToDictionaryAsync(o => o.Name, StringComparer.OrdinalIgnoreCase, cancellationToken);

        var existingLinks = await context.OrganizationFundSources!
            .Select(l => new { l.OrganizationId, l.FundSourceId })
            .ToHashSetAsync(cancellationToken);

        for (int rowNum = 2; rowNum <= lastRow; rowNum++)
        {
            var row = worksheet.Row(rowNum);

            var fundClusterName   = GetCellValue(row, 1, "A"); // Fund Cluster
            var financingSrcName  = GetCellValue(row, 2, "B"); // Financing Source
            var authorizationName = GetCellValue(row, 3, "C"); // Authorization
            var fundCategoryName  = GetCellValue(row, 4, "D"); // Fund Category
            var fundSubCatName    = GetCellValue(row, 5, "E"); // Fund Sub-Category
            var description       = GetCellValue(row, 6, "F"); // Description
            var departmentName    = GetCellValue(row, 7, "G"); // Department
            var agencyName        = GetCellValue(row, 8, "H"); // Agency
            var uacsCodeRaw       = GetCellValue(row, 9, "I"); // UACS Code
            var statusRaw         = GetCellValue(row, 10, "J"); // Status

            // Clean UACS code to digits only
            var uacsCode = Regex.Replace(uacsCodeRaw, @"[^\d]", "");
            if (string.IsNullOrWhiteSpace(uacsCode) || uacsCode.Length < 2)
            {
                continue; // Skip invalid or empty row
            }

            // Standardize 8-digit padding if necessary
            if (uacsCode.Length < 8)
            {
                uacsCode = uacsCode.PadRight(8, '0');
            }

            bool isActive = !string.Equals(statusRaw, "Inactive", StringComparison.OrdinalIgnoreCase);

            // Level 1: Fund Cluster (Digits 1-2)
            var clusterCode = uacsCode.Substring(0, 2);
            var clusterName = !string.IsNullOrWhiteSpace(fundClusterName) 
                ? fundClusterName 
                : GetDefaultClusterName(clusterCode);

            if (!existingSources.TryGetValue(clusterCode, out var clusterSource))
            {
                clusterSource = new FundSource
                {
                    Id = Guid.NewGuid(),
                    Code = clusterCode,
                    Name = clusterName,
                    Type = FundSourceTypeEnum.FundCluster,
                    ParentId = null,
                    IsActive = true
                };
                context.FundSources!.Add(clusterSource);
                existingSources[clusterCode] = clusterSource;
                importedCount++;
            }

            // Level 2: Financing Source (Digit 3 -> Code: 3 digits)
            FundSource? financingSource = null;
            if (uacsCode.Length >= 3)
            {
                var finCode = uacsCode.Substring(0, 3);
                var finName = !string.IsNullOrWhiteSpace(financingSrcName) 
                    ? financingSrcName 
                    : GetDefaultFinancingSourceName(finCode.Substring(2, 1));

                if (!existingSources.TryGetValue(finCode, out financingSource))
                {
                    financingSource = new FundSource
                    {
                        Id = Guid.NewGuid(),
                        Code = finCode,
                        Name = finName,
                        Type = FundSourceTypeEnum.FinancingSource,
                        ParentId = clusterSource.Id,
                        IsActive = true
                    };
                    context.FundSources!.Add(financingSource);
                    existingSources[finCode] = financingSource;
                    importedCount++;
                }
            }

            // Level 3: Authorization (Digits 4-5 -> Code: 5 digits)
            FundSource? authSource = null;
            if (uacsCode.Length >= 5)
            {
                var authCode = uacsCode.Substring(0, 5);
                var authName = !string.IsNullOrWhiteSpace(authorizationName) 
                    ? authorizationName 
                    : GetDefaultAuthorizationName(authCode.Substring(3, 2));

                if (!existingSources.TryGetValue(authCode, out authSource))
                {
                    authSource = new FundSource
                    {
                        Id = Guid.NewGuid(),
                        Code = authCode,
                        Name = authName,
                        Type = FundSourceTypeEnum.AuthorizationCode,
                        ParentId = financingSource?.Id ?? clusterSource.Id,
                        IsActive = true
                    };
                    context.FundSources!.Add(authSource);
                    existingSources[authCode] = authSource;
                    importedCount++;
                }
            }

            // Level 4: Specific Fund Category / Sub-Category (Full 8 digits)
            var finalName = !string.IsNullOrWhiteSpace(fundSubCatName) ? fundSubCatName
                          : !string.IsNullOrWhiteSpace(fundCategoryName) ? fundCategoryName
                          : !string.IsNullOrWhiteSpace(description) ? description
                          : $"Fund Source ({uacsCode})";

            if (!existingSources.TryGetValue(uacsCode, out var leafSource))
            {
                leafSource = new FundSource
                {
                    Id = Guid.NewGuid(),
                    Code = uacsCode,
                    Name = finalName,
                    Type = FundSourceTypeEnum.FundSubCategory,
                    ParentId = authSource?.Id ?? financingSource?.Id ?? clusterSource.Id,
                    IsActive = isActive
                };
                context.FundSources!.Add(leafSource);
                existingSources[uacsCode] = leafSource;
                importedCount++;
            }

            var targetOrgName = !string.IsNullOrWhiteSpace(agencyName) ? agencyName : departmentName;
            if (!string.IsNullOrWhiteSpace(targetOrgName))
            {
                if (!existingOrgs.TryGetValue(targetOrgName, out var targetOrg))
                {
                    var code = Regex.Replace(targetOrgName.ToUpper(), @"[^A-Z0-9]", "");
                    if (code.Length > 10) code = code.Substring(0, 10);

                    targetOrg = new Organization
                    {
                        Id = Guid.NewGuid(),
                        Name = targetOrgName,
                        Code = code,
                        Type = "Department",
                        IsActive = true
                    };
                    context.Organizations!.Add(targetOrg);
                    existingOrgs[targetOrgName] = targetOrg;
                }

                var linkKey = new { OrganizationId = targetOrg.Id, FundSourceId = leafSource.Id };
                if (!existingLinks.Contains(linkKey))
                {
                    context.OrganizationFundSources!.Add(new OrganizationFundSource
                    {
                        Id = Guid.NewGuid(),
                        OrganizationId = targetOrg.Id,
                        FundSourceId = leafSource.Id,
                        IsActive = true
                    });
                    existingLinks.Add(linkKey);
                }
            }

            importedCount++;
        }

        await context.SaveChangesAsync(cancellationToken);
        return importedCount;
    }

    /// <summary>
    /// Seeds default UACS Fund Source structures into the database idempotently.
    /// </summary>
    public static async Task SeedDefaultAsync(ApplicationDbContext context)
    {
        if (await context.FundSources!.AnyAsync()) return;

        var seeds = new List<(string Code, string Name, FundSourceTypeEnum Type, string? ParentCode)>
        {
            // Level 1: Fund Clusters
            ("01", "Regular Agency Fund", FundSourceTypeEnum.FundCluster, null),
            ("02", "Foreign Assisted Projects Fund", FundSourceTypeEnum.FundCluster, null),
            ("03", "Special Account - Locally Funded/Domestic Grants Fund", FundSourceTypeEnum.FundCluster, null),
            ("04", "Special Account - Foreign Assisted/Foreign Grants Fund", FundSourceTypeEnum.FundCluster, null),
            ("05", "Internally Generated Funds", FundSourceTypeEnum.FundCluster, null),
            ("06", "Business Related Funds", FundSourceTypeEnum.FundCluster, null),
            ("07", "Trust Receipts", FundSourceTypeEnum.FundCluster, null),

            // Level 2: Financing Sources under 01 (Regular Agency Fund)
            ("011", "General Fund", FundSourceTypeEnum.FinancingSource, "01"),
            ("012", "Off-Budgetary Funds", FundSourceTypeEnum.FinancingSource, "01"),
            ("013", "Custodial Funds", FundSourceTypeEnum.FinancingSource, "01"),

            // Level 3: Authorization Codes under 011 (General Fund)
            ("01101", "New General Appropriations", FundSourceTypeEnum.AuthorizationCode, "011"),
            ("01102", "Continuing Appropriations", FundSourceTypeEnum.AuthorizationCode, "011"),
            ("01103", "Supplemental Appropriations", FundSourceTypeEnum.AuthorizationCode, "011"),
            ("01104", "Automatic Appropriations", FundSourceTypeEnum.AuthorizationCode, "011"),
            ("01105", "Unprogrammed Appropriations", FundSourceTypeEnum.AuthorizationCode, "011"),

            // Level 4: Standard UACS Fund Sources
            ("01101101", "Specific Budgets of National Government Agencies", FundSourceTypeEnum.FundCategory, "01101"),
            ("01101111", "ARMM-DepEd's GSIS Contribution", FundSourceTypeEnum.FundCategory, "01101"),
            ("01101252", "Special Shares of LGUs in the Proceeds of National Taxes", FundSourceTypeEnum.FundCategory, "01101"),
            ("01101253", "Barangay Officials Death Benefits Fund", FundSourceTypeEnum.FundCategory, "01101"),
            ("01101254", "Local Government Support Fund", FundSourceTypeEnum.FundCategory, "01101"),
            ("01101255", "Special Shares of LGUs in Proceeds of Fire Code Fees", FundSourceTypeEnum.FundCategory, "01101"),
            ("01101256", "Barangay Officials Death Benefits", FundSourceTypeEnum.FundCategory, "01101"),
            ("01101257", "Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)", FundSourceTypeEnum.FundCategory, "01101"),
            ("01101276", "Equity Contribution", FundSourceTypeEnum.FundCategory, "01101"),
            ("01101277", "Subsidies", FundSourceTypeEnum.FundCategory, "01101"),
            ("01101278", "Loans", FundSourceTypeEnum.FundCategory, "01101"),
            ("01101279", "Advances", FundSourceTypeEnum.FundCategory, "01101"),
            ("01101301", "Financial Assistance", FundSourceTypeEnum.FundCategory, "01101"),

            // Level 2 & 3 & 4 for 03 (Special Account)
            ("031", "General Fund", FundSourceTypeEnum.FinancingSource, "03"),
            ("03102", "Continuing Appropriations", FundSourceTypeEnum.AuthorizationCode, "031"),
            ("03102393", "Special Account - Continuing Appropriations (393)", FundSourceTypeEnum.FundCategory, "03102")
        };

        var createdEntities = new Dictionary<string, FundSource>(StringComparer.OrdinalIgnoreCase);

        foreach (var seed in seeds)
        {
            Guid? parentId = null;
            if (!string.IsNullOrEmpty(seed.ParentCode) && createdEntities.TryGetValue(seed.ParentCode, out var parent))
            {
                parentId = parent.Id;
            }

            var entity = new FundSource
            {
                Id = Guid.NewGuid(),
                Code = seed.Code,
                Name = seed.Name,
                Type = seed.Type,
                ParentId = parentId,
                IsActive = true
            };

            context.FundSources!.Add(entity);
            createdEntities[seed.Code] = entity;
        }

        await context.SaveChangesAsync();
    }

    private static string GetCellValue(IXLRow row, int cellNumber, string colName)
    {
        try
        {
            var cell = row.Cell(cellNumber);
            return cell.GetString().Trim();
        }
        catch
        {
            return string.Empty;
        }
    }

    private static string GetDefaultClusterName(string clusterCode) => clusterCode switch
    {
        "01" => "Regular Agency Fund",
        "02" => "Foreign Assisted Projects Fund",
        "03" => "Special Account - Locally Funded/Domestic Grants Fund",
        "04" => "Special Account - Foreign Assisted/Foreign Grants Fund",
        "05" => "Internally Generated Funds",
        "06" => "Business Related Funds",
        "07" => "Trust Receipts",
        _ => $"Fund Cluster {clusterCode}"
    };

    private static string GetDefaultFinancingSourceName(string finDigit) => finDigit switch
    {
        "1" => "General Fund",
        "2" => "Off-Budgetary Funds",
        "3" => "Custodial Funds",
        _ => $"Financing Source {finDigit}"
    };

    private static string GetDefaultAuthorizationName(string authDigits) => authDigits switch
    {
        "01" => "New General Appropriations",
        "02" => "Continuing Appropriations",
        "03" => "Supplemental Appropriations",
        "04" => "Automatic Appropriations",
        "05" => "Unprogrammed Appropriations",
        "06" => "Retained Income/Funds",
        "07" => "Revolving Funds",
        "08" => "Trust Receipts",
        _ => $"Authorization {authDigits}"
    };
}
