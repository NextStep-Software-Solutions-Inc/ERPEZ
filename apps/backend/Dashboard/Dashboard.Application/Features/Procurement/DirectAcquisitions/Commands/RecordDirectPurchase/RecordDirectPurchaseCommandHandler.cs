using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.DirectAcquisitions.Commands.RecordDirectPurchase;

public class RecordDirectPurchaseCommandHandler(
    IUnitOfWork unitOfWork,
    IFileStorageService fileStorageService)
    : IRequestHandler<RecordDirectPurchaseCommand, ApiResponse<Guid>>
{
    private const decimal directAcquisitionThreshold = 200000m;

    public async Task<ApiResponse<Guid>> Handle(RecordDirectPurchaseCommand command, CancellationToken cancellationToken)
    {
        var da = await unitOfWork.DirectAcquisitionRepository.GetByIdAsync(command.DirectAcquisitionId, cancellationToken);
        if (da == null)
        {
            return ApiResponse<Guid>.Fail("Direct Acquisition record not found.");
        }

        var req = command.Request;

        if (req.FinalAmount <= 0)
        {
            return ApiResponse<Guid>.Fail("Transaction amount must be greater than zero.");
        }

        if (req.FinalAmount > directAcquisitionThreshold)
        {
            return ApiResponse<Guid>.Fail($"Actual purchase amount must not exceed the legislative threshold of ₱{directAcquisitionThreshold:N2}.");
        }

        // 1. Get or create DirectPurchaseEntry
        var existingEntry = await unitOfWork.DirectPurchaseEntryRepository
            .FindAsync(e => e.DirectAcquisitionId == da.Id, cancellationToken);

        if (existingEntry != null)
        {
            existingEntry.SupplierId = req.SupplierId;
            existingEntry.SupplierName = req.SupplierName;
            existingEntry.SupplierTIN = req.SupplierTIN;
            existingEntry.FinalAmount = req.FinalAmount;
            existingEntry.TransactionDate = req.TransactionDate;
            existingEntry.PaymentMethod = req.PaymentMethod;
            existingEntry.PayeeUserId = req.PayeeUserId;
            existingEntry.PayeeName = req.PaymentMethod == DirectAcquisitionPaymentMethodEnum.EMPLOYEE_REIMBURSEMENT ? req.PayeeName : null;
            existingEntry.Remarks = req.Remarks;
            unitOfWork.DirectPurchaseEntryRepository.Update(existingEntry);
        }
        else
        {
            existingEntry = new DirectPurchaseEntry
            {
                DirectAcquisitionId = da.Id,
                SupplierId = req.SupplierId,
                SupplierName = req.SupplierName,
                SupplierTIN = req.SupplierTIN,
                FinalAmount = req.FinalAmount,
                TransactionDate = req.TransactionDate,
                PaymentMethod = req.PaymentMethod,
                PayeeUserId = req.PayeeUserId,
                PayeeName = req.PaymentMethod == DirectAcquisitionPaymentMethodEnum.EMPLOYEE_REIMBURSEMENT ? req.PayeeName : null,
                Remarks = req.Remarks
            };
            await unitOfWork.DirectPurchaseEntryRepository.AddAsync(existingEntry, cancellationToken);
        }

        // 2. Remove previous proof documents for this purchase entry to avoid duplicate accumulation
        var existingDocs = await unitOfWork.DirectAcquisitionDocumentRepository
            .Query()
            .Where(d => d.DirectAcquisitionId == da.Id || d.DirectPurchaseEntryId == existingEntry.Id)
            .ToListAsync(cancellationToken);

        foreach (var oldDoc in existingDocs)
        {
            unitOfWork.DirectAcquisitionDocumentRepository.Remove(oldDoc, hardDelete: true);
        }

        // 3. Process new/retained proof files
        if (req.ProofFiles != null && req.ProofFiles.Count > 0)
        {
            foreach (var fileReq in req.ProofFiles)
            {
                string blobUrl = string.Empty;
                string fileName = !string.IsNullOrWhiteSpace(fileReq.FileName) ? fileReq.FileName.Trim() : string.Empty;

                try
                {
                    var (promotedUrl, originalName) = await fileStorageService.PromoteFileAsync(fileReq.FileId, cancellationToken);
                    blobUrl = promotedUrl;
                    if (string.IsNullOrWhiteSpace(fileName) && !string.IsNullOrEmpty(originalName))
                    {
                        fileName = originalName;
                    }
                }
                catch
                {
                    // Fallback to storing metadata if temp promotion is already done or file storage provider is local
                }

                if (string.IsNullOrWhiteSpace(fileName))
                {
                    fileName = "Proof_Document";
                }

                var doc = new DirectAcquisitionDocument
                {
                    DirectAcquisitionId = da.Id,
                    DirectPurchaseEntryId = existingEntry.Id,
                    FileId = fileReq.FileId,
                    FileName = fileName,
                    FileType = fileReq.FileType ?? (fileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? "pdf" : "image"),
                    BlobUrl = blobUrl,
                    DocumentType = fileReq.DocumentType ?? "PROOF_OF_TRANSACTION",
                    UploadedAt = DateTime.UtcNow
                };

                await unitOfWork.DirectAcquisitionDocumentRepository.AddAsync(doc, cancellationToken);
            }
        }

        // 3. Transition status to PURCHASE_ENTRY
        da.Status = DirectAcquisitionStatusEnum.PURCHASE_ENTRY;
        unitOfWork.DirectAcquisitionRepository.Update(da);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(da.Id, "Purchase entry recorded successfully.");
    }
}
