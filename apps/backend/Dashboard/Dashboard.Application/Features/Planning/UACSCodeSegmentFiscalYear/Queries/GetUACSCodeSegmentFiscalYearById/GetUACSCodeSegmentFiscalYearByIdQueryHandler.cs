using ERPEZ.Application.Features.Planning.UACSCodeSegmentFiscalYear.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSCodeSegmentFiscalYear.Queries.GetUACSCodeSegmentFiscalYearById;

/// <summary>
/// Handler for retrieving a single UACS code segment fiscal year association by ID.
/// </summary>
public class GetUACSCodeSegmentFiscalYearByIdQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetUACSCodeSegmentFiscalYearByIdQuery, ApiResponse<UACSCodeSegmentFiscalYearResponse>>
{
    public async Task<ApiResponse<UACSCodeSegmentFiscalYearResponse>> Handle(GetUACSCodeSegmentFiscalYearByIdQuery query, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.UACSCodeSegmentFiscalYearRepository.GetByIdAsync(query.Id, cancellationToken)
            ?? throw new NotFoundException("UACS code segment fiscal year association not found.");

        var response = new UACSCodeSegmentFiscalYearResponse
        {
            Id = entity.Id,
            UACSCodeSegmentId = entity.UACSCodeSegmentId,
            FiscalYearId = entity.FiscalYearId,
            EffectiveStartDate = entity.EffectiveStartDate,
            EffectiveEndDate = entity.EffectiveEndDate,
            IsActive = entity.IsActive,
            CreatedBy = entity.CreatedBy,
            CreatedAt = entity.CreatedAt
        };

        return ApiResponse<UACSCodeSegmentFiscalYearResponse>.Success(response, "UACS code segment fiscal year association retrieved successfully.");
    }
}
