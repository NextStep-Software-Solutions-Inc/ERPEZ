using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIMeasurement.Commands.DeleteKPIMeasurement;

public class DeleteKPIMeasurementCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteKPIMeasurementCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteKPIMeasurementCommand request, CancellationToken cancellationToken)
    {
        var measurement = await unitOfWork.KPIMeasurementRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("KPI Measurement not found.");

        unitOfWork.KPIMeasurementRepository.Remove(measurement);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "KPI Measurement deleted successfully.");
    }
}
