using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Queries.GetPRSummaryStats;

public class GetPRSummaryStatsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPRSummaryStatsQuery, ApiResponse<PRSummaryStatsResponse>>
{
    public async Task<ApiResponse<PRSummaryStatsResponse>> Handle(
        GetPRSummaryStatsQuery query, CancellationToken cancellationToken)
    {
        if (query.OfficeId.HasValue && query.OfficeId.Value != Guid.Empty)
        {
            _ = await unitOfWork.OfficeRepository.GetByIdAsync(query.OfficeId.Value, cancellationToken)
                ?? throw new NotFoundException($"Office with ID {query.OfficeId.Value} not found.");
        }

        List<PurchaseRequest> allPRs;
        if (query.OfficeId.HasValue && query.OfficeId.Value != Guid.Empty)
        {
            allPRs = await unitOfWork.PurchaseRequestRepository
                .GetByOfficeAsync(query.OfficeId.Value, query.PRType, cancellationToken);
        }
        else
        {
            var (prs, _) = await unitOfWork.PurchaseRequestRepository
                .GetDetailedPagedAsync(new Sieve.Models.SieveModel { Filters = $"prType=={query.PRType}", PageSize = int.MaxValue }, cancellationToken);
            allPRs = prs.ToList();
        }

        var activePRs = allPRs.Where(pr => !pr.IsDeleted).ToList();

        var totalSubmittedAmount = activePRs
            .Where(pr => pr.Status == StatusEnum.Submitted)
            .Sum(pr => pr.TotalAmount);

        // PPMP budget — sum of all approved PPMPs for this office
        var totalPPMPAmount = await unitOfWork.PurchaseRequestRepository
            .GetTotalApprovedPPMPBudgetAsync(query.OfficeId, query.PRType, cancellationToken);

        var response = new PRSummaryStatsResponse(
            TotalPPMPAmount:        totalPPMPAmount,
            TotalSubmittedPRAmount: totalSubmittedAmount,
            AvailableBalance:       totalPPMPAmount - totalSubmittedAmount,
            DraftCount:             activePRs.Count(pr => pr.Status == StatusEnum.Draft),
            SubmittedCount:         activePRs.Count(pr => pr.Status == StatusEnum.Submitted),
            ApprovedCount:          activePRs.Count(pr => pr.Status == StatusEnum.Approved)
        );

        return ApiResponse<PRSummaryStatsResponse>.Success(response);
    }
}