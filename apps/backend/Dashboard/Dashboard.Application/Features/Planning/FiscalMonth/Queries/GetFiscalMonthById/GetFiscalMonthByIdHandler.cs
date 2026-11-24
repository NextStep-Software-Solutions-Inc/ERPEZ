using ERPEZ.Application.Features.Planning.FiscalMonth.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FiscalMonth.Queries.GetFiscalMonthById;

public class GetFiscalMonthByIdHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetFiscalMonthByIdQuery, ApiResponse<FiscalMonthDetailedResponse>>
{
    public async Task<ApiResponse<FiscalMonthDetailedResponse>> Handle(
        GetFiscalMonthByIdQuery request,
        CancellationToken cancellationToken)
    {
        var fiscalMonth = await unitOfWork.FiscalMonthRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("Fiscal month not found.");

        var response = new FiscalMonthDetailedResponse
        {
            Id = fiscalMonth.Id,
            FiscalYearId = fiscalMonth.FiscalYearId,
            Name = fiscalMonth.Name,
            MonthIndex = fiscalMonth.MonthIndex,
            IsLocked = fiscalMonth.IsLocked,
            ModifiedByUserId = fiscalMonth.ModifiedByUserId,
            CreatedAt = fiscalMonth.CreatedAt,
            CreatedBy = fiscalMonth.CreatedBy,
            UpdatedAt = fiscalMonth.UpdatedAt,
            UpdatedBy = fiscalMonth.UpdatedBy
        };

        return ApiResponse<FiscalMonthDetailedResponse>.Success(response, "Retrieved successfully");
    }
}
