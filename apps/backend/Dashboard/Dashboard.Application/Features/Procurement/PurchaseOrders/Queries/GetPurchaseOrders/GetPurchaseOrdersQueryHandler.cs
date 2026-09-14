using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.PurchaseOrders.DTOs;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.Queries.GetPurchaseOrders;

public class GetPurchaseOrdersQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPurchaseOrdersQuery, PaginatedApiResponse<PurchaseOrderListItemDto>>
{
    public async Task<PaginatedApiResponse<PurchaseOrderListItemDto>> Handle(GetPurchaseOrdersQuery request, CancellationToken cancellationToken)
    {
        var page = request.PageNumber > 0 ? request.PageNumber : 1;
        var pageSize = request.PageSize > 0 ? request.PageSize : 10;

        var sieveModel = new SieveModel
        {
            Page = page,
            PageSize = pageSize,
            Filters = request.Filters,
            Sorts = string.IsNullOrWhiteSpace(request.Sorts) ? "-CreatedAt" : request.Sorts
        };

        var (entities, totalCount) = await unitOfWork.PurchaseOrderRepository.GetPagedPurchaseOrdersAsync(
            sieveModel,
            request.Search,
            cancellationToken
        );

        // Batch resolve source document numbers
        var aobIds = entities
            .Where(e => e.SourceDocumentType == SourceDocumentTypeEnum.AOB)
            .Select(e => e.SourceDocumentId)
            .Distinct()
            .ToList();

        var noaIds = entities
            .Where(e => e.SourceDocumentType == SourceDocumentTypeEnum.NOA)
            .Select(e => e.SourceDocumentId)
            .Distinct()
            .ToList();

        var daIds = entities
            .Where(e => e.SourceDocumentType == SourceDocumentTypeEnum.BAC_RESOLUTION)
            .Select(e => e.SourceDocumentId)
            .Distinct()
            .ToList();

        var aobList = aobIds.Count > 0
            ? await unitOfWork.AOBRepository.FindAllAsync(a => aobIds.Contains(a.Id), cancellationToken)
            : [];
        var aobMap = aobList.ToDictionary(a => a.Id, a => a.AOBNumber);

        var noaList = noaIds.Count > 0
            ? await unitOfWork.NoticeOfAwardRepository.FindAllAsync(n => noaIds.Contains(n.Id), cancellationToken)
            : [];
        var noaMap = noaList.ToDictionary(n => n.Id, n => n.NOANumber);

        var daList = daIds.Count > 0
            ? await unitOfWork.DirectAcquisitionRepository.FindAllAsync(d => daIds.Contains(d.Id), cancellationToken)
            : [];
        var daMap = daList.ToDictionary(d => d.Id, d => !string.IsNullOrWhiteSpace(d.DANumber) ? d.DANumber : d.Id.ToString());

        var items = entities.Select(r =>
        {
            string sourceDocNumber = string.Empty;
            if (r.SourceDocumentType == SourceDocumentTypeEnum.AOB && aobMap.TryGetValue(r.SourceDocumentId, out var aobNum))
            {
                sourceDocNumber = aobNum;
            }
            else if (r.SourceDocumentType == SourceDocumentTypeEnum.NOA && noaMap.TryGetValue(r.SourceDocumentId, out var noaNum))
            {
                sourceDocNumber = noaNum;
            }
            else if (r.SourceDocumentType == SourceDocumentTypeEnum.BAC_RESOLUTION && daMap.TryGetValue(r.SourceDocumentId, out var daNum))
            {
                sourceDocNumber = daNum;
            }

            return new PurchaseOrderListItemDto
            {
                Id = r.Id,
                PONumber = r.PONumber,
                ProcurementMode = r.ProcurementMode,
                SourceDocumentType = r.SourceDocumentType,
                SourceDocumentId = r.SourceDocumentId,
                SourceDocumentNumber = sourceDocNumber,
                SupplierId = r.SupplierId,
                SupplierName = r.Supplier?.Name ?? string.Empty,
                Description = r.Description,
                Status = r.Status,
                Date = r.Date,
                TotalAmount = r.TotalAmount,
                ReturnReason = r.ReturnReason,
                ApprovedById = r.ApprovedById,
                ApprovedAt = r.ApprovedAt
            };
        }).ToList();

        return new PaginatedApiResponse<PurchaseOrderListItemDto>(items, page, pageSize, totalCount);
    }
}
