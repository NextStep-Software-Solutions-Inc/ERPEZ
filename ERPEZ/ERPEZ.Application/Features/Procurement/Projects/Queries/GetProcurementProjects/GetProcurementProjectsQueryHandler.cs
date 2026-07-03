using System.Linq.Expressions;
using ERPEZ.Application.Features.Procurement.Projects.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Services;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.Projects.Queries.GetProcurementProjects;

public class GetProcurementProjectsQueryHandler(IUnitOfWork unitOfWork, ISieveProcessor sieveProcessor)
    : IRequestHandler<GetProcurementProjectsQuery, PaginatedApiResponse<ProcurementProjectResponse>>
{
    public async Task<PaginatedApiResponse<ProcurementProjectResponse>> Handle(GetProcurementProjectsQuery query, CancellationToken cancellationToken)
    {
        var dbQuery = unitOfWork.ProcurementProjectRepository.Query()
            .Where(p => !p.IsDeleted)
            .AsQueryable();

        // Apply custom filters for ModeOfProcurement - REMOVED

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
            ConsolidatedPR = c.ConsolidatedPR != null ? new ConsolidatedPRSummaryResponse
            {
                Id = c.ConsolidatedPR.Id,
                CPRNumber = c.ConsolidatedPR.CPRNumber,
                Description = c.ConsolidatedPR.Description ?? string.Empty,
                ModeOfProcurementId = c.ConsolidatedPR.ConsolidatedPRItems
                    .Where(ci => ci.ProcurementModeId != null)
                    .Select(ci => ci.ProcurementModeId)
                    .FirstOrDefault(),
                ModeOfProcurementName = c.ConsolidatedPR.ConsolidatedPRItems
                    .Where(ci => ci.ProcurementMode != null)
                    .Select(ci => ci.ProcurementMode!.Name)
                    .FirstOrDefault() ?? string.Empty
            } : null,
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
                ProcurementActivityTypeId = s.ProcurementActivityTypeId,
                ProcurementActivityTypeName = s.ProcurementActivityType != null ? s.ProcurementActivityType.Name : string.Empty,
                StartDate = s.StartDate,
                EndDate = s.EndDate,
                Venue = s.Venue,
                Status = s.Status,
                Remarks = s.Remarks
            }).ToList()
        };

        var filteredQuery = sieveProcessor.Apply(sieveModel, dbQuery, applyPagination: false);
        var totalCount = await filteredQuery.CountAsync(cancellationToken);

        var paginatedQuery = sieveProcessor.Apply(sieveModel, filteredQuery, applyFiltering: false, applySorting: false);
        var entities = await paginatedQuery.Select(projection).ToListAsync(cancellationToken);

        return new PaginatedApiResponse<ProcurementProjectResponse>(
            [.. entities],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
