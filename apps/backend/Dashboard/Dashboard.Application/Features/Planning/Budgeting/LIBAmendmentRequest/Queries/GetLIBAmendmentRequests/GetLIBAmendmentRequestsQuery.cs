using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;
using ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Queries.GetLIBAmendmentRequests;

public record GetLIBAmendmentRequestsQuery : PaginatedQuery<PaginatedApiResponse<LIBAmendmentRequestResponse>>;

