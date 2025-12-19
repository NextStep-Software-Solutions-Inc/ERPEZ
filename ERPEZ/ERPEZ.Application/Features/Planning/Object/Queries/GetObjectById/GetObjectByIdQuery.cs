using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Object.Queries.GetObjectById;

public record GetObjectByIdQuery(Guid Id) : IRequest<ApiResponse<Domain.Entities.Planning.Object>>;
