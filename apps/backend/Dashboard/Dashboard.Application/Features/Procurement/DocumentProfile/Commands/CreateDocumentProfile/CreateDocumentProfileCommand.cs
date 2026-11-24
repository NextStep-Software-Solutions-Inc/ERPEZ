using ERPEZ.Application.Features.Procurement.DocumentProfile.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DocumentProfile.Commands.CreateDocumentProfile;

public record CreateDocumentProfileCommand : IRequest<ApiResponse<Guid>>
{
    public required string Name                { get; init; }
    public string?         Description         { get; init; }
    public required string ProcurementCategory { get; init; }
    public List<ProfileItemRequest> Items      { get; init; } = [];
}