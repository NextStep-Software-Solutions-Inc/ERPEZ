using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Common.Helpers;
using ERPEZ.Application.Features.Procurement.Contracts.Dtos;
using ERPEZ.Application.Features.Procurement.Contracts.Utils;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Contracts.Queries.GetContractPdf;

public class GetContractPdfQueryHandler(
    IUnitOfWork unitOfWork,
    IDocumentRendererService rendererService)
    : IRequestHandler<GetContractPdfQuery, ApiResponse<ContractPdfFileResult>>
{
    public async Task<ApiResponse<ContractPdfFileResult>> Handle(
        GetContractPdfQuery request,
        CancellationToken cancellationToken)
    {
        var contract = await unitOfWork.ContractRepository.GetByIdWithDetailsAsync(
            request.ContractId, cancellationToken)
            ?? throw new NotFoundException("Contract not found.");

        var noa = contract.NoticeOfAward;
        var project = noa != null
            ? await unitOfWork.ProcurementProjectRepository.GetWithAwardDetailsByIdAsync(noa.ProcurementProjectId, cancellationToken)
            : null;

        var bacRes = noa != null && noa.BACResolutionId != Guid.Empty
            ? await unitOfWork.BACResolutionRepository.FindAsync(r => r.Id == noa.BACResolutionId, cancellationToken)
            : null;

        var supplier = noa?.Supplier ?? (noa != null
            ? await unitOfWork.SupplierRepository.FindAsync(s => s.Id == noa.SupplierId, cancellationToken)
            : null);

        var lineItems = noa != null
            ? await ContractLineItemResolver.ResolveLineItemsAsync(unitOfWork, project, noa, cancellationToken)
            : [];

        var totalAmount = noa?.AwardedAmount ?? 0m;
        var amountInWords = PhilippineCurrencyWordsHelper.ToPhilippinePesoWords(totalAmount);

        var contractLineItems = lineItems.Select((item, index) => new ContractLineItemDataDto
        {
            ItemNumber = index + 1,
            ItemName = item.ItemName,
            Specifications = !string.IsNullOrWhiteSpace(item.Description) ? item.Description : item.ItemName,
            Category = item.Category,
            Quantity = item.Quantity,
            UnitOfMeasure = item.Unit,
            UnitPrice = item.UnitPrice,
            TotalAmount = item.Amount
        }).ToList();

        // Dynamically resolve Procuring Entity / Organization from database
        var topOrg = await unitOfWork.OrganizationRepository.FindAsync(o => o.ParentId == null && !o.IsDeleted, cancellationToken)
            ?? await unitOfWork.OrganizationRepository.FindAsync(o => !o.IsDeleted, cancellationToken);

        var rootOffice = await unitOfWork.OfficeRepository.FindAsync(o => o.ParentId == null && !o.IsDeleted, cancellationToken)
            ?? await unitOfWork.OfficeRepository.FindAsync(o => !o.IsDeleted, cancellationToken);

        string procuringEntityName = topOrg?.Name?.Trim()
            ?? (rootOffice?.Organization != null ? rootOffice.Organization.Name?.Trim() : null)
            ?? rootOffice?.Name?.Trim()
            ?? string.Empty;

        string procuringEntityOffice = rootOffice != null && !string.IsNullOrWhiteSpace(rootOffice.Name) && !string.Equals(rootOffice.Name.Trim(), procuringEntityName, StringComparison.OrdinalIgnoreCase)
            ? rootOffice.Name.Trim()
            : string.Empty;

        string procuringEntityAddress = !string.IsNullOrWhiteSpace(rootOffice?.Address)
            ? rootOffice.Address.Trim()
            : string.Empty;

        string approvedByName = !string.IsNullOrWhiteSpace(contract.ApprovedByName)
            ? contract.ApprovedByName
            : (!string.IsNullOrWhiteSpace(noa?.ApprovedByName) ? noa.ApprovedByName : string.Empty);

        string approvedByPosition = !string.IsNullOrWhiteSpace(approvedByName)
            ? "Head of the Procuring Entity"
            : string.Empty;

        var dataDto = new ContractDataDto
        {
            Id = contract.Id,
            ContractNumber = contract.ContractNumber,
            ContractDate = contract.ContractDate.ToDateTime(TimeOnly.MinValue),
            Description = contract.Description,
            Status = contract.Status.ToString(),

            ProcuringEntityName = procuringEntityName,
            ProcuringEntityOffice = procuringEntityOffice,
            ProcuringEntityAddress = procuringEntityAddress,

            SupplierId = supplier?.Id ?? noa?.SupplierId ?? Guid.Empty,
            SupplierName = supplier?.Name ?? "Winning Supplier",
            SupplierAddress = supplier?.Address ?? "Philippines",
            ContactPerson = supplier?.ContactPerson ?? string.Empty,
            ContactNumber = supplier?.ContactNumber ?? string.Empty,
            ContactEmail = supplier?.Email ?? string.Empty,

            ProcurementProjectId = project?.Id ?? noa?.ProcurementProjectId ?? Guid.Empty,
            ProjectTitle = project?.Title ?? noa?.Description ?? contract.Description,
            ProjectDescription = project?.ScopeOfWork ?? contract.Description,
            ProcurementType = noa?.ProcurementType.ToString() ?? "GoodsAndServices",
            ModeOfProcurement = project?.ProcurementMode?.Name ?? "Competitive Public Bidding",
            BACResolutionNumber = bacRes?.ResolutionNumber ?? string.Empty,
            NOANumber = noa?.NOANumber ?? string.Empty,
            NOADate = noa?.NOADate != null ? noa.NOADate.ToDateTime(TimeOnly.MinValue) : null,

            ContractPrice = totalAmount,
            AmountInWords = amountInWords,

            ApprovedByName = approvedByName,
            ApprovedByPosition = approvedByPosition,
            ApprovedAt = contract.ApprovedAt ?? noa?.ApprovedAt,
            ExecutedByName = contract.ExecutedByName ?? string.Empty,
            ExecutedAt = contract.ExecutedAt.HasValue ? contract.ExecutedAt.Value.ToDateTime(TimeOnly.MinValue) : null,

            LineItems = contractLineItems
        };

        var bytes = await rendererService.RenderAsync(
            dataDto,
            DocumentType.Contract,
            ExportFormat.Pdf,
            cancellationToken);

        var fileName = $"{contract.ContractNumber}_Contract_Agreement.pdf";
        return ApiResponse<ContractPdfFileResult>.Success(
            new ContractPdfFileResult(bytes, fileName, "application/pdf"),
            "Contract PDF rendered successfully.");
    }
}