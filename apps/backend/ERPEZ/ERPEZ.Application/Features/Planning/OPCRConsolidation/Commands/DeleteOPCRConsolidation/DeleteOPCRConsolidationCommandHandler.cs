using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRConsolidation.Commands.DeleteOPCRConsolidation;

public class DeleteOPCRConsolidationCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteOPCRConsolidationCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(
        DeleteOPCRConsolidationCommand request, CancellationToken cancellationToken)
    {
        var consolidation = await unitOfWork.OPCRConsolidationRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("OPCR consolidation not found.");

        var opcrs = await unitOfWork.OPCRRepository.FindAllAsync(
            o => o.OPCRConsolidationId == consolidation.Id, cancellationToken);

        foreach (var opcr in opcrs)
        {
            opcr.OPCRConsolidationId = null;
            unitOfWork.OPCRRepository.Update(opcr);
        }

        unitOfWork.OPCRConsolidationRepository.Remove(consolidation);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "OPCR consolidation deleted successfully.");
    }
}