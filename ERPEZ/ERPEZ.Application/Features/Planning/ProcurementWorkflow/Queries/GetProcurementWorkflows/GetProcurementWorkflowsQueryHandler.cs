using ERPEZ.Application.Features.Planning.ProcurementWorkflow.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.ProcurementWorkflow.Queries.GetProcurementWorkflows;

public class GetProcurementWorkflowsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetProcurementWorkflowsQuery, PaginatedApiResponse<ProcurementWorkflowResponse>>
{
    public async Task<PaginatedApiResponse<ProcurementWorkflowResponse>> Handle(
        GetProcurementWorkflowsQuery query,
        CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.ProcurementWorkflow, ProcurementWorkflowResponse>> projection = x => new ProcurementWorkflowResponse
        {
            Id = x.Id,
            Name = x.Name,
            Code = x.Code,
            ApprovalLevel = x.ApprovalLevel,
            IsActive = x.IsActive,
            CreatedAt = x.CreatedAt
        };

        var (workflows, totalCount) = await unitOfWork.ProcurementWorkflowRepository.GetAllAsync(
            sieveModel,
            projection,
            cancellationToken: cancellationToken);

        return new PaginatedApiResponse<ProcurementWorkflowResponse>(
            [.. workflows],
            query.PageNumber,
            query.PageSize,
            totalCount
        );
    }
}
