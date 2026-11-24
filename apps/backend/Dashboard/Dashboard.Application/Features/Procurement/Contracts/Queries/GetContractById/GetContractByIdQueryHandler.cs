using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.Contracts.Dtos;
using ERPEZ.Application.Features.Procurement.Contracts.Utils;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Contracts.Queries.GetContractById;

public class GetContractByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetContractByIdQuery, ApiResponse<ContractDetailDto>>
{
    public async Task<ApiResponse<ContractDetailDto>> Handle(GetContractByIdQuery query, CancellationToken cancellationToken)
    {
        var contract = await unitOfWork.ContractRepository.GetByIdWithDetailsAsync(query.Id, cancellationToken);
        if (contract == null || contract.IsDeleted)
        {
            return ApiResponse<ContractDetailDto>.Fail("Contract not found.");
        }

        var noa = contract.NoticeOfAward;
        var project = noa != null
            ? await unitOfWork.ProcurementProjectRepository.GetWithAwardDetailsByIdAsync(noa.ProcurementProjectId, cancellationToken)
            : null;

        var bacRes = noa != null && noa.BACResolutionId != Guid.Empty
            ? await unitOfWork.BACResolutionRepository.FindAsync(r => r.Id == noa.BACResolutionId, cancellationToken)
            : null;

        var lineItems = noa != null
            ? await ContractLineItemResolver.ResolveLineItemsAsync(unitOfWork, project, noa, cancellationToken)
            : [];

        var milestones = noa?.Milestones != null && noa.Milestones.Count > 0
            ? noa.Milestones.Select(m => new NoticeOfAwardMilestoneDto
            {
                Id = m.Id,
                NoticeOfAwardId = m.NoticeOfAwardId,
                MilestoneType = m.MilestoneType,
                MilestoneKey = m.MilestoneType.ToString(),
                DateLogged = m.DateLogged,
                FileId = m.FileId,
                FileName = m.FileName,
                Remarks = m.Remarks,
                LoggedByName = m.LoggedByName
            }).ToList()
            : [];

        var modeName = project?.ProcurementMode?.Name ?? "Competitive Public Bidding";

        var dto = new ContractDetailDto
        {
            Id = contract.Id,
            ContractNumber = contract.ContractNumber,
            NoticeOfAwardId = contract.NoticeOfAwardId,
            NOANumber = noa?.NOANumber ?? string.Empty,
            NOADate = noa?.NOADate ?? default,
            ContractDate = contract.ContractDate,
            Description = contract.Description,
            Status = contract.Status,

            SupplierId = noa?.SupplierId ?? Guid.Empty,
            SupplierName = noa?.Supplier?.Name ?? string.Empty,
            SupplierAddress = noa?.Supplier?.Address,
            SupplierContactPerson = noa?.Supplier?.ContactPerson,
            SupplierEmail = noa?.Supplier?.Email,
            SupplierContactNumber = noa?.Supplier?.ContactNumber,

            ProcurementProjectId = noa?.ProcurementProjectId ?? Guid.Empty,
            ProjectTitle = project?.Title ?? noa?.ProcurementProject?.Title ?? string.Empty,
            TotalAmount = noa?.AwardedAmount ?? 0m,
            ModeOfProcurement = modeName,
            BACResolutionNumber = bacRes?.ResolutionNumber,

            LineItems = lineItems,
            Milestones = milestones,

            SubmittedById = contract.SubmittedById,
            SubmittedAt = contract.SubmittedAt,
            ApprovedById = contract.ApprovedById,
            ApprovedByName = contract.ApprovedByName,
            ApprovedAt = contract.ApprovedAt,
            ApprovalRemarks = contract.ApprovalRemarks,
            ReturnRemarks = contract.ReturnRemarks,
            ReturnedById = contract.ReturnedById,
            ReturnedAt = contract.ReturnedAt,

            ExecutedAt = contract.ExecutedAt,
            ExecutedById = contract.ExecutedById,
            ExecutedByName = contract.ExecutedByName,
            ContractApprovedAt = contract.ContractApprovedAt,
            SignedContractFileId = contract.SignedContractFileId,
            SignedContractFileName = contract.SignedContractFileName,
            LateExecutionJustification = contract.LateExecutionJustification,
            JustificationLoggedAt = contract.JustificationLoggedAt,

            CreatedAt = contract.CreatedAt,
            CreatedBy = contract.CreatedBy,
            UpdatedAt = contract.UpdatedAt,
            UpdatedBy = contract.UpdatedBy
        };

        return ApiResponse<ContractDetailDto>.Success(dto);
    }
}
