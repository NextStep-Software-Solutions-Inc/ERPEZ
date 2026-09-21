using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.Contracts.Dtos;
using ERPEZ.Application.Features.Procurement.Contracts.Utils;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Contracts.Queries.GetAvailableNoasForContract;

public class GetAvailableNoasForContractQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetAvailableNoasForContractQuery, ApiResponse<List<AvailableNoaForContractDto>>>
{
    public async Task<ApiResponse<List<AvailableNoaForContractDto>>> Handle(GetAvailableNoasForContractQuery request, CancellationToken cancellationToken)
    {
        var approvedNoas = await unitOfWork.NoticeOfAwardRepository.ToListAsync(
            unitOfWork.NoticeOfAwardRepository.QueryWithDetails()
                .Where(n => n.Status == NoticeOfAwardStatus.Approved && !n.IsDeleted),
            cancellationToken
        );

        var activeContracts = await unitOfWork.ContractRepository.ToListAsync(
            unitOfWork.ContractRepository.Query(c => c.Status != ContractStatus.Cancelled && !c.IsDeleted),
            cancellationToken
        );

        var contractedNoaIds = activeContracts.Select(c => c.NoticeOfAwardId).ToHashSet();
        var availableNoas = approvedNoas.Where(n => !contractedNoaIds.Contains(n.Id)).ToList();

        var result = availableNoas.Select(noa =>
        {
            var project = noa.ProcurementProject;
            var modeName = project?.ProcurementMode?.Name ?? "Competitive Public Bidding";

            return new AvailableNoaForContractDto
            {
                Id = noa.Id,
                NOANumber = noa.NOANumber,
                Description = noa.Description,
                SupplierId = noa.SupplierId,
                SupplierName = noa.Supplier?.Name ?? string.Empty,
                ProcurementProjectId = noa.ProcurementProjectId,
                ProjectTitle = project?.Title ?? string.Empty,
                TotalAmount = noa.AwardedAmount,
                NOADate = noa.NOADate,
                ModeOfProcurement = modeName
            };
        }).ToList();

        return ApiResponse<List<AvailableNoaForContractDto>>.Success(result);
    }
}
