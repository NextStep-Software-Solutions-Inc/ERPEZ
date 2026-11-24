using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.PMTMember.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.PMTMember.Queries.GetPMTMembers;

public record GetPMTMembersQuery : PaginatedQuery<PaginatedApiResponse<PMTMemberResponse>>;
