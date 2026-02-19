using ERPEZ.Application.Features.Planning.GeneralRatingScale.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Planning.GeneralRatingScale.Queries.GetGeneralRatingScaleById;

public class GetGeneralRatingScaleByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetGeneralRatingScaleByIdQuery, ApiResponse<GeneralRatingScaleResponse>>
{
    public async Task<ApiResponse<GeneralRatingScaleResponse>> Handle(GetGeneralRatingScaleByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.GeneralRatingScaleRepository.Query()
            .Include(x => x.FiscalYear)
            .FirstOrDefaultAsync(x => x.Id == request.Id && !x.IsDeleted, cancellationToken);

        if (entity == null)
            throw new NotFoundException("General Rating Scale not found.");

        var response = new GeneralRatingScaleResponse
        {
            Id = entity.Id,
            FiscalYearId = entity.FiscalYearId,
            FiscalYearYear = entity.FiscalYear?.Year ?? 0,
            AdjectivalRatingName = entity.AdjectivalRatingName,
            MinScore = entity.MinScore,
            MaxScore = entity.MaxScore,
            CreatedAt = entity.CreatedAt,
            CreatedBy = entity.CreatedBy,
            UpdatedAt = entity.UpdatedAt,
            UpdatedBy = entity.UpdatedBy
        };

        return ApiResponse<GeneralRatingScaleResponse>.Success(response);
    }
}
