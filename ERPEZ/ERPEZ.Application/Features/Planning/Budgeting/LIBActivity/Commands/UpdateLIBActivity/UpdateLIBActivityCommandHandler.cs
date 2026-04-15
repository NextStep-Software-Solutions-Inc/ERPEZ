using ERPEZ.Application.Features.Planning.Budgeting.LIBActivity.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBActivity.Commands.UpdateLIBActivity;

public class UpdateLIBActivityCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateLIBActivityCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateLIBActivityCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        var entity = await unitOfWork.LineItemBudgetActivityRepository.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException($"LIB Activity with ID {command.Id} not found.");

        var lib = await unitOfWork.LineItemBudgetRepository.GetByIdAsync(request.LineItemBudgetId, cancellationToken)
            ?? throw new NotFoundException($"LIB with ID {request.LineItemBudgetId} not found.");

        if (request.WFPObjectiveActivityId.HasValue && request.OPCRActivityId.HasValue)
        {
            throw new ERPEZ.Shared.Exceptions.ValidationException("Only one source activity reference is allowed (either WFPObjectiveActivityId or OPCRActivityId).");
        }

        if (lib.SourceType.Equals("WFP", StringComparison.OrdinalIgnoreCase))
        {
            if (!request.WFPObjectiveActivityId.HasValue)
                throw new ERPEZ.Shared.Exceptions.ValidationException("WFPObjectiveActivityId is required for WFP-sourced LIB.");

            _ = await unitOfWork.WFPObjectiveActivityRepository.GetByIdAsync(request.WFPObjectiveActivityId.Value, cancellationToken)
                ?? throw new NotFoundException($"WFP Objective Activity with ID {request.WFPObjectiveActivityId} not found.");
        }
        else if (lib.SourceType.Equals("OPCR", StringComparison.OrdinalIgnoreCase))
        {
            if (!request.OPCRActivityId.HasValue)
                throw new ERPEZ.Shared.Exceptions.ValidationException("OPCRActivityId is required for OPCR-sourced LIB.");

            _ = await unitOfWork.OPCRActivityRepository.GetByIdAsync(request.OPCRActivityId.Value, cancellationToken)
                ?? throw new NotFoundException($"OPCR Activity with ID {request.OPCRActivityId} not found.");
        }

        entity.LineItemBudgetId = request.LineItemBudgetId;
        entity.WFPObjectiveActivityId = request.WFPObjectiveActivityId;
        entity.OPCRActivityId = request.OPCRActivityId;
        entity.Name = request.Name;

        unitOfWork.LineItemBudgetActivityRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "LIB Activity updated successfully.");
    }
}

