using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Common.Services;

/// <summary>
/// Service for generating transaction codes with timestamp and series number.
/// Code format: YYYYMMDD-SSSSS (e.g., 20260115-00001)
/// </summary>
public class TransactionCodeGeneratorService(IUnitOfWork unitOfWork) : ITransactionCodeGeneratorService
{
    public async Task<long> GenerateTransactionCodeAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow;
        var datePrefix = today.ToString("yyyyMMdd");

        var existingTransactionsToday = await unitOfWork.AccountTransactionRepository
            .Query(t => t.CreatedAt.Date == today.Date)
            .CountAsync(cancellationToken);

        var seriesNumber = existingTransactionsToday + 1;
        var codeString = $"{datePrefix}-{seriesNumber:D5}";
        var generatedCode = long.Parse(codeString.Replace("-", ""));

        return generatedCode;
    }
}
