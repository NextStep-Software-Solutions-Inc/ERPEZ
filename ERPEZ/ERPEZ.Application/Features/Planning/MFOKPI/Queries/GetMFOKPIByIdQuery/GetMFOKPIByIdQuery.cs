using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MFOKPI.Queries.GetMFOKPIByIdQuery;

public record GetMFOKPIByIdQuery(Guid Id) : IRequest<ApiResponse<Domain.Entities.Planning.MFOKPI>>;