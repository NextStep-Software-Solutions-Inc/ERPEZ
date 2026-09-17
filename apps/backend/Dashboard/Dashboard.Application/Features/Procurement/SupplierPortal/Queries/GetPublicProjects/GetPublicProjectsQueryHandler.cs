using ERPEZ.Application.Features.Procurement.SupplierPortal.Dtos;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetPublicProjects;

public class GetPublicProjectsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPublicProjectsQuery, PaginatedApiResponse<PublicProjectListItemDto>>
{
    public async Task<PaginatedApiResponse<PublicProjectListItemDto>> Handle(
        GetPublicProjectsQuery query, CancellationToken cancellationToken)
    {
        var searchTrimmed = query.Search?.Trim();
        var searchPattern = string.IsNullOrWhiteSpace(searchTrimmed) ? null : searchTrimmed.ToLowerInvariant();

        // 1. Query public ProcurementProjects (Public Bidding & posted projects)
        var projectsQuery = unitOfWork.ProcurementProjectRepository.Query()
            .Include(p => p.BiddingDocument)
            .Include(p => p.ProcurementMode)
            .Include(p => p.ConsolidatedPR)
            .Include(p => p.BiddingActivitySchedules)
                .ThenInclude(s => s.ProcurementActivityType)
            .Where(p => !p.IsDeleted && (
                (p.BiddingDocument != null && p.BiddingDocument.Status == "Posted")
                || p.Status == "Posted"
                || p.Status == "ROUTED_TO_PORTAL"
                || p.Status == "Active"
                || p.Status == "Published"
                || p.Status == "Open"
                || p.Status == "ClosingSoon"
                || p.Status == "Closed"));

        if (!string.IsNullOrWhiteSpace(searchPattern))
        {
            projectsQuery = projectsQuery.Where(p =>
                p.Title.ToLower().Contains(searchPattern)
                || (p.ContractNo != null && p.ContractNo.ToLower().Contains(searchPattern))
                || (p.ConsolidatedPR != null && p.ConsolidatedPR.CPRNumber.ToLower().Contains(searchPattern)));
        }

        var rawProjects = await projectsQuery.ToListAsync(cancellationToken);

        var projectDtos = rawProjects.Select(p => new PublicProjectListItemDto
        {
            Id                = p.Id,
            Title             = p.Title,
            ContractNo        = p.ContractNo ?? (p.ConsolidatedPR != null ? p.ConsolidatedPR.CPRNumber : string.Empty),
            ABC               = p.ABC,
            ModeOfProcurement = p.ProcurementMode != null ? p.ProcurementMode.Name : string.Empty,
            Status            = p.Status,

            SubmissionDeadline = p.BiddingActivitySchedules
                .Where(s => s.ProcurementActivityType != null && s.ProcurementActivityType.SystemRole == ProcurementActivitySystemRole.SubmissionOpeningOfBids)
                .Select(s => (DateTime?)s.StartDate)
                .FirstOrDefault(),

            DatePosted = p.BiddingActivitySchedules
                .Where(s => s.ProcurementActivityType != null && s.ProcurementActivityType.SystemRole == ProcurementActivitySystemRole.AdvertisementPosting)
                .Select(s => (DateTime?)s.StartDate)
                .FirstOrDefault() ?? p.UpdatedAt ?? p.CreatedAt
        }).ToList();

        // 2. Query Approved RFQs (Alternative Methods e.g. SVP, Shopping posted to BAC portal per RA 9184)
        // Only include RFQs that have at least one line item — itemless RFQs are incomplete and must not appear publicly.
        var rfqsQuery = unitOfWork.RFQRepository.Query()
            .Include(r => r.ModeOfProcurement)
            .Include(r => r.RFQItems)
            .Where(r => !r.IsDeleted && r.Status == StatusEnum.Approved && r.RFQItems.Any(i => !i.IsDeleted));

        if (!string.IsNullOrWhiteSpace(searchPattern))
        {
            rfqsQuery = rfqsQuery.Where(r =>
                r.RFQNumber.ToLower().Contains(searchPattern)
                || (r.Description != null && r.Description.ToLower().Contains(searchPattern))
                || (r.Purpose != null && r.Purpose.ToLower().Contains(searchPattern)));
        }

        var rawRfqs = await rfqsQuery.ToListAsync(cancellationToken);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var rfqDtos = rawRfqs.Select(r =>
        {
            var isClosed = r.Deadline.HasValue && r.Deadline.Value < today;
            var isClosingSoon = r.Deadline.HasValue && !isClosed && r.Deadline.Value <= today.AddDays(3);
            var status = isClosed ? "Closed" : (isClosingSoon ? "ClosingSoon" : "Open");

            var title = !string.IsNullOrWhiteSpace(r.Description)
                ? r.Description
                : (!string.IsNullOrWhiteSpace(r.Purpose) ? r.Purpose : r.RFQNumber);

            return new PublicProjectListItemDto
            {
                Id                = r.Id,
                Title             = title,
                ContractNo        = r.RFQNumber,
                ABC               = r.TotalAmount,
                ModeOfProcurement = r.ModeOfProcurement != null ? r.ModeOfProcurement.Name : "Small Value Procurement (SVP)",
                Status            = status,
                SubmissionDeadline = r.Deadline.HasValue ? r.Deadline.Value.ToDateTime(new TimeOnly(12, 0)) : null,
                DatePosted        = r.Date != default ? r.Date.ToDateTime(TimeOnly.MinValue) : (r.UpdatedAt ?? r.CreatedAt)
            };
        }).ToList();

        // 3. Combine both streams
        var allOpportunities = projectDtos.Concat(rfqDtos).ToList();

        // 4. Apply optional filter by mode
        if (!string.IsNullOrWhiteSpace(query.Mode))
        {
            var targetMode = query.Mode.Trim().ToLowerInvariant();

            if (targetMode.Contains("small value") || targetMode.Contains("svp"))
            {
                allOpportunities = allOpportunities.Where(p => IsSvp(p.ModeOfProcurement, p.ContractNo)).ToList();
            }
            else if (targetMode.Contains("public") || targetMode.Contains("bidding"))
            {
                allOpportunities = allOpportunities.Where(p => IsPublicBidding(p.ModeOfProcurement, p.ContractNo)).ToList();
            }
            else
            {
                allOpportunities = allOpportunities.Where(p => p.ModeOfProcurement.Contains(targetMode, StringComparison.OrdinalIgnoreCase)).ToList();
            }
        }

        // 5. Apply optional Sieve Filters if present (e.g. Status)
        if (!string.IsNullOrWhiteSpace(query.Filters))
        {
            var filterParts = query.Filters.Split(',', StringSplitOptions.RemoveEmptyEntries);
            foreach (var fp in filterParts)
            {
                if (fp.StartsWith("Status==", StringComparison.OrdinalIgnoreCase))
                {
                    var allowedStatuses = fp[8..].Split('|', StringSplitOptions.RemoveEmptyEntries);
                    allOpportunities = allOpportunities
                        .Where(i => allowedStatuses.Any(a => string.Equals(a.Trim(), i.Status, StringComparison.OrdinalIgnoreCase)))
                        .ToList();
                }
            }
        }

        // 6. Sort opportunities: default to DatePosted descending
        if (!string.IsNullOrWhiteSpace(query.Sorts) && query.Sorts.Contains("ABC", StringComparison.OrdinalIgnoreCase))
        {
            allOpportunities = query.Sorts.StartsWith('-')
                ? allOpportunities.OrderByDescending(o => o.ABC).ToList()
                : allOpportunities.OrderBy(o => o.ABC).ToList();
        }
        else
        {
            allOpportunities = allOpportunities.OrderByDescending(o => o.DatePosted ?? DateTime.MinValue).ToList();
        }

        // 7. Paginate
        var pageNumber = query.PageNumber > 0 ? query.PageNumber : 1;
        var pageSize = query.PageSize > 0 ? query.PageSize : 50;
        var totalCount = allOpportunities.Count;

        var pagedItems = allOpportunities
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return new PaginatedApiResponse<PublicProjectListItemDto>(
            pagedItems,
            pageNumber,
            pageSize,
            totalCount);
    }

