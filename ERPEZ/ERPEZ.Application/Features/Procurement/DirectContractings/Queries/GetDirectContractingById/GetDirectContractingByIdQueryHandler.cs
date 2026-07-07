using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.DirectContractings.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Queries.GetDirectContractingById;

public class GetDirectContractingByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetDirectContractingByIdQuery, ApiResponse<DirectContractingResponse>>
{
    public async Task<ApiResponse<DirectContractingResponse>> Handle(GetDirectContractingByIdQuery request, CancellationToken cancellationToken)
    {
        var dc = await unitOfWork.DirectContractingRepository.Query()
            .Include(dc => dc.BACProject)
            .Include(dc => dc.ExclusiveSupplier)
            .Include(dc => dc.Proposal)
                .ThenInclude(p => p!.ProposalItems)
                    .ThenInclude(pi => pi.CPRItem)
            .Where(dc => dc.Id == request.Id && !dc.IsDeleted)
            .AsSplitQuery()
            .FirstOrDefaultAsync(cancellationToken);

        if (dc == null)
        {
            return ApiResponse<DirectContractingResponse>.Fail("Direct Contracting request not found.");
        }

        var response = new DirectContractingResponse
        {
            Id = dc.Id,
            DCNumber = dc.DCNumber,
            Name = dc.Name,
            BACProjectId = dc.BACProjectId,
            BACProjectTitle = dc.BACProject != null ? dc.BACProject.Title : string.Empty,
            BACProjectABC = dc.BACProject != null ? dc.BACProject.ABC : 0,
            BACProjectStatus = dc.BACProject != null ? dc.BACProject.Status : string.Empty,
            ExclusiveSupplierId = dc.ExclusiveSupplierId,
            ExclusiveSupplierName = dc.ExclusiveSupplier != null ? dc.ExclusiveSupplier.Name : string.Empty,
            ExclusiveSupplierEmail = dc.ExclusiveSupplier != null ? dc.ExclusiveSupplier.Email : string.Empty,
            ExclusiveSupplierContact = dc.ExclusiveSupplier != null ? dc.ExclusiveSupplier.ContactNumber : string.Empty,
            ExclusiveSupplierPhilGEPS = dc.ExclusiveSupplier != null ? (dc.ExclusiveSupplier.PhilGEPSNumber ?? string.Empty) : string.Empty,
            SubmissionDeadline = dc.SubmissionDeadline,
            Status = dc.Status.ToString(),
            TotalABC = dc.TotalABC,
            ReviewRemarks = dc.ReviewRemarks,
            CreatedByUserId = dc.CreatedByUserId,
            ReviewedByUserId = dc.ReviewedByUserId,
            CreatedAt = dc.CreatedAt,
            CreatedBy = dc.CreatedBy,
            Proposal = dc.Proposal != null ? new DirectContractingProposalResponse
            {
                Id = dc.Proposal.Id,
                DirectContractingId = dc.Proposal.DirectContractingId,
                SupplierId = dc.Proposal.SupplierId,
                SupplierName = dc.ExclusiveSupplier != null ? dc.ExclusiveSupplier.Name : string.Empty,
                ExclusivityDocumentUrl = dc.Proposal.ExclusivityDocumentUrl,
                ProposalRemarks = dc.Proposal.ProposalRemarks,
                TotalProposalAmount = dc.Proposal.TotalProposalAmount,
                SubmittedAt = dc.Proposal.SubmittedAt,
                ProposalItems = dc.Proposal.ProposalItems.Select(item => new DirectContractingProposalItemResponse
                {
                    Id = item.Id,
                    ProposalId = item.ProposalId,
                    CPRItemId = item.CPRItemId,
                    CPRItemName = item.CPRItem != null ? item.CPRItem.Name : string.Empty,
                    UnitABC = item.CPRItem != null ? item.CPRItem.UnitPrice : 0,
                    TotalABC = item.CPRItem != null ? item.CPRItem.UnitPrice : 0,
                    UnitBid = item.UnitBid,
                    TotalBid = item.TotalBid,
                    Brand = item.Brand,
                    Model = item.Model,
                    Color = item.Color,
                    BrochureFileUrl = item.BrochureFileUrl
                }).ToList()
            } : null
        };

        return ApiResponse<DirectContractingResponse>.Success(response);
    }
}
