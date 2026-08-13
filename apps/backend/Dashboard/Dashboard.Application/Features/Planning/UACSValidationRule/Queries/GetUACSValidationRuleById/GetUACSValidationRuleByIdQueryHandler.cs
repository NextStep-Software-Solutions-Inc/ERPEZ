using ERPEZ.Application.Features.Planning.UACSValidationRule.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSValidationRule.Queries.GetUACSValidationRuleById;

public class GetUACSValidationRuleByIdQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetUACSValidationRuleByIdQuery, ApiResponse<UACSValidationRuleResponse>>
{
    public async Task<ApiResponse<UACSValidationRuleResponse>> Handle(GetUACSValidationRuleByIdQuery request, CancellationToken cancellationToken)
    {
        var query = unitOfWork.UACSValidationRuleRepository.Query(r => r.Id == request.Id)
            .Select(validationRule => new UACSValidationRuleResponse
            {
                Id = validationRule.Id,
                RuleName = validationRule.RuleName,
                Description = validationRule.Description,
                CodeSegmentId = validationRule.CodeSegmentId,
                SegmentType = validationRule.SegmentType,
                ValidationExpression = validationRule.ValidationExpression,
                ErrorMessage = validationRule.ErrorMessage,
                IsActive = validationRule.IsActive,
                Priority = validationRule.Priority,
                CreatedBy = validationRule.CreatedBy,
                CreatedAt = validationRule.CreatedAt
            });

        var result = await unitOfWork.UACSValidationRuleRepository.GetFirstAsync(query, cancellationToken) 
            ?? throw new NotFoundException("UACS validation rule not found.");

        return ApiResponse<UACSValidationRuleResponse>.Success(result, "Retrieved successfully");
    }
}
