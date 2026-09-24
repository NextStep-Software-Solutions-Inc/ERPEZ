using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Common.Helpers;
using ERPEZ.Application.Features.Procurement.Contracts.Dtos;
using ERPEZ.Application.Features.Procurement.Contracts.Utils;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Dtos;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.GenerateNoticeToProceedDocument;

public class GenerateNoticeToProceedDocumentCommandHandler(
    IUnitOfWork unitOfWork,
    IDocumentRendererService rendererService,
    IDocumentStorageService storageService)
    : IRequestHandler<GenerateNoticeToProceedDocumentCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        GenerateNoticeToProceedDocumentCommand request,
        CancellationToken cancellationToken)
    {
        var ntp = await unitOfWork.NoticeToProceedRepository.GetByIdWithDetailsAsync(
            request.NoticeToProceedId, cancellationToken)
            ?? throw new NotFoundException("Notice to Proceed not found.");

        var contract = ntp.Contract;
        var noa = contract?.NoticeOfAward;
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

        var totalAmount = (ntp.Status == NoticeToProceedStatus.Issued || ntp.Status == NoticeToProceedStatus.Received) && ntp.AwardedAmountSnapshot > 0
            ? ntp.AwardedAmountSnapshot
            : (noa?.AwardedAmount ?? 0m);

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

        // Resolve Procuring Entity / Organization
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

        var contractNumber = !string.IsNullOrWhiteSpace(ntp.ContractNumberSnapshot)
            ? ntp.ContractNumberSnapshot
            : (contract?.ContractNumber ?? string.Empty);

        var supplierName = !string.IsNullOrWhiteSpace(ntp.SupplierNameSnapshot)
            ? ntp.SupplierNameSnapshot
            : (supplier?.Name ?? "Winning Supplier");

        var supplierAddress = !string.IsNullOrWhiteSpace(ntp.SupplierAddressSnapshot)
            ? ntp.SupplierAddressSnapshot
            : (supplier?.Address ?? "Philippines");

        var projectTitle = !string.IsNullOrWhiteSpace(ntp.ProjectTitleSnapshot)
            ? ntp.ProjectTitleSnapshot
            : (project?.Title ?? noa?.Description ?? contract?.Description ?? string.Empty);

        var issuedByName = !string.IsNullOrWhiteSpace(ntp.IssuedByName)
            ? ntp.IssuedByName
            : (!string.IsNullOrWhiteSpace(contract?.ApprovedByName) ? contract.ApprovedByName : "Head of the Procuring Entity");

        var dataDto = new NoticeToProceedDataDto
        {
            Id = ntp.Id,
            NTPNumber = ntp.NTPNumber,
            NTPDate = ntp.NTPDate.ToDateTime(TimeOnly.MinValue),
            EffectivityDate = ntp.EffectivityDate.HasValue ? ntp.EffectivityDate.Value.ToDateTime(TimeOnly.MinValue) : null,
            CommencementDate = ntp.CommencementDate.HasValue ? ntp.CommencementDate.Value.ToDateTime(TimeOnly.MinValue) : null,
            ImplementationPeriodDays = ntp.ImplementationPeriodDays,
            DeliveryCompletionDeadline = ntp.DeliveryCompletionDeadline.HasValue ? ntp.DeliveryCompletionDeadline.Value.ToDateTime(TimeOnly.MinValue) : null,
            PlaceOfDelivery = ntp.PlaceOfDelivery ?? procuringEntityAddress,
            Description = ntp.Description ?? string.Empty,
            Status = ntp.Status.ToString(),

            ProcuringEntityName = procuringEntityName,
            ProcuringEntityOffice = procuringEntityOffice,
            ProcuringEntityAddress = procuringEntityAddress,

            SupplierId = supplier?.Id ?? noa?.SupplierId ?? Guid.Empty,
            SupplierName = supplierName,
            SupplierAddress = supplierAddress,
            ContactPerson = supplier?.ContactPerson ?? string.Empty,
            ContactNumber = supplier?.ContactNumber ?? string.Empty,
            ContactEmail = supplier?.Email ?? string.Empty,

            ContractId = contract?.Id ?? ntp.ContractId,
            ContractNumber = contractNumber,
            ContractDate = contract?.ContractDate != null ? contract.ContractDate.ToDateTime(TimeOnly.MinValue) : null,

            ProcurementProjectId = project?.Id ?? noa?.ProcurementProjectId ?? Guid.Empty,
            ProjectTitle = projectTitle,
            ProjectDescription = project?.ScopeOfWork ?? contract?.Description ?? string.Empty,
            ModeOfProcurement = project?.ProcurementMode?.Name ?? "Competitive Public Bidding",
            NOANumber = noa?.NOANumber ?? string.Empty,
            NOADate = noa?.NOADate != null ? noa.NOADate.ToDateTime(TimeOnly.MinValue) : null,

            ContractPrice = totalAmount,
            AmountInWords = amountInWords,

            IssuedByName = issuedByName,
            IssuedByPosition = "Head of the Procuring Entity",
            IssuedAt = ntp.IssuedAt,

            ReceivedByName = ntp.ReceivedByName,
            ReceivedAt = ntp.ReceivedAt.HasValue ? ntp.ReceivedAt.Value.ToDateTime(TimeOnly.MinValue) : null,

            LineItems = contractLineItems
        };

        var bytes = await rendererService.RenderAsync(
            dataDto,
            DocumentType.NoticeToProceed,
            request.Format,
            cancellationToken);

        var extension = request.Format == ExportFormat.Excel ? "xlsx" : "pdf";
        var fileName = $"{ntp.NTPNumber}_Notice_to_Proceed.{extension}";

        var storagePath = await storageService.SaveAsync(bytes, fileName, cancellationToken);
        var defaultOffice = await unitOfWork.OfficeRepository.FindAsync(o => !o.IsDeleted, cancellationToken);

        var record = new GeneratedDocument
        {
            DocumentType = DocumentType.NoticeToProceed,
            Format = request.Format,
            OfficeId = defaultOffice?.Id ?? Guid.Empty,
            SourceDocumentId = ntp.Id,
            StoragePath = storagePath,
            FileName = fileName,
            FileSizeBytes = bytes.Length,
            FiscalYear = DateTime.UtcNow.Year.ToString(),
            GeneratedBy = request.GeneratedBy
        };

        await unitOfWork.GeneratedDocumentRepository.AddAsync(record, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(record.Id, "Notice to Proceed document generated successfully.");
    }
}
