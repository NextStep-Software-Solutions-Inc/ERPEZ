using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.MasterDocumentType.Commands.UpdateMasterDocumentType;

public record UpdateMasterDocumentTypeCommand : IRequest<ApiResponse<Unit>>
{
    public Guid            Id           { get; init; }
    public required string Name         { get; init; }
    public string?         Description  { get; init; }
    public int             EnvelopeType { get; init; }
    public Guid?           FileId       { get; init; }
}