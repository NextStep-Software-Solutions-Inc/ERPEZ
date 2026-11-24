using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Procurement.DirectContractings.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Queries.GetDirectContractings;

public record GetDirectContractingsQuery : PaginatedQuery<PaginatedApiResponse<DirectContractingResponse>>;
