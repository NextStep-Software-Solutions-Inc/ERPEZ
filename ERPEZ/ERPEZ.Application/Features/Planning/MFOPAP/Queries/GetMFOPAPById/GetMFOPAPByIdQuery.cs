using ERPEZ.Application.Features.Planning.MFOPAP.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MFOPAP.Queries.GetMFOPAPById;

public record GetMFOPAPByIdQuery(Guid Id) : IRequest<ApiResponse<MFOPAPDetailedResponse>>;
