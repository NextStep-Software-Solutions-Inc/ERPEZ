using ERPEZ.Application.Features.Planning.Psdbm.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Psdbm.Queries.GetItemDetail;

public record GetPsdbmItemDetailQuery : IRequest<ApiResponse<PsdbmProductDetailDto>>
{
    public Guid? Id { get; init; }
    public string? ItemCode { get; init; }
}
