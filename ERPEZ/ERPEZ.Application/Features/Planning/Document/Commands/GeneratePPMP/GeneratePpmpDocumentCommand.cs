using ERPEZ.Application.Common.Dtos;
using ERPEZ.Application.Features.Planning.Document.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GeneratePPMP;

public record GeneratePpmpDocumentCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid AgencyId { get; init; }
    public required string FiscalYear { get; init; }
    public required ExportFormat Format { get; init; }
    public required string PpmpNumber { get; init; }
    public bool IsIndicative { get; init; }
    public bool IsFinal { get; init; }
    public required string EndUserOrImplementingUnit { get; init; }
    public required List<PpmpItemDto> Items { get; init; }
    public required List<SignatoryDto> Signatories { get; init; }
    public string GeneratedBy { get; set; } = string.Empty;
}