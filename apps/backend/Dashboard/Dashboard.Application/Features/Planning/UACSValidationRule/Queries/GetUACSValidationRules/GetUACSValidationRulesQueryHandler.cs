using ERPEZ.Application.Features.Planning.UACSValidationRule.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.UACSValidationRule.Queries.GetUACSValidationRules;

public class GetUACSValidationRulesQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetUACSValidationRulesQuery, PaginatedApiResponse<UACSValidationRuleResponse>>
{
    public async Task<PaginatedApiResponse<UACSValidationRuleResponse>> Handle(GetUACSValidationRulesQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.UACSValidationRule, UACSValidationRuleResponse>> projection = validationRule => new UACSValidationRuleResponse
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
        };

        var (validationRules, totalCount) = await unitOfWork.UACSValidationRuleRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<UACSValidationRuleResponse>(
            [.. validationRules],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
