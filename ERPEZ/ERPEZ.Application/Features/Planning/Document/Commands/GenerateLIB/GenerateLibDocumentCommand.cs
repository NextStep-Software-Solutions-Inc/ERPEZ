using ERPEZ.Application.Common.Dtos;
using ERPEZ.Application.Features.Planning.Document.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateLIB;

public record GenerateLibDocumentCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid AgencyId { get; init; }
    public required string FiscalYear { get; init; }
    public required ExportFormat Format { get; init; }
    public required string LibNumber { get; init; }
    public required string ProgramTitle { get; init; }
    public required string ImplementingUnit { get; init; }
    public required List<LibLineItemDto> LineItems { get; init; }
    public required List<SignatoryDto> Signatories { get; init; }
    public string GeneratedBy { get; set; } = string.Empty;
}