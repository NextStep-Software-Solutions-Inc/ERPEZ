using ERPEZ.Application.Features.Planning.KPI.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.KPI.Queries.GetKPIsQuery;

public class GetKPIsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetKPIsQuery, PaginatedApiResponse<KPIResponse>>
{
    public async Task<PaginatedApiResponse<KPIResponse>> Handle(GetKPIsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.KPI, KPIResponse>> projection = fy => new KPIResponse
        {
            Id = fy.Id,
            ParentKPIId = fy.ParentKPIId,
            FunctionType = fy.FunctionType,
            Description = fy.Description,
            Name = fy.Name,
            IsOfficeMandate = fy.IsOfficeMandate,
            IsPercentage = fy.IsPercentage,
            Status = fy.Status,
            CreatedBy = fy.CreatedBy,
            CreatedAt = fy.CreatedAt
        };
        var (kpis, totalCount) = await unitOfWork.KPIRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<KPIResponse>([.. kpis], query.PageNumber, query.PageSize, totalCount);
    }
}
