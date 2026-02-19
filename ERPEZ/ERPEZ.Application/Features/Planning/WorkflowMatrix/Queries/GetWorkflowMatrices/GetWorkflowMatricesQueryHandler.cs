using ERPEZ.Application.Features.Planning.WorkflowMatrix.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.WorkflowMatrix.Queries.GetWorkflowMatrices;

public class GetWorkflowMatricesQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetWorkflowMatricesQuery, PaginatedApiResponse<WorkflowMatrixResponse>>
{
    public async Task<PaginatedApiResponse<WorkflowMatrixResponse>> Handle(GetWorkflowMatricesQuery request, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            Filters = request.Filters,
            Sorts = request.Sorts,
            Page = request.Page,
            PageSize = request.PageSize
        };

        Expression<Func<Domain.Entities.Planning.WorkflowMatrix, WorkflowMatrixResponse>> projection = wm => new WorkflowMatrixResponse
        {
            Id = wm.Id,
            FiscalYearId = wm.FiscalYearId,
            FiscalYearYear = wm.FiscalYear != null ? wm.FiscalYear.Year : 0,
            OrganizationId = wm.OrganizationId,
            OrganizationName = wm.Organization != null ? wm.Organization.Name : string.Empty,
            DocumentType = wm.DocumentType,
            CreatedAt = wm.CreatedAt,
            CreatedBy = wm.CreatedBy,
            UpdatedAt = wm.UpdatedAt,
            UpdatedBy = wm.UpdatedBy
        };

        var (items, totalCount) = await unitOfWork.WorkflowMatrixRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);

        return new PaginatedApiResponse<WorkflowMatrixResponse>(items.ToList(), request.Page ?? 1, request.PageSize ?? 10, totalCount);
    }
}
