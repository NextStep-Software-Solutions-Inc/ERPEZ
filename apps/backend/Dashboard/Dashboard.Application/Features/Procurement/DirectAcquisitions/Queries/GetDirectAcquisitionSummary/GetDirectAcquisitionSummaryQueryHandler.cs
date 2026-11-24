using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.DirectAcquisitions.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.DirectAcquisitions.Queries.GetDirectAcquisitionSummary;

public class GetDirectAcquisitionSummaryQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetDirectAcquisitionSummaryQuery, ApiResponse<DirectAcquisitionSummaryResponse>>
{
    public async Task<ApiResponse<DirectAcquisitionSummaryResponse>> Handle(GetDirectAcquisitionSummaryQuery request, CancellationToken cancellationToken)
    {
        var activeEntries = await unitOfWork.DirectAcquisitionRepository.Query()
            .Where(da => !da.IsDeleted)
            .Select(da => da.Status)
            .ToListAsync(cancellationToken);

        var summary = new DirectAcquisitionSummaryResponse
        {
            Total = activeEntries.Count,
            Draft = activeEntries.Count(s => s == DirectAcquisitionStatusEnum.DRAFT),
            PurchaseEntry = activeEntries.Count(s => s == DirectAcquisitionStatusEnum.PURCHASE_ENTRY),
            ForDisbursement = activeEntries.Count(s => s == DirectAcquisitionStatusEnum.FOR_DISBURSEMENT),
            Approved = activeEntries.Count(s => s == DirectAcquisitionStatusEnum.APPROVED),
            Returned = activeEntries.Count(s => s == DirectAcquisitionStatusEnum.RETURNED)
        };

        return ApiResponse<DirectAcquisitionSummaryResponse>.Success(summary);
    }
}