    public static bool IsPublicBidding(string? mode, string? contractNo)
    {
        if (!string.IsNullOrWhiteSpace(mode))
        {
            var m = mode.ToLowerInvariant();
            if (m.Contains("public bidding") || m.Contains("competitive") || (m.Contains("bidding") && !m.Contains("small value")))
            {
                return true;
            }

            if (m.Contains("small value") || m.Contains("svp") || m.Contains("53.9") || m.Contains("shopping") || m.Contains("direct") || m.Contains("emergency"))
            {
                return false;
            }
        }

        if (!string.IsNullOrWhiteSpace(contractNo))
        {
            var c = contractNo.ToLowerInvariant();
            if (c.Contains("itb") || c.Contains("pb"))
            {
                return true;
            }
        }

        return false;
    }

    public static bool IsSvp(string? mode, string? contractNo)
    {
        if (IsPublicBidding(mode, contractNo))
        {
            return false;
        }

        if (!string.IsNullOrWhiteSpace(mode))
        {
            var m = mode.ToLowerInvariant();
            if (m.Contains("small value") || m.Contains("svp") || m.Contains("53.9") || m.Contains("shopping") || m.Contains("52") || m.Contains("alternative"))
            {
                return true;
            }
        }

        if (!string.IsNullOrWhiteSpace(contractNo))
        {
            var c = contractNo.ToLowerInvariant();
            if (c.Contains("svp") || c.StartsWith("rfq"))
            {
                return true;
            }
        }

        return false;
    }
}