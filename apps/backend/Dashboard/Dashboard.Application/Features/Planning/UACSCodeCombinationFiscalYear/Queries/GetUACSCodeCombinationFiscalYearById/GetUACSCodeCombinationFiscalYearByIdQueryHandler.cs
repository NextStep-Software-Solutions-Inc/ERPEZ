using ERPEZ.Application.Features.Planning.UACSCodeCombinationFiscalYear.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeCombinationFiscalYear.Queries.GetUACSCodeCombinationFiscalYearById;

/// <summary>
/// Handler for retrieving a single UACS code combination fiscal year association by ID.
/// </summary>
public class GetUACSCodeCombinationFiscalYearByIdQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetUACSCodeCombinationFiscalYearByIdQuery, ApiResponse<UACSCodeCombinationFiscalYearResponse>>
{
    public async Task<ApiResponse<UACSCodeCombinationFiscalYearResponse>> Handle(GetUACSCodeCombinationFiscalYearByIdQuery query, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.UACSCodeCombinationFiscalYearRepository.GetByIdAsync(query.Id, cancellationToken)
            ?? throw new NotFoundException("UACS code combination fiscal year association not found.");

        var response = new UACSCodeCombinationFiscalYearResponse
        {
            Id = entity.Id,
            UACSCodeCombinationId = entity.UACSCodeCombinationId,
            FiscalYearId = entity.FiscalYearId,
            IsValidFrom = entity.IsValidFrom,
            IsValidTo = entity.IsValidTo,
            IsActive = entity.IsActive,
            CreatedBy = entity.CreatedBy,
            CreatedAt = entity.CreatedAt
        };

        return ApiResponse<UACSCodeCombinationFiscalYearResponse>.Success(response, "UACS code combination fiscal year association retrieved successfully.");
    }
}
