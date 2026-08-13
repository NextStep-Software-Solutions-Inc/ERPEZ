using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PerformanceMeasure.Commands.UpdatePM;

public class UpdatePerformanceMeasureCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdatePerformanceMeasureCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdatePerformanceMeasureCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdatePerformanceMeasure;

        var pm = await unitOfWork.PerformanceMeasureRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("Performance Measure not found.");

        pm.Name = dto.Name ?? pm.Name;
        pm.Description = dto.Description ?? pm.Description;

        unitOfWork.PerformanceMeasureRepository.Update(pm);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Performance Measure updated successfully.");
    }
}
