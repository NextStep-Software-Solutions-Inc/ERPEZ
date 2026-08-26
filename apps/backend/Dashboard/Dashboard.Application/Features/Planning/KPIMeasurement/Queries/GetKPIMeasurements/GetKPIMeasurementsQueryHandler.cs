using ERPEZ.Application.Features.Planning.KPIMeasurement.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.KPIMeasurement.Queries.GetKPIMeasurements;

public class GetKPIMeasurementsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetKPIMeasurementsQuery, PaginatedApiResponse<KPIMeasurementResponse>>
{
    public async Task<PaginatedApiResponse<KPIMeasurementResponse>> Handle(GetKPIMeasurementsQuery request, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            PageSize = request.PageSize,
            Page = request.PageNumber,
            Filters = request.Filters,
            Sorts = request.Sorts
        };

        Expression<Func<Domain.Entities.Planning.KPIMeasurement, KPIMeasurementResponse>> projection = measurement => new KPIMeasurementResponse
        {
            Id = measurement.Id,
            KPIId = measurement.KPIId,
            Name = measurement.Name,
            Statement = measurement.Statement,
            Dimensions = measurement.Dimensions,
            RatingScaleTemplateId = measurement.RatingScaleTemplateId,
            MOVs = measurement.MOVs,
            IsMOVEditable = measurement.IsMOVEditable,
            IsScaleEditable = measurement.IsScaleEditable,
            CreatedAt = measurement.CreatedAt,
            CreatedBy = measurement.CreatedBy,
        };

        var (items, totalCount) = await unitOfWork.KPIMeasurementRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);

        return new PaginatedApiResponse<KPIMeasurementResponse>([.. items], request.PageNumber, request.PageSize, totalCount);
    }
}
