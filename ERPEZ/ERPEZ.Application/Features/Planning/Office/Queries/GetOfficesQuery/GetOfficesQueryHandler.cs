using ERPEZ.Application.Features.Planning.Office.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.Office.Queries.GetOfficesQuery;

public class GetOfficesQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetOfficesQuery, PaginatedApiResponse<OfficeResponse>>
{
    public async Task<PaginatedApiResponse<OfficeResponse>> Handle(GetOfficesQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        Expression<Func<Domain.Entities.Planning.Office, OfficeResponse>> projection = o => new OfficeResponse
        {
            Id = o.Id,
            Name = o.Name,
            Code = o.Code,
            Address = o.Address,
            Description = o.Description,
            ResponsibilityCenterCode = o.ResponsibilityCenterCode,
            BudgetCostCenter = o.BudgetCostCenter,
            OfficeTypeId = o.OfficeTypeId,
            OrganizationId = o.OrganizationId,
            CategoryId = o.CategoryId,
            AdministrativeLevelId = o.AdministrativeLevelId,
            ClusterId = o.ClusterId,
            ProcurementWorkflowId = o.ProcurementWorkflowId,
            ParentId = o.ParentId,
            CreatedBy = o.CreatedBy,
            CreatedAt = o.CreatedAt
        };
        var (offices, totalCount) = await unitOfWork.OfficeRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<OfficeResponse>(
            [.. offices],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
