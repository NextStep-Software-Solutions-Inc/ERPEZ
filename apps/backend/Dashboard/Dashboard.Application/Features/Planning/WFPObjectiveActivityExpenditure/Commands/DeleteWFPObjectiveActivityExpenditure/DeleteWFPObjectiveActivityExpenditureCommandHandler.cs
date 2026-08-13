using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Commands.DeleteWFPObjectiveActivityExpenditure;

public class DeleteWFPObjectiveActivityExpenditureCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteWFPObjectiveActivityExpenditureCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteWFPObjectiveActivityExpenditureCommand request, CancellationToken cancellationToken)
    {
        var abr = await unitOfWork.WFPObjectiveActivityExpenditureRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("WFP Objective Target Expenditure not found.");

        unitOfWork.WFPObjectiveActivityExpenditureRepository.Remove(abr);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"WFP Objective Target Expenditure with ID {request.Id} deleted successfully.");
    }
}
