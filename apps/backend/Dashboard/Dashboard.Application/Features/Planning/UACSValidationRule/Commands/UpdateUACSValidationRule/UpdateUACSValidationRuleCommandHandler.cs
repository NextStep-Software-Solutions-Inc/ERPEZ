using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSValidationRule.Commands.UpdateUACSValidationRule;

public class UpdateUACSValidationRuleCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<UpdateUACSValidationRuleCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateUACSValidationRuleCommand request, CancellationToken cancellationToken)
    {
        var validationRule = await unitOfWork.UACSValidationRuleRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("UACS validation rule not found.");

        // Validate CodeSegmentId if provided
        if (request.UpdateUACSValidationRule.CodeSegmentId.HasValue)
        {
            var codeSegment = await unitOfWork.UACSCodeSegmentRepository.GetByIdAsync(
                request.UpdateUACSValidationRule.CodeSegmentId.Value, cancellationToken);
            
            if (codeSegment == null)
            {
                throw new NotFoundException($"UACS code segment with ID {request.UpdateUACSValidationRule.CodeSegmentId.Value} not found.");
            }
        }

        validationRule.RuleName = request.UpdateUACSValidationRule.RuleName;
        validationRule.Description = request.UpdateUACSValidationRule.Description;
        validationRule.CodeSegmentId = request.UpdateUACSValidationRule.CodeSegmentId;
        validationRule.SegmentType = request.UpdateUACSValidationRule.SegmentType;
        validationRule.ValidationExpression = request.UpdateUACSValidationRule.ValidationExpression;
        validationRule.ErrorMessage = request.UpdateUACSValidationRule.ErrorMessage;
        validationRule.IsActive = request.UpdateUACSValidationRule.IsActive;
        validationRule.Priority = request.UpdateUACSValidationRule.Priority;

        unitOfWork.UACSValidationRuleRepository.Update(validationRule);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "UACS validation rule updated successfully.");
    }
}
