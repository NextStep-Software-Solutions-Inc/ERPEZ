using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using Sieve.Services;

namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Queries.GetNoticeToProceeds;

public class GetNoticeToProceedsQueryHandler(IUnitOfWork unitOfWork, ISieveProcessor sieveProcessor)
    : IRequestHandler<GetNoticeToProceedsQuery, PaginatedApiResponse<NoticeToProceedListDto>>
{
    public async Task<PaginatedApiResponse<NoticeToProceedListDto>> Handle(GetNoticeToProceedsQuery query, CancellationToken cancellationToken)
    {
        var dbQuery = unitOfWork.NoticeToProceedRepository.QueryWithDetails()
            .Where(n => !n.IsDeleted);

        if (!string.IsNullOrWhiteSpace(query.Status) && Enum.TryParse<NoticeToProceedStatus>(query.Status, true, out var parsedStatus))
        {
            dbQuery = dbQuery.Where(n => n.Status == parsedStatus);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim().ToLower();
            dbQuery = dbQuery.Where(n =>
                n.NTPNumber.ToLower().Contains(term) ||
                (n.Description != null && n.Description.ToLower().Contains(term)) ||
                (n.ContractNumberSnapshot != null && n.ContractNumberSnapshot.ToLower().Contains(term)) ||
                (n.SupplierNameSnapshot != null && n.SupplierNameSnapshot.ToLower().Contains(term)) ||
                (n.ProjectTitleSnapshot != null && n.ProjectTitleSnapshot.ToLower().Contains(term)) ||
                (n.Contract != null && (
                    n.Contract.ContractNumber.ToLower().Contains(term) ||
                    (n.Contract.NoticeOfAward != null && (
                        (n.Contract.NoticeOfAward.Supplier != null && n.Contract.NoticeOfAward.Supplier.Name.ToLower().Contains(term)) ||
                        (n.Contract.NoticeOfAward.ProcurementProject != null && n.Contract.NoticeOfAward.ProcurementProject.Title.ToLower().Contains(term))
                    ))
                ))
            );
        }

        var page = query.PageNumber > 0 ? query.PageNumber : 1;
        var pageSize = query.PageSize > 0 ? query.PageSize : 10;

        var sieveModel = new SieveModel
        {
            PageSize = pageSize,
            Page = page,
            Filters = query.Filters,
            Sorts = string.IsNullOrWhiteSpace(query.Sorts) ? "-CreatedAt" : query.Sorts
        };

        var filteredQuery = sieveProcessor.Apply(sieveModel, dbQuery, applyPagination: false);
        var totalList = await unitOfWork.NoticeToProceedRepository.ToListAsync(filteredQuery, cancellationToken);
        var count = totalList.Count;

        var paginatedQuery = sieveProcessor.Apply(sieveModel, filteredQuery, applyFiltering: false, applySorting: false);
        var entities = await unitOfWork.NoticeToProceedRepository.ToListAsync(paginatedQuery, cancellationToken);

        var dtoList = entities.Select(n =>
        {
            var contract = n.Contract;
            var noa = contract?.NoticeOfAward;
            var supplier = noa?.Supplier;
            var project = noa?.ProcurementProject;

            var contractNumber = !string.IsNullOrWhiteSpace(n.ContractNumberSnapshot)
                ? n.ContractNumberSnapshot
                : (contract?.ContractNumber ?? string.Empty);

            var supplierName = !string.IsNullOrWhiteSpace(n.SupplierNameSnapshot)
                ? n.SupplierNameSnapshot
                : (supplier?.Name ?? string.Empty);

            var projectTitle = !string.IsNullOrWhiteSpace(n.ProjectTitleSnapshot)
                ? n.ProjectTitleSnapshot
                : (project?.Title ?? string.Empty);

            var totalAmount = (n.Status == NoticeToProceedStatus.Issued || n.Status == NoticeToProceedStatus.Received) && n.AwardedAmountSnapshot > 0
                ? n.AwardedAmountSnapshot
                : (noa?.AwardedAmount ?? 0m);

            return new NoticeToProceedListDto
            {
                Id = n.Id,
                NTPNumber = n.NTPNumber,
                ContractId = n.ContractId,
                NTPDate = n.NTPDate,
                EffectivityDate = n.EffectivityDate,
                CommencementDate = n.CommencementDate,
                ImplementationPeriodDays = n.ImplementationPeriodDays,
                DeliveryCompletionDeadline = n.DeliveryCompletionDeadline,
                PlaceOfDelivery = n.PlaceOfDelivery,
                Description = n.Description,
                Status = n.Status,

                ContractNumber = contractNumber,
                ContractDate = contract?.ContractDate ?? default,
                SupplierId = supplier?.Id ?? noa?.SupplierId ?? Guid.Empty,
                SupplierName = supplierName,
                ProcurementProjectId = project?.Id ?? noa?.ProcurementProjectId ?? Guid.Empty,
                ProjectTitle = projectTitle,
                TotalAmount = totalAmount,

                IssuedByName = n.IssuedByName,
                IssuedAt = n.IssuedAt,
                ReceivedAt = n.ReceivedAt,
                ReceivedByName = n.ReceivedByName,

                CreatedAt = n.CreatedAt,
                UpdatedAt = n.UpdatedAt
            };
        }).ToList();

        return new PaginatedApiResponse<NoticeToProceedListDto>(
            dtoList,
            query.PageNumber,
            query.PageSize,
            count
        );
    }
}
