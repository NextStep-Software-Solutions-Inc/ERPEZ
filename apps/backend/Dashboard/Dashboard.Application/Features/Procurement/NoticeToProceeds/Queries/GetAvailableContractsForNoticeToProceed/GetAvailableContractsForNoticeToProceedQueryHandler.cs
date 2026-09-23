using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.Contracts.Utils;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Queries.GetAvailableContractsForNoticeToProceed;

public class GetAvailableContractsForNoticeToProceedQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetAvailableContractsForNoticeToProceedQuery, ApiResponse<List<AvailableContractForNoticeToProceedDto>>>
{
    public async Task<ApiResponse<List<AvailableContractForNoticeToProceedDto>>> Handle(
        GetAvailableContractsForNoticeToProceedQuery request,
        CancellationToken cancellationToken)
    {
        var eligibleContracts = await unitOfWork.ContractRepository.ToListAsync(
            unitOfWork.ContractRepository.QueryWithDetails()
                .Where(c => (c.Status == ContractStatus.Approved || c.Status == ContractStatus.Executed) && !c.IsDeleted),
            cancellationToken
        );

        var activeNtps = await unitOfWork.NoticeToProceedRepository.ToListAsync(
            unitOfWork.NoticeToProceedRepository.Query(n => n.Status != NoticeToProceedStatus.Cancelled && !n.IsDeleted),
            cancellationToken
        );

        var activeContractIds = activeNtps.Select(n => n.ContractId).ToHashSet();
        var availableContracts = eligibleContracts.Where(c => !activeContractIds.Contains(c.Id)).ToList();

        var result = new List<AvailableContractForNoticeToProceedDto>();

        foreach (var contract in availableContracts)
        {
            var noa = contract.NoticeOfAward;
            var project = noa != null
                ? await unitOfWork.ProcurementProjectRepository.GetWithAwardDetailsByIdAsync(noa.ProcurementProjectId, cancellationToken)
                : null;

            var lineItems = noa != null
                ? await ContractLineItemResolver.ResolveLineItemsAsync(unitOfWork, project, noa, cancellationToken)
                : [];

            result.Add(new AvailableContractForNoticeToProceedDto
            {
                Id = contract.Id,
                ContractNumber = contract.ContractNumber,
                ContractDate = contract.ContractDate,
                ContractApprovedAt = contract.ContractApprovedAt,
                Status = contract.Status,
                NoticeOfAwardId = noa?.Id ?? Guid.Empty,
                NOANumber = noa?.NOANumber ?? string.Empty,
                SupplierId = noa?.SupplierId ?? Guid.Empty,
                SupplierName = noa?.Supplier?.Name ?? string.Empty,
                ProcurementProjectId = project?.Id ?? noa?.ProcurementProjectId ?? Guid.Empty,
                ProjectTitle = project?.Title ?? string.Empty,
                TotalAmount = noa?.AwardedAmount ?? 0m,
                ModeOfProcurement = project?.ProcurementMode?.Name ?? "Competitive Public Bidding",
                LineItems = lineItems
            });
        }

        return ApiResponse<List<AvailableContractForNoticeToProceedDto>>.Success(result);
    }
}
