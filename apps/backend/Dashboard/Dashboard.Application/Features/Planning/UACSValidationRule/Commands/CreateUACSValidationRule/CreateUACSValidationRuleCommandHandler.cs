using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSValidationRule.Commands.CreateUACSValidationRule;

public class CreateUACSValidationRuleCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<CreateUACSValidationRuleCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateUACSValidationRuleCommand request, CancellationToken cancellationToken)
    {
        // Check if validation rule with same name already exists
        var existing = await unitOfWork.UACSValidationRuleRepository.FindAsync(
            r => r.RuleName == request.RuleName, cancellationToken);
        
        if (existing != null)
        {
            throw new ConflictException($"UACS validation rule with name '{request.RuleName}' already exists.");
        }

        // Validate CodeSegmentId if provided
        if (request.CodeSegmentId.HasValue)
        {
            var codeSegment = await unitOfWork.UACSCodeSegmentRepository.GetByIdAsync(request.CodeSegmentId.Value, cancellationToken);
            if (codeSegment == null)
            {
                throw new NotFoundException($"UACS code segment with ID {request.CodeSegmentId.Value} not found.");
            }
        }

        var validationRule = new Domain.Entities.Planning.UACSValidationRule
        {
            RuleName = request.RuleName,
            Description = request.Description,
            CodeSegmentId = request.CodeSegmentId,
            SegmentType = request.SegmentType,
            ValidationExpression = request.ValidationExpression,
            ErrorMessage = request.ErrorMessage,
            IsActive = request.IsActive,
            Priority = request.Priority
        };

        await unitOfWork.UACSValidationRuleRepository.AddAsync(validationRule, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(validationRule.Id, "UACS validation rule created successfully.");
    }
}
