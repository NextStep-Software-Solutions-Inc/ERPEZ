using System;
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Commands.GenerateDirectContractingDocument;

public record GenerateDirectContractingDocumentCommand : IRequest<ApiResponse<Guid>>
{
    public Guid DirectContractingId { get; init; }
    public ExportFormat Format { get; init; } = ExportFormat.Pdf;
    public string GeneratedBy { get; init; } = "system";

    // Optional payload overrides agreed upon in design interview
    public string? StatutoryGround { get; init; }
    public string? MarketScopingSummary { get; init; }
    public string? JustificationRemarks { get; init; }
    public string? HeadOfAgencyName { get; init; }
    public string? HeadOfAgencyTitle { get; init; }
    public string? BacSecretariatHeadName { get; init; }
    public string? BacSecretariatHeadTitle { get; init; }
}

/// <summary>
/// Alias for backwards compatibility with prompt specification
/// </summary>
public record GenerateDirectContractingPdfCommand : GenerateDirectContractingDocumentCommand;
