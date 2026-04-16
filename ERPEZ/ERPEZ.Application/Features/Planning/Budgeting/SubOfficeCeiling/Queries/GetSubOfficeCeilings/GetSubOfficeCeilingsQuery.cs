using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;
using ERPEZ.Application.Features.Planning.Budgeting.SubOfficeCeiling.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.Budgeting.SubOfficeCeiling.Queries.GetSubOfficeCeilings;

public record GetSubOfficeCeilingsQuery : PaginatedQuery<PaginatedApiResponse<SubOfficeCeilingResponse>>;

