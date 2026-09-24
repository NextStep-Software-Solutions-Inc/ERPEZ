namespace ERPEZ.Application.Interfaces.Services;

/// <summary>
/// Encapsulates all shared entity/configuration resolution logic needed when generating
/// RFQ documents or building the RFQ notice payload.
/// Centralises: office hierarchy traversal, procuring entity name/address resolution,
/// and live BAC member (Chairperson + Secretariat) resolution with multi-tier fallbacks.
/// </summary>
public interface IRFQDocumentContextService
{
    /// <summary>
    /// Resolves the full procurement document context for the given RFQ, including
    /// procuring entity name/address and BAC signatories.
    /// </summary>
    /// <param name="rfqNumber">RFQ reference number (used for warning logs).</param>
    /// <param name="rfqId">RFQ entity ID (used for warning logs).</param>
    /// <param name="startingOfficeId">The OfficeId to begin the hierarchy traversal from.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task<RFQDocumentContext> ResolveAsync(
        string rfqNumber,
        Guid rfqId,
        Guid startingOfficeId,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Value object carrying the resolved document context that is shared between
/// <c>GenerateRFQDocumentCommandHandler</c> and <c>GetRFQNoticeQueryHandler</c>.
/// </summary>
public sealed record RFQDocumentContext
{
    /// <summary>Resolved head-office / procuring entity name, or placeholder.</summary>
    public required string ProcuringEntity { get; init; }

    /// <summary>Resolved procuring entity address, or empty string.</summary>
    public required string ProcuringEntityAddress { get; init; }

    /// <summary>Resolved BAC Chairperson full name, or placeholder.</summary>
    public required string BacChairpersonName { get; init; }

    /// <summary>Resolved BAC Chairperson designation/title, or placeholder.</summary>
    public required string BacChairpersonTitle { get; init; }

    /// <summary>Resolved BAC Secretariat full name, or placeholder.</summary>
    public required string BacSecName { get; init; }

    /// <summary>Config-derived or address-derived submission location.</summary>
    public required string SubmissionLocation { get; init; }

    /// <summary>Config-derived or address-derived delivery location.</summary>
    public required string DeliveryLocation { get; init; }

    /// <summary>Config-derived BAC contact email, or placeholder.</summary>
    public required string ContactEmail { get; init; }

    /// <summary>Config-derived BAC contact phone, or placeholder.</summary>
    public required string ContactPhone { get; init; }
}
