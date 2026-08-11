using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;
using ERPEZ.Application.Features.Planning.Budgeting.OfficeCeiling.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.Budgeting.OfficeCeiling.Queries.GetOfficeCeilings;

public record GetOfficeCeilingsQuery : PaginatedQuery<PaginatedApiResponse<OfficeCeilingResponse>>;

