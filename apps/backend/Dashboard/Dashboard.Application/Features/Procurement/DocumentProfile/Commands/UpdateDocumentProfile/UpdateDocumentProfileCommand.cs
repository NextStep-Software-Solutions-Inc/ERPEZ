using ERPEZ.Application.Features.Procurement.DocumentProfile.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DocumentProfile.Commands.UpdateDocumentProfile;

public record UpdateDocumentProfileCommand : IRequest<ApiResponse<Unit>>
{
    public Guid            Id                  { get; init; }
    public required string Name                { get; init; }
    public string?         Description         { get; init; }
    public required string ProcurementCategory { get; init; }
    public List<ProfileItemRequest> Items      { get; init; } = [];
}