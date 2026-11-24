using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Common.Dtos;
using ERPEZ.Application.Common.Helpers;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.GenerateAprDocument;

public class GenerateAprDocumentCommandHandler(
    IUnitOfWork unitOfWork,
    IDocumentRendererService rendererService,
    IDocumentStorageService storageService)
    : IRequestHandler<GenerateAprDocumentCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        GenerateAprDocumentCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Fetch APR entity with full details
        var apr = await unitOfWork.APRRepository
            .GetAPRWithDetailsAsync(request.APRId, cancellationToken)
            ?? throw new NotFoundException($"Agency Procurement Request with ID '{request.APRId}' was not found.");

        // 2. Map domain entity to AprDataDto
        var dataDto = await MapToDataDtoAsync(apr, cancellationToken);

        // 3. Render document using QuestPDF renderer
        var bytes = await rendererService.RenderAsync(
            dataDto, DocumentType.Apr, request.Format, cancellationToken);

        // 4. Save file to storage
        var extension = request.Format == ExportFormat.Excel ? "xlsx" : "pdf";
        var aprNumberClean = !string.IsNullOrWhiteSpace(apr.APRNumber) ? apr.APRNumber.Replace("/", "_") : apr.Id.ToString()[..8];
        var fileName = $"APR_{aprNumberClean}_{DateTime.UtcNow:yyyyMMddHHmmss}.{extension}";
        var path = await storageService.SaveAsync(bytes, fileName, cancellationToken);

        // 5. Persist record in GeneratedDocuments
        var record = new GeneratedDocument
        {
            DocumentType = DocumentType.Apr,
            Format = request.Format,
            OfficeId = apr.OfficeId,
            StoragePath = path,
            FileName = fileName,
            FileSizeBytes = bytes.Length,
            FiscalYear = apr.FiscalYear?.Year.ToString() ?? DateTime.UtcNow.Year.ToString(),
            GeneratedBy = request.GeneratedBy
        };

        await unitOfWork.GeneratedDocumentRepository.AddAsync(record, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(record.Id, "APR document generated successfully.");
    }

    private async Task<AprDataDto> MapToDataDtoAsync(Domain.Entities.Procurement.APR apr, CancellationToken cancellationToken)
    {
        int itemNo = 1;
        var activeItems = apr.APRItems.Where(i => !i.IsDeleted).OrderBy(i => i.CreatedAt).ToList();

        var itemDtos = activeItems.Select(i =>
        {
            var ppmpName = i.PPMPItem?.Name ?? string.Empty;
            var ppmpDesc = i.PPMPItem?.Description ?? string.Empty;
            var itemDesc = i.Description ?? string.Empty;

            string fullDescription;
            if (!string.IsNullOrWhiteSpace(itemDesc))
            {
                fullDescription = itemDesc;
            }
            else if (!string.IsNullOrWhiteSpace(ppmpName) && !string.IsNullOrWhiteSpace(ppmpDesc) && !string.Equals(ppmpName, ppmpDesc, StringComparison.OrdinalIgnoreCase))
            {
                fullDescription = $"{ppmpName} - {ppmpDesc}";
            }
            else if (!string.IsNullOrWhiteSpace(ppmpName))
            {
                fullDescription = ppmpName;
            }
            else
            {
                fullDescription = !string.IsNullOrWhiteSpace(i.ItemCode) ? $"Item {i.ItemCode}" : "Item";
            }

            var unit = !string.IsNullOrWhiteSpace(i.Unit)
                ? i.Unit
                : (!string.IsNullOrWhiteSpace(i.PPMPItem?.Unit) ? i.PPMPItem.Unit : "unit");

            var totalCost = i.TotalCost > 0
                ? i.TotalCost
                : (i.QuantityRequested * i.UnitCost);

            return new AprItemRowDto
            {
                ItemNo = itemNo++,
                Description = fullDescription,
                Quantity = i.QuantityRequested,
                Unit = unit,
                UnitPrice = i.UnitCost,
                Amount = totalCost
            };
        }).ToList();

        var totalAmount = apr.TotalAmount > 0
            ? apr.TotalAmount
            : itemDtos.Sum(i => i.Amount);

        // Dynamic Signatories Resolution
        var wf = await DocumentSignatoryResolver
            .ResolveWorkflowApproversAsync(unitOfWork, apr.OfficeId, apr.FiscalYearId, "APR", cancellationToken);

        var supplySignatory = await DocumentSignatoryResolver
            .ResolveSupplySignatoryAsync(unitOfWork, cancellationToken);

        var financeSignatory = await DocumentSignatoryResolver
            .ResolveFinanceSignatoryAsync(unitOfWork, cancellationToken);

        string supplyOfficerName = !string.IsNullOrWhiteSpace(supplySignatory?.FullName)
            ? supplySignatory.FullName
            : (wf.RecommendingApprover?.FullName ?? string.Empty);

        string chiefAccountantName = financeSignatory?.FullName ?? string.Empty;

        string agencyHeadName = !string.IsNullOrWhiteSpace(wf.FinalApprover?.FullName)
            ? wf.FinalApprover.FullName
            : (!string.IsNullOrWhiteSpace(apr.ApprovedBy) && !apr.ApprovedBy.Equals("Procurement Officer", StringComparison.OrdinalIgnoreCase)
                ? apr.ApprovedBy
                : string.Empty);

        bool isNonCommon = apr.RequiresCompleteSpecifications || apr.RequiresObR || apr.RequiresCBA;

        return new AprDataDto
        {
            OfficeId = apr.OfficeId,
            RequestingAgencyName = apr.Office?.Name ?? "University of Science and Technology of Southern Philippines",
            RequestingAgencyAddress = "Claveria, Misamis Oriental",
            TelNos = string.Empty,
            AgencyAccountCode = apr.AgencyAccountCode ?? string.Empty,
            AgencyControlNumber = apr.AgencyControlNumber ?? string.Empty,
            PSAprNumber = apr.APRNumber ?? string.Empty,
            To = "PS-DBM",
            DatePrepared = apr.RequestDate != default ? apr.RequestDate : null,
            IsCommonUseSupplies = !isNonCommon,
            PriceListNumber = string.Empty,
            PriceListDate = string.Empty,
            ModeOfDelivery = apr.ModeOfDelivery,
            InsufficientFundsAction = apr.InsufficientFundsAction,
            ChargeToUnutilizedDepositAprNumber = string.Empty,
            ChargeToUnutilizedDepositDate = string.Empty,
            IsNonCommonItems = isNonCommon,
            RequiresCompleteSpecifications = apr.RequiresCompleteSpecifications,
            RequiresObR = apr.RequiresObR,
            RequiresCBA = apr.RequiresCBA,
            RequiresPayment = false,
            OthersSpecify = apr.AdditionalRemarks ?? string.Empty,
            Items = itemDtos,
            TotalAmount = totalAmount,
            PropertyOfficer = new SignatoryDto
            {
                Label = "STOCKS REQUESTED ARE CERTIFIED TO BE WITHIN APPROVED PROGRAM:",
                PrintedName = supplyOfficerName,
                Position = "AGENCY PROPERTY/SUPPLY OFFICER"
            },
            ChiefAccountant = new SignatoryDto
            {
                Label = "FUNDS CERTIFIED AVAILABLE:",
                PrintedName = chiefAccountantName,
                Position = "AGENCY CHIEF ACCOUNTANT"
            },
            ApprovedBy = new SignatoryDto
            {
                Label = "APPROVED:",
                PrintedName = agencyHeadName,
                Position = "AGENCY HEAD/AUTHORIZED SIGNATURE"
            }
        };
    }
}
