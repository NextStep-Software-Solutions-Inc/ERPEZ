using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PerformanceMeasure.Commands.UpdatePM;

public class UpdatePerformanceMeasureCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdatePerformanceMeasureCommand, ApiResponse<Domain.Entities.Planning.PerformanceMeasure>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.PerformanceMeasure>> Handle(UpdatePerformanceMeasureCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdatePerformanceMeasure;

        var pm = await unitOfWork.PerformanceMeasureRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("Performance Measure not found.");

        pm.Name = dto.Name ?? pm.Name;
        pm.Description = dto.Description ?? pm.Description;

        unitOfWork.PerformanceMeasureRepository.Update(pm);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Domain.Entities.Planning.PerformanceMeasure>.Success(pm, "Performance Measure updated successfully.");
    }
}
