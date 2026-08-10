using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.ConsolidatedPR;

public class UpdateConsolidatedPRItemCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateConsolidatedPRItemCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateConsolidatedPRItemCommand request, CancellationToken cancellationToken)
    {
        var cprItem = await unitOfWork.ConsolidatedPRItemRepository.GetByIdAsync(
            request.ConsolidatedPRItemId, cancellationToken)
            ?? throw new NotFoundException($"Consolidated PR Item with ID {request.ConsolidatedPRItemId} not found.");

        if (request.Dto.ProcurementModeId.HasValue)
            _ = await unitOfWork.ProcurementModeRepository.GetByIdAsync(
                request.Dto.ProcurementModeId.Value, cancellationToken)
                ?? throw new NotFoundException($"Procurement Mode with ID {request.Dto.ProcurementModeId.Value} not found.");

        cprItem.ProcurementModeId = request.Dto.ProcurementModeId;
        cprItem.AllowPartial      = request.Dto.AllowPartial;

        unitOfWork.ConsolidatedPRItemRepository.Update(cprItem);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Consolidated PR item updated.");
    }
}