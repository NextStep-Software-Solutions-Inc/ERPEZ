using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.Projects.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Projects.Queries.GetProcurementProjects;

public class GetProcurementProjectsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetProcurementProjectsQuery, PaginatedApiResponse<ProcurementProjectResponse>>
{
    public async Task<PaginatedApiResponse<ProcurementProjectResponse>> Handle(GetProcurementProjectsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Procurement.ProcurementProject, ProcurementProjectResponse>> projection = c => new ProcurementProjectResponse
        {
            Id = c.Id,
            Title = c.Title,
            ConsolidatedPRId = c.ConsolidatedPRId,
            ModeOfProcurementId = c.ModeOfProcurementId,
            ModeOfProcurementName = c.ModeOfProcurement != null ? c.ModeOfProcurement.Name : string.Empty,
            ABC = c.ABC,
            Status = c.Status,
            BACResolutions = c.BACResolutions.Select(r => new BACResolutionResponse
            {
                Id = r.Id,
                ProcurementProjectId = r.ProcurementProjectId,
                ResolutionType = r.ResolutionType,
                ResolutionNumber = r.ResolutionNumber,
                DateResolved = r.DateResolved,
                Status = r.Status,
                WhereasClause = r.WhereasClause
            }).ToList(),
            BiddingActivitySchedules = c.BiddingActivitySchedules.Select(s => new BiddingActivityScheduleResponse
            {
                Id = s.Id,
                ProcurementProjectId = s.ProcurementProjectId,
                ActivityType = s.ActivityType,
                StartDate = s.StartDate,
                EndDate = s.EndDate,
                Venue = s.Venue
            }).ToList()
        };

        var (entities, totalCount) = await unitOfWork.ProcurementProjectRepository.GetAllAsync(
            sieveModel,
            projection,
            cancellationToken: cancellationToken);

        return new PaginatedApiResponse<ProcurementProjectResponse>(
            [.. entities],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
