using ERPEZ.Application.Features.Planning.FunctionConfig.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Planning.FunctionConfig.Queries.GetFunctionConfigById;

public class GetFunctionConfigByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetFunctionConfigByIdQuery, ApiResponse<FunctionConfigResponse>>
{
    public async Task<ApiResponse<FunctionConfigResponse>> Handle(GetFunctionConfigByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.FunctionConfigRepository.Query()
            .Include(x => x.FiscalYear)
            .FirstOrDefaultAsync(x => x.Id == request.Id && !x.IsDeleted, cancellationToken);

        if (entity == null)
            throw new NotFoundException("Function Configuration not found.");

        var response = new FunctionConfigResponse
        {
            Id = entity.Id,
            FiscalYearId = entity.FiscalYearId,
            FiscalYearYear = entity.FiscalYear?.Year ?? 0,
            StrategicMinWeight = entity.StrategicMinWeight,
            StrategicMaxWeight = entity.StrategicMaxWeight,
            CoreFunctionMinWeight = entity.CoreFunctionMinWeight,
            CoreFunctionMaxWeight = entity.CoreFunctionMaxWeight,
            SupportMinWeight = entity.SupportMinWeight,
            SupportMaxWeight = entity.SupportMaxWeight,
            CreatedAt = entity.CreatedAt,
            CreatedBy = entity.CreatedBy,
            UpdatedAt = entity.UpdatedAt,
            UpdatedBy = entity.UpdatedBy
        };

        return ApiResponse<FunctionConfigResponse>.Success(response);
    }
}
