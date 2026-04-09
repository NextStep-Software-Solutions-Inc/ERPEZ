using ERPEZ.Application.Features.Planning.FiscalYear.Dtos;
using ERPEZ.Application.Features.Planning.FundSource.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FundSource.Queries.GetFundSourceById;

public class GetFundSourceByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetFundSourceByIdQuery, ApiResponse<FundSourceResponse>>
{
    public async Task<ApiResponse<FundSourceResponse>> Handle(GetFundSourceByIdQuery request, CancellationToken cancellationToken)
    {
        var query = unitOfWork.FundSourceRepository.Query(f => f.Id == request.Id)
            .Select(fundSource => new FundSourceResponse
            {
                Id = fundSource.Id,
                ParentId = fundSource.ParentId,
                Parent = fundSource.ParentSource != null ? new FundSourceResponse
                {
                    Id = fundSource.ParentSource.Id,
                    ParentId = fundSource.ParentSource.ParentId,
                    Name = fundSource.ParentSource.Name,
                    Code = fundSource.ParentSource.Code,
                    Type = fundSource.ParentSource.Type.ToString(),
                    TotalDUAllocatedFunds = 0m,
                    TotalReceivedFunds = 0m,
                    IsActive = fundSource.ParentSource.IsActive,
                    FiscalYearId = fundSource.ParentSource.FiscalYearId,
                    CreatedBy = fundSource.ParentSource.CreatedBy,
                    CreatedAt = fundSource.ParentSource.CreatedAt
                } : null,
                Name = fundSource.Name,
                Code = fundSource.Code,
                TotalDUAllocatedFunds = 0m,
                TotalReceivedFunds = 0m,
                Type = fundSource.Type.ToString(),
                IsActive = fundSource.IsActive,
                FiscalYearId = fundSource.FiscalYearId,
                FiscalYear = fundSource.FiscalYear != null ? new FiscalYearResponse
                {
                    Id = fundSource.FiscalYear.Id,
                    Year = fundSource.FiscalYear.Year,
                    Description = fundSource.FiscalYear.Description,
                    Status = fundSource.FiscalYear.Status.ToString(),
                    IsLocked = fundSource.FiscalYear.IsLocked,
                    StartDate = fundSource.FiscalYear.StartDate,
                    EndDate = fundSource.FiscalYear.EndDate
                } : null,
                CreatedBy = fundSource.CreatedBy,
                CreatedAt = fundSource.CreatedAt
            });

        var result = await unitOfWork.FundSourceRepository.GetFirstAsync(query, cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<FundSourceResponse>.Success(result, "Retrieved successfully");
    }
}
