using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;
using ERPEZ.Application.Features.Planning.Budgeting.LIB.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Queries.GetLIBs;

public record GetLIBsQuery : PaginatedQuery<PaginatedApiResponse<LIBResponse>>;

