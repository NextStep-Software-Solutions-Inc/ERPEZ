// UpdateOPCRConsolidationNameCommandHandler.cs
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using ERPEZ.Application.Features.Planning.OPCRConsolidation.Commands.UpdateOPCRConsolidation;

namespace ERPEZ.Application.Features.Planning.OPCRConsolidation.Commands.UpdateOPCRConsolidation;

public class UpdateOPCRConsolidationNameCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateOPCRConsolidationNameCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(
        UpdateOPCRConsolidationNameCommand request, CancellationToken cancellationToken)
    {
        var consolidation = await unitOfWork.OPCRConsolidationRepository
            .GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("OPCR Consolidation not found.");

        consolidation.Name      = request.Request.Name;
        consolidation.UpdatedAt = DateTime.UtcNow;

        unitOfWork.OPCRConsolidationRepository.Update(consolidation);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Consolidation name updated successfully.");
    }
}