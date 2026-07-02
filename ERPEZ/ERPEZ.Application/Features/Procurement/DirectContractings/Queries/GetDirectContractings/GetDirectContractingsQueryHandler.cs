using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.DirectContractings.Dtos;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Queries.GetDirectContractings;

public class GetDirectContractingsQueryHandler(IUnitOfWork unitOfWork, ISieveProcessor sieveProcessor)
    : IRequestHandler<GetDirectContractingsQuery, PaginatedApiResponse<DirectContractingResponse>>
{
    public async Task<PaginatedApiResponse<DirectContractingResponse>> Handle(GetDirectContractingsQuery query, CancellationToken cancellationToken)
    {
        var dbQuery = unitOfWork.DirectContractingRepository.Query()
            .Include(dc => dc.BACResolution)
            .Include(dc => dc.ExclusiveSupplier)
            .Include(dc => dc.Proposal)
                .ThenInclude(p => p!.ProposalItems)
                    .ThenInclude(pi => pi.CPRItem)
            .Where(dc => !dc.IsDeleted)
            .AsSplitQuery();

        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.Page,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<DirectContracting, DirectContractingResponse>> projection = c => new DirectContractingResponse
        {
            Id = c.Id,
            DCNumber = c.DCNumber,
            Name = c.Name,
            BACResolutionId = c.BACResolutionId,
            ResolutionNumber = c.BACResolution != null ? c.BACResolution.ResolutionNumber : string.Empty,
            ExclusiveSupplierId = c.ExclusiveSupplierId,
            ExclusiveSupplierName = c.ExclusiveSupplier != null ? c.ExclusiveSupplier.Name : string.Empty,
            SubmissionDeadline = c.SubmissionDeadline,
            Status = c.Status,
            TotalABC = c.TotalABC,
            CreatedAt = c.CreatedAt,
            CreatedBy = c.CreatedBy,
            Proposal = c.Proposal != null ? new DirectContractingProposalResponse
            {
                Id = c.Proposal.Id,
                DirectContractingId = c.Proposal.DirectContractingId,
                SupplierId = c.Proposal.SupplierId,
                SupplierName = c.ExclusiveSupplier != null ? c.ExclusiveSupplier.Name : string.Empty,
                ExclusivityDocumentUrl = c.Proposal.ExclusivityDocumentUrl,
                ProposalRemarks = c.Proposal.ProposalRemarks,
                TotalProposalAmount = c.Proposal.TotalProposalAmount,
                SubmittedAt = c.Proposal.SubmittedAt,
                ProposalItems = c.Proposal.ProposalItems.Select(item => new DirectContractingProposalItemResponse
                {
                    Id = item.Id,
                    ProposalId = item.ProposalId,
                    CPRItemId = item.CPRItemId,
                    CPRItemName = item.CPRItem != null ? item.CPRItem.Name : string.Empty,
                    UnitABC = item.CPRItem != null ? item.CPRItem.UnitPrice : 0,
                    TotalABC = item.CPRItem != null ? item.CPRItem.UnitPrice : 0, // unit cost * qty can be detailed later
                    UnitBid = item.UnitBid,
                    TotalBid = item.TotalBid,
                    Brand = item.Brand,
                    Model = item.Model,
                    Color = item.Color,
                    BrochureFileUrl = item.BrochureFileUrl
                }).ToList()
            } : null
        };

        var filteredQuery = sieveProcessor.Apply(sieveModel, dbQuery, applyPagination: false);
        var totalCount = await filteredQuery.CountAsync(cancellationToken);

        var paginatedQuery = sieveProcessor.Apply(sieveModel, filteredQuery, applyFiltering: false, applySorting: false);
        var entities = await paginatedQuery.Select(projection).ToListAsync(cancellationToken);

        return new PaginatedApiResponse<DirectContractingResponse>(
            [.. entities],
            query.Page ?? 1,
            query.PageSize ?? 10,
            totalCount);
    }
}
