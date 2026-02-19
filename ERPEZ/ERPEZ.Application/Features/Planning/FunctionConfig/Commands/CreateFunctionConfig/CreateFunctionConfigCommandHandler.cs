using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FunctionConfig.Commands.CreateFunctionConfig;

public class CreateFunctionConfigCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateFunctionConfigCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateFunctionConfigCommand request, CancellationToken cancellationToken)
    {
        // Verify fiscal year exists
        var fiscalYear = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId, cancellationToken);
        if (fiscalYear == null)
            throw new NotFoundException("Fiscal Year not found.");

        // Check if function config already exists for this fiscal year
        var existingConfig = await unitOfWork.FunctionConfigRepository.FindAsync(
            x => x.FiscalYearId == request.FiscalYearId, cancellationToken);

        if (existingConfig != null)
            throw new ConflictException("Function Configuration already exists for this Fiscal Year.");

        var entity = new Domain.Entities.Planning.FunctionConfig
        {
            Id = Guid.NewGuid(),
            FiscalYearId = request.FiscalYearId,
            StrategicMinWeight = request.StrategicMinWeight,
            StrategicMaxWeight = request.StrategicMaxWeight,
            CoreFunctionMinWeight = request.CoreFunctionMinWeight,
            CoreFunctionMaxWeight = request.CoreFunctionMaxWeight,
            SupportMinWeight = request.SupportMinWeight,
            SupportMaxWeight = request.SupportMaxWeight
        };

        await unitOfWork.FunctionConfigRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id);
    }
}
