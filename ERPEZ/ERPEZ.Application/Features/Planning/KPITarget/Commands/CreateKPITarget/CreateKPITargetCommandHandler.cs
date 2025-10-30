using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPITarget.Commands.CreateKPITarget;

public class CreateKPITargetCommandHandler(IUnitOfWork _unitOfWork)
    : IRequestHandler<CreateKPITargetCommand, ApiResponse<Domain.Entities.Planning.KPITarget>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.KPITarget>> Handle(CreateKPITargetCommand request, CancellationToken cancellationToken)
    {
        if ( request.KPIId == Guid.Empty)
        {
            return new ApiResponse<Domain.Entities.Planning.KPITarget>
            {
                Message = "KPI are required.",
                Succeeded = false
            };
        }
        var kPITarget = await _unitOfWork.KPITargetRepository.FindAsync(
            t => t.KPIId == request.KPIId && t.QuarterName == request.QuarterName,
            cancellationToken: cancellationToken
        );

        if (kPITarget != null)
            throw new ConflictException("KPI Target already exists.");

        if (request.KPIId != Guid.Empty)
        {
            var kpi = await _unitOfWork.KPIRepository.GetByIdAsync(request.KPIId, cancellationToken: cancellationToken)
                ?? throw new NotFoundException("KPI not found.");
        }

        var kpiTarget = new Domain.Entities.Planning.KPITarget
        {
            KPIId = request.KPIId,
            TargetValue = request.TargetValue,
            Period = request.Period,
            QuarterName = request.QuarterName
        };

        await _unitOfWork.KPITargetRepository.AddAsync(kpiTarget, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<Domain.Entities.Planning.KPITarget>.Success(kpiTarget, "KPI Target created successfully.");
    }
}