using ERPEZ.Application.Common.Dtos;
using ERPEZ.Application.Features.Planning.Document.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateBudgetModification;

public record GenerateBudgetModificationDocumentCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid AgencyId { get; init; }
    public required string FiscalYear { get; init; }
    public required ExportFormat Format { get; init; }
    public required string ModificationNumber { get; init; }
    public required string Purpose { get; init; }
    public required List<BudgetModLineItemDto> FromItems { get; init; }
    public required List<BudgetModLineItemDto> ToItems { get; init; }
    public required List<SignatoryDto> Signatories { get; init; }
    public string GeneratedBy { get; set; } = string.Empty;
}