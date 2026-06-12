using ERPEZ.Application.Common.Dtos;
using ERPEZ.Application.Features.Planning.Document.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateAPP;

public record GenerateAppDocumentCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid OfficeId { get; init; }
    public required string FiscalYear{ get; init; }
    public required ExportFormat Format { get; init; }
    public bool IsIndicative { get; init; }
    public bool IsFinal { get; init; }
    public bool IsUpdated { get; init; }
    public string VersionNumber { get; init; } = string.Empty;
    public required List<AppItemDto> GeneralRequirements { get; init; }
    public required List<AppItemDto> MiscellaneousItems { get; init; }
    public required List<AppItemDto> CommonUseSupplies { get; init; }
    public decimal TotalEpaProjects { get; init; }
    public decimal TotalCsePsDbm { get; init; }
    public decimal TotalEstimatedBudget { get; init; }
    public required List<SignatoryDto> Signatories { get; init; }
    public string GeneratedBy { get; set; } = string.Empty;
}