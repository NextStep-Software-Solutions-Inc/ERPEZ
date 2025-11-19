using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRKPI.Queries.GetOPCRKPIById;

public record class GetOPCRKPIByIdQuery(Guid Id) : IRequest<ApiResponse<Domain.Entities.Planning.OPCRKPI>>;
