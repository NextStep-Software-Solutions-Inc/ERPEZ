using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Commands.DeleteWFPObjectiveTargetExpenditure;

public class DeleteWFPObjectiveTargetExpenditureCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteWFPObjectiveTargetExpenditureCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteWFPObjectiveTargetExpenditureCommand request, CancellationToken cancellationToken)
    {
        var abr = await unitOfWork.WFPObjectiveTargetExpenditureRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("WFP Objective Target Expenditure not found.");

        unitOfWork.WFPObjectiveTargetExpenditureRepository.Remove(abr);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"WFP Objective Target Expenditure with ID {request.Id} deleted successfully.");
    }
}
