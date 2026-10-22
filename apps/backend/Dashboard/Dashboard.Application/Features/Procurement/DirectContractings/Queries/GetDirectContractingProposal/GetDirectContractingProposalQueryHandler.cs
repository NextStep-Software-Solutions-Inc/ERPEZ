using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.DirectContractings.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Queries.GetDirectContractingProposal;

public class GetDirectContractingProposalQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetDirectContractingProposalQuery, ApiResponse<DirectContractingProposalResponse>>
{
    public async Task<ApiResponse<DirectContractingProposalResponse>> Handle(GetDirectContractingProposalQuery request, CancellationToken cancellationToken)
    {
        var proposal = await unitOfWork.DirectContractingProposalRepository.Query()
            .Include(p => p.ProposalItems)
                .ThenInclude(item => item.CPRItem)
                    .ThenInclude(cpr => cpr.PPMPItemAllocations)
            .Include(p => p.Supplier)
            .FirstOrDefaultAsync(p => p.DirectContractingId == request.DirectContractingId && !p.IsDeleted, cancellationToken);

        if (proposal == null)
        {
            return ApiResponse<DirectContractingProposalResponse>.Fail("No proposal found for this Direct Contracting request.");
        }

        var response = new DirectContractingProposalResponse
        {
            Id = proposal.Id,
            DirectContractingId = proposal.DirectContractingId,
            SupplierId = proposal.SupplierId,
            SupplierName = proposal.Supplier != null ? proposal.Supplier.Name : string.Empty,
            ExclusivityDocumentUrl = proposal.ExclusivityDocumentUrl,
            ProposalRemarks = proposal.ProposalRemarks,
            TotalProposalAmount = proposal.TotalProposalAmount,
            SubmittedAt = proposal.SubmittedAt,
            ProposalItems = proposal.ProposalItems.Select(item => new DirectContractingProposalItemResponse
            {
                Id = item.Id,
                ProposalId = item.ProposalId,
                CPRItemId = item.CPRItemId,
                CPRItemName = item.CPRItem != null ? item.CPRItem.Name : string.Empty,
                Quantity = item.CPRItem != null
                    ? (item.CPRItem.PlannedQuantity > 0
                        ? item.CPRItem.PlannedQuantity
                        : (item.CPRItem.PPMPItemAllocations != null && item.CPRItem.PPMPItemAllocations.Count > 0
                            ? item.CPRItem.PPMPItemAllocations.Sum(a => a.Quantity)
                            : 1))
                    : 1,
                UnitABC = item.CPRItem != null ? item.CPRItem.UnitPrice : 0,
                TotalABC = item.CPRItem != null
                    ? item.CPRItem.UnitPrice * (item.CPRItem.PlannedQuantity > 0
                        ? item.CPRItem.PlannedQuantity
                        : (item.CPRItem.PPMPItemAllocations != null && item.CPRItem.PPMPItemAllocations.Count > 0
                            ? item.CPRItem.PPMPItemAllocations.Sum(a => a.Quantity)
                            : 1))
                    : 0,
                UnitBid = item.UnitBid,
                TotalBid = item.TotalBid,
                Brand = item.Brand,
                Model = item.Model,
                Color = item.Color,
                BrochureFileUrl = item.BrochureFileUrl
            }).ToList()
        };

        return ApiResponse<DirectContractingProposalResponse>.Success(response);
    }
}
