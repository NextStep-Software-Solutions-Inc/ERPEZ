using ERPEZ.Application.Features.Planning.PMTMember.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PMTMember.Queries.GetPMTMemberById;

public record GetPMTMemberByIdQuery(Guid Id) : IRequest<ApiResponse<PMTMemberResponse>>;
