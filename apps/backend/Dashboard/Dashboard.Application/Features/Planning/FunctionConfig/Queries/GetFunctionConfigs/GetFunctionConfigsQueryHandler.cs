using ERPEZ.Application.Features.Planning.FunctionConfig.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.FunctionConfig.Queries.GetFunctionConfigs;

public class GetFunctionConfigsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetFunctionConfigsQuery, PaginatedApiResponse<FunctionConfigResponse>>
{
    public async Task<PaginatedApiResponse<FunctionConfigResponse>> Handle(GetFunctionConfigsQuery request, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            Filters = request.Filters,
            Sorts = request.Sorts,
            Page = request.Page,
            PageSize = request.PageSize
        };

        Expression<Func<Domain.Entities.Planning.FunctionConfig, FunctionConfigResponse>> projection = fc => new FunctionConfigResponse
        {
            Id = fc.Id,
            FiscalYearId = fc.FiscalYearId,
            FiscalYearYear = fc.FiscalYear != null ? fc.FiscalYear.Year : 0,
            StrategicMinWeight = fc.StrategicMinWeight,
            StrategicMaxWeight = fc.StrategicMaxWeight,
            CoreFunctionMinWeight = fc.CoreFunctionMinWeight,
            CoreFunctionMaxWeight = fc.CoreFunctionMaxWeight,
            SupportMinWeight = fc.SupportMinWeight,
            SupportMaxWeight = fc.SupportMaxWeight,
            CreatedAt = fc.CreatedAt,
            CreatedBy = fc.CreatedBy,
            UpdatedAt = fc.UpdatedAt,
            UpdatedBy = fc.UpdatedBy
        };

        var (items, totalCount) = await unitOfWork.FunctionConfigRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);

        return new PaginatedApiResponse<FunctionConfigResponse>(items.ToList(), request.Page ?? 1, request.PageSize ?? 10, totalCount);
    }
}
