using ERPEZ.Application.Features.Planning.ProcurementActivityType.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using Sieve.Services;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.ProcurementActivityType.Queries.GetProcurementActivityTypes;

public class GetProcurementActivityTypesQueryHandler(IUnitOfWork unitOfWork, ISieveProcessor sieveProcessor)
    : IRequestHandler<GetProcurementActivityTypesQuery, PaginatedApiResponse<ProcurementActivityTypeResponse>>
{
    public async Task<PaginatedApiResponse<ProcurementActivityTypeResponse>> Handle(
        GetProcurementActivityTypesQuery request,
        CancellationToken cancellationToken)
    {
        Expression<Func<Domain.Entities.Planning.ProcurementActivityType, ProcurementActivityTypeResponse>> projection = x => new ProcurementActivityTypeResponse
        {
            Id = x.Id,
            Name = x.Name,
            ActivityCode = x.ActivityCode,
            Description = x.Description,
            MinDays = x.MinDays,
            MaxDays = x.MaxDays,
            IsActive = x.IsActive,
            CreatedAt = x.CreatedAt,
            UpdatedAt = x.UpdatedAt
        };

        var query = unitOfWork.ProcurementActivityTypeRepository.Query()
            .Where(x => !x.IsDeleted)
            .AsQueryable();

        var sieveModel = new SieveModel
        {
            Filters = request.Filters,
            Sorts = request.Sorts,
            PageSize = request.PageSize,
            Page = request.Page
        };

        var totalCount = query.Count();
        var items = sieveProcessor.Apply(sieveModel, query)
            .Select(projection)
            .ToList();

        return new PaginatedApiResponse<ProcurementActivityTypeResponse>(items, request.Page, request.PageSize, totalCount);
    }
}
