namespace ERPEZ.Application.Common.Interfaces;

/// <summary>
/// Common contract for document DTOs that support dynamic procuring entity letterhead and branding.
/// </summary>
public interface IAgencyLetterheadAware
{
    string? ProcuringEntityName { get; set; }
    string? ProcuringEntityAddress { get; set; }
    byte[]? LogoBytes { get; set; }
    string? LetterheadAlignment { get; set; }
}
