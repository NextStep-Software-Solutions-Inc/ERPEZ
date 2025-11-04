using ERPEZ.Application.Features.Planning.Location.Queries.GetLocationById;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MFOPAP.Queries.GetMFOPAPById;

public record class GetMFOPAPByIdQuery(Guid Id) : IRequest<ApiResponse<Domain.Entities.Planning.MFOPAP>>;
