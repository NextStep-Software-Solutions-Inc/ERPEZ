using Microsoft.AspNetCore.Http;

namespace ERPEZ.Application.Interfaces;

public interface IPositionImportService
{
    Task<PositionImportResult> ImportFromExcelAsync(IFormFile file, CancellationToken cancellationToken = default);
}

public record PositionImportResult
{
    public int TotalRows { get; init; }
    public int SuccessCount { get; init; }
    public int FailureCount { get; init; }
    public List<string> Errors { get; init; } = [];
}
