using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivity.Queries.GetOPCRActivityById;

public record class GetOPCRActivityByIdQuery(Guid Id) : IRequest<ApiResponse<Domain.Entities.Planning.OPCRActivity>>;