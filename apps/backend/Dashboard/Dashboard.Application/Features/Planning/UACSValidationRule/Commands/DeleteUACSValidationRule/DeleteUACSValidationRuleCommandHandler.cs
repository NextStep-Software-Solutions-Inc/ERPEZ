using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSValidationRule.Commands.DeleteUACSValidationRule;

public class DeleteUACSValidationRuleCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<DeleteUACSValidationRuleCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteUACSValidationRuleCommand request, CancellationToken cancellationToken)
    {
        var validationRule = await unitOfWork.UACSValidationRuleRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("UACS validation rule not found.");

        unitOfWork.UACSValidationRuleRepository.Remove(validationRule);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"UACS validation rule with ID {request.Id} deleted successfully.");
    }
}
