using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRKPI.Commands.DeleteOPCRKPI;

public class DeleteOPCRKPICommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteOPCRKPICommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteOPCRKPICommand request, CancellationToken cancellationToken)
    {
        var opcrKpi = await unitOfWork.OPCRKPIRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("OPCR KPI not found.");

        unitOfWork.OPCRKPIRepository.Remove(opcrKpi);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"OPCR KPI with ID {request.Id} deleted successfully.");
    }
}
