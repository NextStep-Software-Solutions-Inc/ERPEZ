using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Common.Helpers;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Dtos;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.GenerateNoticeOfAwardDocument;

public class GenerateNoticeOfAwardDocumentCommandHandler(
    IUnitOfWork unitOfWork,
    IDocumentRendererService rendererService,
    IDocumentStorageService storageService)
    : IRequestHandler<GenerateNoticeOfAwardDocumentCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        GenerateNoticeOfAwardDocumentCommand request,
        CancellationToken cancellationToken)
    {
        var noa = await unitOfWork.NoticeOfAwardRepository.FindAsync(
            n => n.Id == request.NoticeOfAwardId,
            cancellationToken)
            ?? throw new NotFoundException("Notice of Award not found.");

        // Upstream entities
        var resolution = await unitOfWork.BACResolutionRepository.FindAsync(
            r => r.Id == noa.BACResolutionId,
            cancellationToken);

        var project = resolution != null
            ? await unitOfWork.ProcurementProjectRepository.FindAsync(p => p.Id == resolution.ProcurementProjectId, cancellationToken)
            : await unitOfWork.ProcurementProjectRepository.FindAsync(p => p.Id == noa.ProcurementProjectId, cancellationToken);

        var supplier = await unitOfWork.SupplierRepository.FindAsync(
            s => s.Id == noa.SupplierId,
            cancellationToken);

        var cpr = project?.ConsolidatedPRId.HasValue == true
            ? await unitOfWork.ConsolidatedPRRepository.FindAsync(c => c.Id == project.ConsolidatedPRId.Value, cancellationToken)
            : null;

        var aobMappings = project != null
            ? await unitOfWork.AOBProcurementProjectMappingRepository.ToListAsync(
                unitOfWork.AOBProcurementProjectMappingRepository.Query(m => m.ProcurementProjectId == project.Id),
                cancellationToken)
            : [];

        AOB? aob = null;
        if (aobMappings.Count != 0)
        {
            var aobId = aobMappings.First().AOBId;
            aob = await unitOfWork.AOBRepository.FindAsync(a => a.Id == aobId, cancellationToken);
        }

        var awardCriterion = !string.IsNullOrWhiteSpace(noa.AwardCriterion)
            ? noa.AwardCriterion
            : (aob != null ? aob.AwardCriterion.ToString() : "LCRB");

        var dataDto = new NoticeOfAwardDataDto
        {
            Id = noa.Id,
            NoaNumber = noa.NOANumber,
            Date = noa.NOADate.ToDateTime(TimeOnly.MinValue),
            DateBid = noa.BidDate.ToDateTime(TimeOnly.MinValue),
            Description = noa.Description,
            Type = noa.ProcurementType.ToString(),
            SupplierId = noa.SupplierId,
            SupplierName = supplier?.Name ?? "Winning Supplier",
            SupplierAddress = supplier?.Address ?? "Philippines",
            ContactPerson = supplier?.ContactPerson ?? string.Empty,
            ContactNumber = supplier?.ContactNumber ?? string.Empty,
            ProcurementProjectId = project?.Id ?? noa.ProcurementProjectId,
            ProjectName = project?.Title ?? noa.Description,
            ProjectDescription = project?.ScopeOfWork ?? string.Empty,
            PrNumber = cpr?.CPRNumber ?? "CPR-001",
            BacResolutionNumber = resolution?.ResolutionNumber ?? "BAC-RES",
            AwardCriterion = awardCriterion,
            TotalAmount = noa.AwardedAmount,
            AmountInWords = PhilippineCurrencyWordsHelper.ToPhilippinePesoWords(noa.AwardedAmount),
            ApprovedByName = noa.ApprovedByName ?? string.Empty,
            ApprovedByPosition = "Head of the Procuring Entity",
            ApprovedAt = noa.ApprovedAt,
            ReceivedAt = noa.ReceivedAt.HasValue
                ? noa.ReceivedAt.Value.ToDateTime(TimeOnly.MinValue)
                : null
        };

        // Render document
        var bytes = await rendererService.RenderAsync(
            dataDto,
            DocumentType.NoticeOfAward,
            request.Format,
            cancellationToken);

        var extension = request.Format == ExportFormat.Excel ? "xlsx" : "pdf";
        var fileName = $"{noa.NOANumber}_Notice_of_Award.{extension}";

        // Save to document storage
        var storagePath = await storageService.SaveAsync(bytes, fileName, cancellationToken);

        // Audit GeneratedDocument record
        var record = new GeneratedDocument
        {
            DocumentType = DocumentType.NoticeOfAward,
            Format = request.Format,
            SourceDocumentId = noa.Id,
            StoragePath = storagePath,
            FileName = fileName,
            FileSizeBytes = bytes.Length,
            FiscalYear = DateTime.UtcNow.Year.ToString(),
            GeneratedBy = request.GeneratedBy
        };

        await unitOfWork.GeneratedDocumentRepository.AddAsync(record, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(record.Id, "Notice of Award document generated successfully.");
    }
}
