using ERPEZ.Application.Features.Planning.PlantillaType.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.PlantillaType.Queries.GetPlantillaTypes;

public class GetPlantillaTypesQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPlantillaTypesQuery, PaginatedApiResponse<PlantillaTypeResponse>>
{
    public async Task<PaginatedApiResponse<PlantillaTypeResponse>> Handle(GetPlantillaTypesQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.PlantillaType, PlantillaTypeResponse>> projection = e => new PlantillaTypeResponse
        {
            Id = e.Id,
            Name = e.Name,
            Code = e.Code,
            Duration = e.Duration,
            RequiresActingAppointments = e.RequiresActingAppointments,
            AllowsContractual = e.AllowsContractual,
            IsActive = e.IsActive,
            Benefits = e.Benefits,
            CreatedAt = e.CreatedAt
        };

        var (plantillaTypes, totalCount) = await unitOfWork.PlantillaTypeRepository.GetAllAsync(
            sieveModel,
            projection,
            cancellationToken: cancellationToken);

        return new PaginatedApiResponse<PlantillaTypeResponse>(
            [.. plantillaTypes],
            query.PageNumber,
            query.PageSize,
            totalCount
        );
    }
}
