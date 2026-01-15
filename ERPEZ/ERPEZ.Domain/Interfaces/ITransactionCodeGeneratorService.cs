namespace ERPEZ.Domain.Interfaces;

/// <summary>
/// Service for generating transaction codes based on timestamp and series number.
/// </summary>
public interface ITransactionCodeGeneratorService
{
    /// <summary>
    /// Generates a transaction code in format YYYYMMDD-SSSSS (e.g., 20260115-00001).
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Generated transaction code.</returns>
    Task<long> GenerateTransactionCodeAsync(CancellationToken cancellationToken = default);
}
