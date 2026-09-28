using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.Contracts.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using Sieve.Services;

namespace ERPEZ.Application.Features.Procurement.Contracts.Queries.GetContracts;

public class GetContractsQueryHandler(IUnitOfWork unitOfWork, ISieveProcessor sieveProcessor)
    : IRequestHandler<GetContractsQuery, PaginatedApiResponse<ContractListDto>>
{
    public async Task<PaginatedApiResponse<ContractListDto>> Handle(GetContractsQuery query, CancellationToken cancellationToken)
    {
        var dbQuery = unitOfWork.ContractRepository.QueryWithDetails()
            .Where(c => !c.IsDeleted);

        if (!string.IsNullOrWhiteSpace(query.Status) && Enum.TryParse<ContractStatus>(query.Status, true, out var parsedStatus))
        {
            dbQuery = dbQuery.Where(c => c.Status == parsedStatus);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim().ToLower();
            dbQuery = dbQuery.Where(c =>
                c.ContractNumber.ToLower().Contains(term) ||
                c.Description.ToLower().Contains(term) ||
                (c.NoticeOfAward != null && (
                    c.NoticeOfAward.NOANumber.ToLower().Contains(term) ||
                    (c.NoticeOfAward.Supplier != null && c.NoticeOfAward.Supplier.Name.ToLower().Contains(term)) ||
                    (c.NoticeOfAward.ProcurementProject != null && c.NoticeOfAward.ProcurementProject.Title.ToLower().Contains(term))
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
        var totalList = await unitOfWork.ContractRepository.ToListAsync(filteredQuery, cancellationToken);
        var count = totalList.Count;

        var paginatedQuery = sieveProcessor.Apply(sieveModel, filteredQuery, applyFiltering: false, applySorting: false);
        var entities = await unitOfWork.ContractRepository.ToListAsync(paginatedQuery, cancellationToken);

        var dtoList = entities.Select(c => new ContractListDto
        {
            Id = c.Id,
            ContractNumber = c.ContractNumber,
            NoticeOfAwardId = c.NoticeOfAwardId,
            NOANumber = c.NoticeOfAward?.NOANumber ?? string.Empty,
            ContractDate = c.ContractDate,
            Description = c.Description,
            Status = c.Status,
            SupplierId = c.NoticeOfAward?.SupplierId ?? Guid.Empty,
            SupplierName = c.NoticeOfAward?.Supplier?.Name ?? string.Empty,
            ProcurementProjectId = c.NoticeOfAward?.ProcurementProjectId ?? Guid.Empty,
            ProjectTitle = c.NoticeOfAward?.ProcurementProject?.Title ?? string.Empty,
            TotalAmount = c.NoticeOfAward?.AwardedAmount ?? 0m,
            SubmittedById = c.SubmittedById,
            SubmittedAt = c.SubmittedAt,
            ApprovedById = c.ApprovedById,
            ApprovedByName = c.ApprovedByName,
            ApprovedAt = c.ApprovedAt,
            ApprovalRemarks = c.ApprovalRemarks,
            ReturnRemarks = c.ReturnRemarks,
            ReturnedById = c.ReturnedById,
            ReturnedAt = c.ReturnedAt,
            ExecutedAt = c.ExecutedAt,
            ExecutedById = c.ExecutedById,
            ExecutedByName = c.ExecutedByName,
            ContractApprovedAt = c.ContractApprovedAt,
            SignedContractFileId = c.SignedContractFileId,
            SignedContractFileName = c.SignedContractFileName,
            LateExecutionJustification = c.LateExecutionJustification,
            JustificationLoggedAt = c.JustificationLoggedAt,
            CreatedAt = c.CreatedAt,
            UpdatedAt = c.UpdatedAt
        }).ToList();

        return new PaginatedApiResponse<ContractListDto>(
            dtoList,
            query.PageNumber,
            query.PageSize,
            count
        );
    }
}
