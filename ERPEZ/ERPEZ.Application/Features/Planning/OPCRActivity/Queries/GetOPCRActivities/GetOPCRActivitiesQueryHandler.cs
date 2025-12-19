using System.Linq.Expressions;
using ERPEZ.Application.Features.Planning.OPCRActivity.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivity.Queries.GetOPCRActivities;

public class GetOPCRActivitiesQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetOPCRActivitiesQuery, PaginatedApiResponse<OPCRActivityResponse>>
{
    public async Task<PaginatedApiResponse<OPCRActivityResponse>> Handle(GetOPCRActivitiesQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.OPCRActivity, OPCRActivityResponse>> projection = a => new OPCRActivityResponse
        {
            Id = a.Id,
            OPCRId = a.OPCRId,
            DUKPIAssignmentId = a.DUKPIAssignmentId,
            Name = a.Name,
            Description = a.Description,
            Budget = a.Budget,
            PAPDepartments = a.OPCRPAPDepartments.Select(p => p.DeliveryUnitId).ToList()
        };

        var (opcrActivities, totalCount) = await unitOfWork.OPCRActivityRepository.GetAllAsync(
            sieveModel,
            projection,
            cancellationToken);

        return new PaginatedApiResponse<OPCRActivityResponse>(
            [.. opcrActivities],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
