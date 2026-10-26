using ERPEZ.Application.Features.Planning.GeneralRatingScale.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.GeneralRatingScale.Queries.GetGeneralRatingScales;

public class GetGeneralRatingScalesQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetGeneralRatingScalesQuery, PaginatedApiResponse<GeneralRatingScaleResponse>>
{
    public async Task<PaginatedApiResponse<GeneralRatingScaleResponse>> Handle(GetGeneralRatingScalesQuery request, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            Filters = request.Filters,
            Sorts = request.Sorts,
            Page = request.Page,
            PageSize = request.PageSize
        };

        Expression<Func<Domain.Entities.Planning.GeneralRatingScale, GeneralRatingScaleResponse>> projection = grs => new GeneralRatingScaleResponse
        {
            Id = grs.Id,
            FiscalYearId = grs.FiscalYearId,
            FiscalYearYear = grs.FiscalYear != null ? grs.FiscalYear.Year : 0,
            AdjectivalRatingName = grs.AdjectivalRatingName,
            MinScore = grs.MinScore,
            MaxScore = grs.MaxScore,
            CreatedAt = grs.CreatedAt,
            CreatedBy = grs.CreatedBy,
            UpdatedAt = grs.UpdatedAt,
            UpdatedBy = grs.UpdatedBy
        };

        var (items, totalCount) = await unitOfWork.GeneralRatingScaleRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);

        return new PaginatedApiResponse<GeneralRatingScaleResponse>(items.ToList(), request.Page ?? 1, request.PageSize ?? 10, totalCount);
    }
}
