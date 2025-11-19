using ERPEZ.Application.Features.Planning.SDG.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SDG.Queries.GetSDGById;

public class GetSDGByIdQuery : IRequest<ApiResponse<SDGResponse>>
{
    public Guid Id { get; set; }
}
