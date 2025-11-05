using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFP.Queries.GetWFPById;

public record class GetWFPByIdQuery(Guid Id) : IRequest<ApiResponse<Domain.Entities.Planning.WFP>>;
