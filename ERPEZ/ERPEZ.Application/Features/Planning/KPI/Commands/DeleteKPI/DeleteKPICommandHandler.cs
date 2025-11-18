using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPI.Commands.DeleteKPI;

public class DeleteKPICommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteKPICommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteKPICommand request, CancellationToken cancellationToken)
    {
        var kpi = await unitOfWork.KPIRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("KPI not found.");

        unitOfWork.KPIRepository.Remove(kpi);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"KPI with ID {request.Id} deleted successfully.");
    }
}
