using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FYActiveKPI.Queries.GetFYActiveKPIById;

public record GetFYActiveKPIByIdQuery(Guid Id) : IRequest<ApiResponse<FYActiveKPIDetailedResponse>>;
