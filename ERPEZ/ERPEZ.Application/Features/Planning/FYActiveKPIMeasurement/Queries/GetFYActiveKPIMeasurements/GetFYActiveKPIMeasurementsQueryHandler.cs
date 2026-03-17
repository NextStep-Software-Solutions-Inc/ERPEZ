using ERPEZ.Application.Features.Planning.FYActiveKPIMeasurement.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.FYActiveKPIMeasurement.Queries.GetFYActiveKPIMeasurements;

public class GetFYActiveKPIMeasurementsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetFYActiveKPIMeasurementsQuery, PaginatedApiResponse<FYActiveKPIMeasurementResponse>>
{
    public async Task<PaginatedApiResponse<FYActiveKPIMeasurementResponse>> Handle(GetFYActiveKPIMeasurementsQuery request, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            PageSize = request.PageSize,
            Page = request.PageNumber,
            Filters = request.Filters,
            Sorts = request.Sorts
        };

        Expression<Func<Domain.Entities.Planning.FYActiveKPIMeasurement, FYActiveKPIMeasurementResponse>> projection = measurement => new FYActiveKPIMeasurementResponse
        {
            Id = measurement.Id,
            FYActiveKPIId = measurement.FYActiveKPIId,
            Dimension = measurement.Dimension,
            RatingScaleTemplateId = measurement.RatingScaleTemplateId,
            MOVs = measurement.MOVs,
            IsMOVEditable = measurement.IsMOVEditable,
            IsScaleEditable = measurement.IsScaleEditable,
        };

        var (items, totalCount) = await unitOfWork.FYActiveKPIMeasurementRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);

        return new PaginatedApiResponse<FYActiveKPIMeasurementResponse>([.. items], request.PageNumber, request.PageSize, totalCount);
    }
}
