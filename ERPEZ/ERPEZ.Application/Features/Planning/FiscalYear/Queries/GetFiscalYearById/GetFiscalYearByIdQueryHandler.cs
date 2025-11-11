using ERPEZ.Application.Features.Planning.FiscalYear.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Queries.GetFiscalYearById;

public class GetFiscalYearByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetFiscalYearByIdQuery, ApiResponse<FiscalYearResponse>>
{
    public async Task<ApiResponse<FiscalYearResponse>> Handle(GetFiscalYearByIdQuery request, CancellationToken cancellationToken)
    {
        var fy = await unitOfWork.FiscalYearRepository.GetWithAllocationsAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Fiscal year not found.");

        var dto = new FiscalYearResponse
        {
            Id = fy.Id,
            Year = fy.Year,
            Description = fy.Description,
            IsLocked = fy.IsLocked,
            FunctionAllocations = fy.FunctionAllocations.Select(a => new FunctionAllocationResponse
            {
                Id = a.Id,
                FunctionType = a.FunctionType,
                Percentage = a.Percentage
            }).ToList()
        };

        return ApiResponse<FiscalYearResponse>.Success(dto);
    }
}
