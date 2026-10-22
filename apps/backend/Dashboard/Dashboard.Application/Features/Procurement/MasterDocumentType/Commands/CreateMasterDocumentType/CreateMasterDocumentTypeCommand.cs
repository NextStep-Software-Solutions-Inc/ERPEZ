using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.MasterDocumentType.Commands.CreateMasterDocumentType;

public record CreateMasterDocumentTypeCommand : IRequest<ApiResponse<Guid>>
{
    public required string Name         { get; init; }
    public string?         Description  { get; init; }
    public int             EnvelopeType { get; init; }
    public Guid?           FileId       { get; init; }
}