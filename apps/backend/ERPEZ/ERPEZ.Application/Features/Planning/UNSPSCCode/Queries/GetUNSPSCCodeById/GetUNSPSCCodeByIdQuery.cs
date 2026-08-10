using ERPEZ.Application.Features.Planning.UNSPSCCode.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UNSPSCCode.Queries.GetUNSPSCCodeById;

public record GetUNSPSCCodeByIdQuery(Guid Id) : IRequest<ApiResponse<UNSPSCCodeResponse>>;
