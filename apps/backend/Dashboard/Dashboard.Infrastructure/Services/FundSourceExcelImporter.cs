using ERPEZ.Application.Interfaces;
using ERPEZ.Infrastructure.Persistence;
using ERPEZ.Infrastructure.Persistence.Seeders;

namespace ERPEZ.Infrastructure.Services;

public class FundSourceExcelImporter(ApplicationDbContext context) : IFundSourceExcelImporter
{
    public async Task<int> ImportFromExcelAsync(Stream excelStream, CancellationToken cancellationToken = default)
    {
        return await FundSourceSeeder.SeedFromExcelAsync(context, excelStream, cancellationToken);
    }
}
