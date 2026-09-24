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
            .Include(dc => dc.BACProject)
            .Include(dc => dc.ExclusiveSupplier)
            .Include(dc => dc.Proposal)
                .ThenInclude(p => p!.ProposalItems)
                    .ThenInclude(pi => pi.CPRItem)
            .Where(dc => !dc.IsDeleted)
            .AsSplitQuery();

        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<DirectContracting, DirectContractingResponse>> projection = c => new DirectContractingResponse
        {
            Id = c.Id,
            DCNumber = c.DCNumber,
            Name = c.Name,
            BACProjectId = c.BACProjectId,
            BACProjectTitle = c.BACProject != null ? c.BACProject.Title : string.Empty,
            BACProjectABC = c.BACProject != null ? c.BACProject.ABC : 0,
            BACProjectStatus = c.BACProject != null ? c.BACProject.Status : string.Empty,
            ExclusiveSupplierId = c.ExclusiveSupplierId,
            ExclusiveSupplierName = c.ExclusiveSupplier != null ? c.ExclusiveSupplier.Name : string.Empty,
            ExclusiveSupplierEmail = c.ExclusiveSupplier != null ? c.ExclusiveSupplier.Email : string.Empty,
            ExclusiveSupplierContact = c.ExclusiveSupplier != null ? c.ExclusiveSupplier.ContactNumber : string.Empty,
            ExclusiveSupplierPhilGEPS = c.ExclusiveSupplier != null ? (c.ExclusiveSupplier.PhilGEPSNumber ?? string.Empty) : string.Empty,
            SubmissionDeadline = c.SubmissionDeadline,
            Status = c.Status.ToString(),
            TotalABC = c.TotalABC,
            ReviewRemarks = c.ReviewRemarks,
            CreatedByUserId = c.CreatedByUserId,
            ReviewedByUserId = c.ReviewedByUserId,
            CreatedAt = c.CreatedAt,
            CreatedBy = c.CreatedBy,
            ApprovedAttachment = c.ApprovedFileId.HasValue ? new ApprovedAttachmentResponse
            {
                FileId = c.ApprovedFileId.Value
            } : null,
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
                    Quantity = item.CPRItem != null
                        ? (item.CPRItem.PlannedQuantity > 0
                            ? item.CPRItem.PlannedQuantity
                            : (item.CPRItem.PPMPItemAllocations.Any() ? item.CPRItem.PPMPItemAllocations.Sum(a => a.Quantity) : 1))
                        : 1,
                    UnitABC = item.CPRItem != null ? item.CPRItem.UnitPrice : 0,
                    TotalABC = item.CPRItem != null
                        ? item.CPRItem.UnitPrice * (item.CPRItem.PlannedQuantity > 0
                            ? item.CPRItem.PlannedQuantity
                            : (item.CPRItem.PPMPItemAllocations.Any() ? item.CPRItem.PPMPItemAllocations.Sum(a => a.Quantity) : 1))
                        : 0,
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
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
