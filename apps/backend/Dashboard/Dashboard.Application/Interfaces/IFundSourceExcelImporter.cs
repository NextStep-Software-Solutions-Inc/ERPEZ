namespace ERPEZ.Application.Interfaces;

public interface IFundSourceExcelImporter
{
    Task<int> ImportFromExcelAsync(Stream excelStream, CancellationToken cancellationToken = default);
}
