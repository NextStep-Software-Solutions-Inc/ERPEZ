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
        // Public visibility gate — hardcoded, not reliant on FE-supplied filters.
        var gateFilter = "BiddingDocument.Status==Posted|Status==ROUTED_TO_PORTAL";
        var combinedFilters = string.IsNullOrWhiteSpace(query.Filters)
            ? gateFilter
            : $"{gateFilter},{query.Filters}";

        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page     = query.PageNumber,
            Filters  = combinedFilters,
            Sorts    = query.Sorts
        };

        Expression<Func<ProcurementProject, PublicProjectListItemDto>> projection = p => new PublicProjectListItemDto
        {
            Id                = p.Id,
            Title             = p.Title,
            ContractNo        = p.ContractNo ?? string.Empty,
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

        return new PaginatedApiResponse<PublicProjectListItemDto>(
            [.. projects],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}