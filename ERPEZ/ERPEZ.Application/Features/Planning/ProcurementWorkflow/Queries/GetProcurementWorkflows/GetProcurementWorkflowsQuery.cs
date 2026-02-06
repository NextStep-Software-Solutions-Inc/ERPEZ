using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.ProcurementWorkflow.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.ProcurementWorkflow.Queries.GetProcurementWorkflows;

public record GetProcurementWorkflowsQuery : PaginatedQuery<PaginatedApiResponse<ProcurementWorkflowResponse>>;
