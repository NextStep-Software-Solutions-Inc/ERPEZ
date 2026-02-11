using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.OfficeType.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.OfficeType.Queries.GetOfficeTypes;

public record GetOfficeTypesQuery : PaginatedQuery<PaginatedApiResponse<OfficeTypeResponse>>;
