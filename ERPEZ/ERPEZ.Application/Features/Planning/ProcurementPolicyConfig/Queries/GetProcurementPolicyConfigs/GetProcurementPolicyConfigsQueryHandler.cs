using ERPEZ.Application.Features.Planning.ProcurementPolicyConfig.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.ProcurementPolicyConfig.Queries.GetProcurementPolicyConfigs;

public class GetProcurementPolicyConfigsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetProcurementPolicyConfigsQuery, PaginatedApiResponse<ProcurementPolicyConfigResponse>>
{
    public async Task<PaginatedApiResponse<ProcurementPolicyConfigResponse>> Handle(GetProcurementPolicyConfigsQuery request, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            Filters = request.Filters,
            Sorts = request.Sorts,
            Page = request.Page,
            PageSize = request.PageSize
        };

        Expression<Func<Domain.Entities.Planning.ProcurementPolicyConfig, ProcurementPolicyConfigResponse>> projection = ppc => new ProcurementPolicyConfigResponse
        {
            Id = ppc.Id,
            FiscalYearId = ppc.FiscalYearId,
            FiscalYearYear = ppc.FiscalYear != null ? ppc.FiscalYear.Year : 0,
            ProcurementModeId = ppc.ProcurementModeId,
            ProcurementModeName = ppc.ProcurementMode != null ? ppc.ProcurementMode.Name : string.Empty,
            ProcurementModeThresholdId = ppc.ProcurementModeThresholdId,
            MinAmount = ppc.MinAmount,
            MaxAmount = ppc.MaxAmount,
            CreatedAt = ppc.CreatedAt,
            CreatedBy = ppc.CreatedBy,
            UpdatedAt = ppc.UpdatedAt,
            UpdatedBy = ppc.UpdatedBy
        };

        var (items, totalCount) = await unitOfWork.ProcurementPolicyConfigRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);

        return new PaginatedApiResponse<ProcurementPolicyConfigResponse>(items.ToList(), request.Page ?? 1, request.PageSize ?? 10, totalCount);
    }
}
