using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.Contracts.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Contracts.Queries.GetContractSummary;

public class GetContractSummaryQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetContractSummaryQuery, ApiResponse<ContractSummaryDto>>
{
    public async Task<ApiResponse<ContractSummaryDto>> Handle(GetContractSummaryQuery request, CancellationToken cancellationToken)
    {
        var contracts = await unitOfWork.ContractRepository.ToListAsync(
            unitOfWork.ContractRepository.QueryWithDetails().Where(c => !c.IsDeleted),
            cancellationToken
        );

        var draftCount = contracts.Count(c => c.Status == ContractStatus.Draft);
        var forApprovalCount = contracts.Count(c => c.Status == ContractStatus.ForApproval);
        var approvedCount = contracts.Count(c => c.Status == ContractStatus.Approved);
        var executedCount = contracts.Count(c => c.Status == ContractStatus.Executed);
        var returnedCount = contracts.Count(c => c.Status == ContractStatus.Returned);
        var cancelledCount = contracts.Count(c => c.Status == ContractStatus.Cancelled);

        var totalActive = contracts.Count(c => c.Status != ContractStatus.Cancelled);
        var totalValue = contracts
            .Where(c => c.Status != ContractStatus.Cancelled)
            .Sum(c => c.NoticeOfAward?.AwardedAmount ?? 0m);

        var dto = new ContractSummaryDto
        {
            Total = totalActive,
            Draft = draftCount,
            ForApproval = forApprovalCount,
            Approved = approvedCount,
            Executed = executedCount,
            Returned = returnedCount,
            Cancelled = cancelledCount,
            TotalValue = totalValue
        };

        return ApiResponse<ContractSummaryDto>.Success(dto);
    }
}
