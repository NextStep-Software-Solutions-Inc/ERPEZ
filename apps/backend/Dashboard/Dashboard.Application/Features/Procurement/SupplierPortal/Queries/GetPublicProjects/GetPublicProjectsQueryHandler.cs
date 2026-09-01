using ERPEZ.Application.Features.Procurement.SupplierPortal.Dtos;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetPublicProjects;

public class GetPublicProjectsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPublicProjectsQuery, PaginatedApiResponse<PublicProjectListItemDto>>
{
    public async Task<PaginatedApiResponse<PublicProjectListItemDto>> Handle(
        GetPublicProjectsQuery query, CancellationToken cancellationToken)
    {
        // Public visibility gate: support Posted, Routed to portal, and active public projects
        var gateFilter = "Status==Posted|Status==ROUTED_TO_PORTAL|Status==Active|Status==Published|Status==Open|Status==ClosingSoon";
        
        var filterList = new List<string> { gateFilter };

        if (!string.IsNullOrWhiteSpace(query.Filters))
        {
            filterList.Add(query.Filters);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            filterList.Add($"Title@=*{query.Search}*|ContractNo@=*{query.Search}*");
        }

        var combinedFilters = string.Join(",", filterList);

        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize > 0 ? query.PageSize : 50,
            Page     = query.PageNumber > 0 ? query.PageNumber : 1,
            Filters  = combinedFilters,
            Sorts    = query.Sorts
        };

        Expression<Func<ProcurementProject, PublicProjectListItemDto>> projection = p => new PublicProjectListItemDto
        {
            Id                = p.Id,
            Title             = p.Title,
            ContractNo        = p.ContractNo ?? (p.ConsolidatedPR != null ? p.ConsolidatedPR.CPRNumber : string.Empty),
            ABC               = p.ABC,
            ModeOfProcurement = p.ProcurementMode != null ? p.ProcurementMode.Name : string.Empty,
            Status            = p.Status,

            SubmissionDeadline = p.BiddingActivitySchedules
                .Where(s => s.ProcurementActivityType.SystemRole == ProcurementActivitySystemRole.SubmissionOpeningOfBids)
                .Select(s => (DateTime?)s.StartDate)
                .FirstOrDefault(),

            DatePosted = p.BiddingActivitySchedules
                .Where(s => s.ProcurementActivityType.SystemRole == ProcurementActivitySystemRole.AdvertisementPosting)
                .Select(s => (DateTime?)s.StartDate)
                .FirstOrDefault()
        };

        var (projects, totalCount) = await unitOfWork.ProcurementProjectRepository.GetAllAsync(
            sieveModel, projection, cancellationToken);

        var projectList = projects.ToList();

        // Optional post-filter by mode if passed as parameter
        if (!string.IsNullOrWhiteSpace(query.Mode))
        {
            var targetMode = query.Mode.Trim().ToLowerInvariant();
            projectList = projectList.Where(p => 
                p.ModeOfProcurement.ToLowerInvariant().Contains(targetMode) ||
                (targetMode.Contains("svp") && p.ModeOfProcurement.ToLowerInvariant().Contains("small value")) ||
                (targetMode.Contains("small value") && p.ModeOfProcurement.ToLowerInvariant().Contains("svp"))
            ).ToList();
            totalCount = projectList.Count;
        }

        return new PaginatedApiResponse<PublicProjectListItemDto>(
            projectList,
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}