using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PerformanceMeasure.Commands.DeletePM;

public class DeletePerformanceMeasureCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeletePerformanceMeasureCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeletePerformanceMeasureCommand request, CancellationToken cancellationToken)
    {
        var pm = await unitOfWork.PerformanceMeasureRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Performance Measure not found.");

        unitOfWork.PerformanceMeasureRepository.Remove(pm);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"Performance Measure with ID {request.Id} deleted successfully.");
    }
}
