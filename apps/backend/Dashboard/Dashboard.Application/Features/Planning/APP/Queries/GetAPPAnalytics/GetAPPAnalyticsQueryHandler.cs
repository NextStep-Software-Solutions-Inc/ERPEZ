using ERPEZ.Application.Features.Planning.APP.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APP.Queries.GetAPPAnalytics;

public class GetAPPAnalyticsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetAPPAnalyticsQuery, ApiResponse<APPAnalyticsResponse>>
{
    public async Task<ApiResponse<APPAnalyticsResponse>> Handle(
        GetAPPAnalyticsQuery request, CancellationToken cancellationToken)
    {
        var data = await unitOfWork.APPRepository.GetAPPAnalyticsAsync(request.AppId, cancellationToken)
            ?? throw new NotFoundException("APP not found.");

        var response = new APPAnalyticsResponse
        {
            AppId = data.AppId,
            APPNumber = data.APPNumber,
            Name = data.Name,
            FiscalYear = data.FiscalYear,
            APPType = data.APPType,
            TotalEstimatedBudget = data.TotalEstimatedBudget,
            TotalItemsCount = data.TotalItemsCount,
            TotalPpmpsCount = data.TotalPpmpsCount,
            TotalOfficesCount = data.TotalOfficesCount,
            BreakdownByOffice = data.BreakdownByOffice.Select(o => new OfficeBreakdownDto(o.OfficeId, o.OfficeName, o.ItemsCount, o.TotalAmount)).ToList(),
            BreakdownByCategory = data.BreakdownByCategory.Select(c => new CategoryBreakdownDto(c.CategoryName, c.ItemsCount, c.TotalAmount)).ToList(),
            BreakdownByProcurementType = data.BreakdownByProcurementType.Select(p => new ProcurementTypeBreakdownDto(p.ProcurementModeName, p.ItemsCount, p.TotalAmount)).ToList(),
            BreakdownByFundSource = data.BreakdownByFundSource.Select(f => new FundSourceBreakdownDto(f.FundSourceName, f.ItemsCount, f.TotalAmount)).ToList(),
            FinancialBreakdown = new FinancialBreakdownDto(data.FinancialBreakdown.PS, data.FinancialBreakdown.MOOE, data.FinancialBreakdown.CO)
        };

        return ApiResponse<APPAnalyticsResponse>.Success(response);
    }
}
