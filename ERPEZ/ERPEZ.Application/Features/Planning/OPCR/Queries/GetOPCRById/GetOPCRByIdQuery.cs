using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCR.Queries.GetOPCRById;

public record class GetOPCRByIdQuery(Guid Id) : IRequest<ApiResponse<Domain.Entities.Planning.OPCR>>;