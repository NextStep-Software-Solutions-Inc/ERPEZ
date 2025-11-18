using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjective.Commands.DeleteWFPObjective;

public class DeleteWFPObjectiveCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteWFPObjectiveCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteWFPObjectiveCommand request, CancellationToken cancellationToken)
    {
        var wfpObjective = await unitOfWork.WFPObjectiveRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("WFP Objective not found.");

        unitOfWork.WFPObjectiveRepository.Remove(wfpObjective);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"WFP Objective with ID {request.Id} deleted successfully.");
    }
}
