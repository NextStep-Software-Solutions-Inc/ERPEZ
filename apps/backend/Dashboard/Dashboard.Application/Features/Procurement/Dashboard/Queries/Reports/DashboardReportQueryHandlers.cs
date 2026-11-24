using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.Dashboard.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.Dashboard.Queries.Reports;

public class GetPRReportQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPRReportQuery, PaginatedApiResponse<PRReportDto>>
{
    public async Task<PaginatedApiResponse<PRReportDto>> Handle(
        GetPRReportQuery query, CancellationToken cancellationToken)
    {
        var baseQuery = unitOfWork.PurchaseRequestRepository.Query(p => !p.IsDeleted && p.CreatedAt.Year == query.FiscalYear);

        if (query.OfficeId.HasValue && query.OfficeId.Value != Guid.Empty)
            baseQuery = baseQuery.Where(p => p.OfficeId == query.OfficeId.Value);

        if (query.DateFrom.HasValue)
            baseQuery = baseQuery.Where(p => p.CreatedAt >= query.DateFrom.Value.ToDateTime(TimeOnly.MinValue));

        if (query.DateTo.HasValue)
            baseQuery = baseQuery.Where(p => p.CreatedAt <= query.DateTo.Value.ToDateTime(TimeOnly.MaxValue));

        if (!string.IsNullOrWhiteSpace(query.Status) && Enum.TryParse<ERPEZ.Domain.Enums.StatusEnum>(query.Status, true, out var statusEnum))
            baseQuery = baseQuery.Where(p => p.Status == statusEnum);

        if (!string.IsNullOrWhiteSpace(query.SearchTerm))
        {
            var search = query.SearchTerm.Trim().ToLower();
            baseQuery = baseQuery.Where(p => p.PRNumber.ToLower().Contains(search) || p.Purpose.ToLower().Contains(search));
        }

        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var pageNumber = query.PageNumber > 0 ? query.PageNumber : 1;
        var pageSize = query.PageSize > 0 ? query.PageSize : 10;

        var items = await baseQuery
            .Include(p => p.Office)
            .OrderByDescending(p => p.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new PRReportDto
            {
                Id = p.Id,
                PRNumber = p.PRNumber,
                OfficeName = p.Office != null ? p.Office.Name : "N/A",
                Purpose = p.Purpose,
                PRType = p.PRType.ToString(),
                TotalAmount = p.TotalAmount,
                Status = p.Status.ToString(),
                RequestedDate = p.RequestedDate
            })
            .ToListAsync(cancellationToken);

        return new PaginatedApiResponse<PRReportDto>(items, pageNumber, pageSize, totalCount);
    }
}

public class GetConsolidatedPRReportQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetConsolidatedPRReportQuery, PaginatedApiResponse<ConsolidatedPRReportDto>>
{
    public async Task<PaginatedApiResponse<ConsolidatedPRReportDto>> Handle(
        GetConsolidatedPRReportQuery query, CancellationToken cancellationToken)
    {
        var baseQuery = unitOfWork.ConsolidatedPRRepository.Query(c => !c.IsDeleted && c.CreatedAt.Year == query.FiscalYear);

        if (query.DateFrom.HasValue)
            baseQuery = baseQuery.Where(c => c.CreatedAt >= query.DateFrom.Value.ToDateTime(TimeOnly.MinValue));

        if (query.DateTo.HasValue)
            baseQuery = baseQuery.Where(c => c.CreatedAt <= query.DateTo.Value.ToDateTime(TimeOnly.MaxValue));

        if (!string.IsNullOrWhiteSpace(query.Status) && Enum.TryParse<ERPEZ.Domain.Enums.StatusEnum>(query.Status, true, out var statusEnum))
            baseQuery = baseQuery.Where(c => c.Status == statusEnum);

        if (!string.IsNullOrWhiteSpace(query.SearchTerm))
        {
            var search = query.SearchTerm.Trim().ToLower();
            baseQuery = baseQuery.Where(c => c.CPRNumber.ToLower().Contains(search) || (c.Description != null && c.Description.ToLower().Contains(search)));
        }

        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var pageNumber = query.PageNumber > 0 ? query.PageNumber : 1;
        var pageSize = query.PageSize > 0 ? query.PageSize : 10;

        var items = await baseQuery
            .Include(c => c.ConsolidatedPRItems)
            .OrderByDescending(c => c.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new ConsolidatedPRReportDto
            {
                Id = c.Id,
                CPRNumber = c.CPRNumber,
                Description = c.Description ?? c.Purpose ?? "Consolidated PR",
                TotalAmount = c.TotalAmount,
                PRsCount = c.ConsolidatedPRItems.Count,
                Status = c.Status.ToString(),
                ConsolidationDate = c.ConsolidationDate
            })
            .ToListAsync(cancellationToken);

        return new PaginatedApiResponse<ConsolidatedPRReportDto>(items, pageNumber, pageSize, totalCount);
    }
}

public class GetRFQReportQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetRFQReportQuery, PaginatedApiResponse<RFQReportDto>>
{
    public async Task<PaginatedApiResponse<RFQReportDto>> Handle(
        GetRFQReportQuery query, CancellationToken cancellationToken)
    {
        var baseQuery = unitOfWork.RFQRepository.Query(r => !r.IsDeleted && r.CreatedAt.Year == query.FiscalYear);

        if (query.DateFrom.HasValue)
            baseQuery = baseQuery.Where(r => r.CreatedAt >= query.DateFrom.Value.ToDateTime(TimeOnly.MinValue));

        if (query.DateTo.HasValue)
            baseQuery = baseQuery.Where(r => r.CreatedAt <= query.DateTo.Value.ToDateTime(TimeOnly.MaxValue));

        if (!string.IsNullOrWhiteSpace(query.Status) && Enum.TryParse<ERPEZ.Domain.Enums.StatusEnum>(query.Status, true, out var statusEnum))
            baseQuery = baseQuery.Where(r => r.Status == statusEnum);

        if (!string.IsNullOrWhiteSpace(query.SearchTerm))
        {
            var search = query.SearchTerm.Trim().ToLower();
            baseQuery = baseQuery.Where(r => r.RFQNumber.ToLower().Contains(search) || (r.Description != null && r.Description.ToLower().Contains(search)));
        }

        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var pageNumber = query.PageNumber > 0 ? query.PageNumber : 1;
        var pageSize = query.PageSize > 0 ? query.PageSize : 10;

        var items = await baseQuery
            .Include(r => r.ModeOfProcurement)
            .Include(r => r.RFQSuppliers)
            .OrderByDescending(r => r.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new RFQReportDto
            {
                Id = r.Id,
                RFQNumber = r.RFQNumber,
                Description = r.Description ?? r.Purpose ?? "RFQ",
                ModeName = r.ModeOfProcurement != null ? r.ModeOfProcurement.Name : "Public Bidding",
                Deadline = r.Deadline,
                Status = r.Status.ToString(),
                TotalAmount = r.TotalAmount,
                SuppliersCount = r.RFQSuppliers.Count
            })
            .ToListAsync(cancellationToken);

        return new PaginatedApiResponse<RFQReportDto>(items, pageNumber, pageSize, totalCount);
    }
}

public class GetNOAReportQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetNOAReportQuery, PaginatedApiResponse<NOAReportDto>>
{
    public async Task<PaginatedApiResponse<NOAReportDto>> Handle(
        GetNOAReportQuery query, CancellationToken cancellationToken)
    {
        var baseQuery = unitOfWork.NoticeOfAwardRepository.Query(n => !n.IsDeleted && n.CreatedAt.Year == query.FiscalYear);

        if (query.DateFrom.HasValue)
            baseQuery = baseQuery.Where(n => n.CreatedAt >= query.DateFrom.Value.ToDateTime(TimeOnly.MinValue));

        if (query.DateTo.HasValue)
            baseQuery = baseQuery.Where(n => n.CreatedAt <= query.DateTo.Value.ToDateTime(TimeOnly.MaxValue));

        if (!string.IsNullOrWhiteSpace(query.Status) && Enum.TryParse<ERPEZ.Domain.Enums.NoticeOfAwardStatus>(query.Status, true, out var statusEnum))
            baseQuery = baseQuery.Where(n => n.Status == statusEnum);

        if (!string.IsNullOrWhiteSpace(query.SearchTerm))
        {
            var search = query.SearchTerm.Trim().ToLower();
            baseQuery = baseQuery.Where(n => n.NOANumber.ToLower().Contains(search) || n.Description.ToLower().Contains(search));
        }

        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var pageNumber = query.PageNumber > 0 ? query.PageNumber : 1;
        var pageSize = query.PageSize > 0 ? query.PageSize : 10;

        var items = await baseQuery
            .Include(n => n.Supplier)
            .OrderByDescending(n => n.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(n => new NOAReportDto
            {
                Id = n.Id,
                NOANumber = n.NOANumber,
                Description = n.Description,
                SupplierName = n.Supplier != null ? n.Supplier.Name : "N/A",
                AwardedAmount = n.AwardedAmount,
                Status = n.Status.ToString(),
                NOADate = n.NOADate
            })
            .ToListAsync(cancellationToken);

        return new PaginatedApiResponse<NOAReportDto>(items, pageNumber, pageSize, totalCount);
    }
}

public class GetNTPReportQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetNTPReportQuery, PaginatedApiResponse<NTPReportDto>>
{
    public async Task<PaginatedApiResponse<NTPReportDto>> Handle(
        GetNTPReportQuery query, CancellationToken cancellationToken)
    {
        var baseQuery = unitOfWork.NoticeToProceedRepository.Query(n => !n.IsDeleted && n.CreatedAt.Year == query.FiscalYear);

        if (query.DateFrom.HasValue)
            baseQuery = baseQuery.Where(n => n.CreatedAt >= query.DateFrom.Value.ToDateTime(TimeOnly.MinValue));

        if (query.DateTo.HasValue)
            baseQuery = baseQuery.Where(n => n.CreatedAt <= query.DateTo.Value.ToDateTime(TimeOnly.MaxValue));

        if (!string.IsNullOrWhiteSpace(query.Status) && Enum.TryParse<ERPEZ.Domain.Enums.NoticeToProceedStatus>(query.Status, true, out var statusEnum))
            baseQuery = baseQuery.Where(n => n.Status == statusEnum);

        if (!string.IsNullOrWhiteSpace(query.SearchTerm))
        {
            var search = query.SearchTerm.Trim().ToLower();
            baseQuery = baseQuery.Where(n => n.NTPNumber.ToLower().Contains(search) || (n.ContractNumberSnapshot != null && n.ContractNumberSnapshot.ToLower().Contains(search)));
        }

        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var pageNumber = query.PageNumber > 0 ? query.PageNumber : 1;
        var pageSize = query.PageSize > 0 ? query.PageSize : 10;

        var items = await baseQuery
            .Include(n => n.Contract)
            .OrderByDescending(n => n.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(n => new NTPReportDto
            {
                Id = n.Id,
                NTPNumber = n.NTPNumber,
                ContractNumber = n.ContractNumberSnapshot ?? (n.Contract != null ? n.Contract.ContractNumber : "N/A"),
                SupplierName = n.SupplierNameSnapshot ?? "N/A",
                Status = n.Status.ToString(),
                NTPDate = n.NTPDate,
                EffectivityDate = n.EffectivityDate,
                DeliveryCompletionDeadline = n.DeliveryCompletionDeadline
            })
            .ToListAsync(cancellationToken);

        return new PaginatedApiResponse<NTPReportDto>(items, pageNumber, pageSize, totalCount);
    }
}

public class GetPOReportQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPOReportQuery, PaginatedApiResponse<POReportDto>>
{
    public async Task<PaginatedApiResponse<POReportDto>> Handle(
        GetPOReportQuery query, CancellationToken cancellationToken)
    {
        var baseQuery = unitOfWork.PurchaseOrderRepository.Query(p => !p.IsDeleted && p.CreatedAt.Year == query.FiscalYear);

        if (query.DateFrom.HasValue)
            baseQuery = baseQuery.Where(p => p.CreatedAt >= query.DateFrom.Value.ToDateTime(TimeOnly.MinValue));

        if (query.DateTo.HasValue)
            baseQuery = baseQuery.Where(p => p.CreatedAt <= query.DateTo.Value.ToDateTime(TimeOnly.MaxValue));

        if (!string.IsNullOrWhiteSpace(query.Status) && Enum.TryParse<ERPEZ.Domain.Enums.StatusEnum>(query.Status, true, out var statusEnum))
            baseQuery = baseQuery.Where(p => p.Status == statusEnum);

        if (!string.IsNullOrWhiteSpace(query.SearchTerm))
        {
            var search = query.SearchTerm.Trim().ToLower();
            baseQuery = baseQuery.Where(p => p.PONumber.ToLower().Contains(search));
        }

        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var pageNumber = query.PageNumber > 0 ? query.PageNumber : 1;
        var pageSize = query.PageSize > 0 ? query.PageSize : 10;

        var items = await baseQuery
            .Include(p => p.Supplier)
            .OrderByDescending(p => p.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new POReportDto
            {
                Id = p.Id,
                PONumber = p.PONumber,
                SupplierName = p.Supplier != null ? p.Supplier.Name : "N/A",
                TotalAmount = p.TotalAmount,
                Status = p.Status.ToString(),
                Date = p.Date,
                DeliveryTerm = p.DeliveryTerm
            })
            .ToListAsync(cancellationToken);

        return new PaginatedApiResponse<POReportDto>(items, pageNumber, pageSize, totalCount);
    }
}

public class GetContractReportQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetContractReportQuery, PaginatedApiResponse<ContractReportDto>>
{
    public async Task<PaginatedApiResponse<ContractReportDto>> Handle(
        GetContractReportQuery query, CancellationToken cancellationToken)
    {
        var baseQuery = unitOfWork.ContractRepository.Query(c => !c.IsDeleted && c.CreatedAt.Year == query.FiscalYear);

        if (query.DateFrom.HasValue)
            baseQuery = baseQuery.Where(c => c.CreatedAt >= query.DateFrom.Value.ToDateTime(TimeOnly.MinValue));

        if (query.DateTo.HasValue)
            baseQuery = baseQuery.Where(c => c.CreatedAt <= query.DateTo.Value.ToDateTime(TimeOnly.MaxValue));

        if (!string.IsNullOrWhiteSpace(query.Status) && Enum.TryParse<ERPEZ.Domain.Enums.ContractStatus>(query.Status, true, out var statusEnum))
            baseQuery = baseQuery.Where(c => c.Status == statusEnum);

        if (!string.IsNullOrWhiteSpace(query.SearchTerm))
        {
            var search = query.SearchTerm.Trim().ToLower();
            baseQuery = baseQuery.Where(c => c.ContractNumber.ToLower().Contains(search) || c.Description.ToLower().Contains(search));
        }

        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var pageNumber = query.PageNumber > 0 ? query.PageNumber : 1;
        var pageSize = query.PageSize > 0 ? query.PageSize : 10;

        var items = await baseQuery
            .Include(c => c.NoticeOfAward)
                .ThenInclude(n => n.Supplier)
            .OrderByDescending(c => c.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new ContractReportDto
            {
                Id = c.Id,
                ContractNumber = c.ContractNumber,
                Description = c.Description,
                SupplierName = c.NoticeOfAward != null && c.NoticeOfAward.Supplier != null ? c.NoticeOfAward.Supplier.Name : "N/A",
                TotalAmount = c.NoticeOfAward != null ? c.NoticeOfAward.AwardedAmount : 0,
                Status = c.Status.ToString(),
                ContractDate = c.ContractDate,
                ContractApprovedAt = c.ContractApprovedAt
            })
            .ToListAsync(cancellationToken);

        return new PaginatedApiResponse<ContractReportDto>(items, pageNumber, pageSize, totalCount);
    }
}

public class GetDirectContractingReportQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetDirectContractingReportQuery, PaginatedApiResponse<DirectContractingReportDto>>
{
    public async Task<PaginatedApiResponse<DirectContractingReportDto>> Handle(
        GetDirectContractingReportQuery query, CancellationToken cancellationToken)
    {
        var baseQuery = unitOfWork.DirectContractingRepository.Query(d => !d.IsDeleted && d.CreatedAt.Year == query.FiscalYear);

        if (query.DateFrom.HasValue)
            baseQuery = baseQuery.Where(d => d.CreatedAt >= query.DateFrom.Value.ToDateTime(TimeOnly.MinValue));

        if (query.DateTo.HasValue)
            baseQuery = baseQuery.Where(d => d.CreatedAt <= query.DateTo.Value.ToDateTime(TimeOnly.MaxValue));

        if (!string.IsNullOrWhiteSpace(query.Status) && Enum.TryParse<ERPEZ.Domain.Enums.DirectContractingStatusEnum>(query.Status, true, out var statusEnum))
            baseQuery = baseQuery.Where(d => d.Status == statusEnum);

        if (!string.IsNullOrWhiteSpace(query.SearchTerm))
        {
            var search = query.SearchTerm.Trim().ToLower();
            baseQuery = baseQuery.Where(d => d.DCNumber.ToLower().Contains(search) || d.Name.ToLower().Contains(search));
        }

        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var pageNumber = query.PageNumber > 0 ? query.PageNumber : 1;
        var pageSize = query.PageSize > 0 ? query.PageSize : 10;

        var items = await baseQuery
            .Include(d => d.ExclusiveSupplier)
            .OrderByDescending(d => d.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(d => new DirectContractingReportDto
            {
                Id = d.Id,
                DCNumber = d.DCNumber,
                Name = d.Name,
                SupplierName = d.ExclusiveSupplier != null ? d.ExclusiveSupplier.Name : "N/A",
                TotalABC = d.TotalABC,
                Status = d.Status.ToString(),
                SubmissionDeadline = d.SubmissionDeadline
            })
            .ToListAsync(cancellationToken);

        return new PaginatedApiResponse<DirectContractingReportDto>(items, pageNumber, pageSize, totalCount);
    }
}

public class GetDirectAcquisitionReportQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetDirectAcquisitionReportQuery, PaginatedApiResponse<DirectAcquisitionReportDto>>
{
    public async Task<PaginatedApiResponse<DirectAcquisitionReportDto>> Handle(
        GetDirectAcquisitionReportQuery query, CancellationToken cancellationToken)
    {
        var baseQuery = unitOfWork.DirectAcquisitionRepository.Query(d => !d.IsDeleted && d.CreatedAt.Year == query.FiscalYear);

        if (query.DateFrom.HasValue)
            baseQuery = baseQuery.Where(d => d.CreatedAt >= query.DateFrom.Value.ToDateTime(TimeOnly.MinValue));

        if (query.DateTo.HasValue)
            baseQuery = baseQuery.Where(d => d.CreatedAt <= query.DateTo.Value.ToDateTime(TimeOnly.MaxValue));

        if (!string.IsNullOrWhiteSpace(query.Status) && Enum.TryParse<ERPEZ.Domain.Enums.DirectAcquisitionStatusEnum>(query.Status, true, out var statusEnum))
            baseQuery = baseQuery.Where(d => d.Status == statusEnum);

        if (!string.IsNullOrWhiteSpace(query.SearchTerm))
        {
            var search = query.SearchTerm.Trim().ToLower();
            baseQuery = baseQuery.Where(d => d.DANumber.ToLower().Contains(search) || (d.Remarks != null && d.Remarks.ToLower().Contains(search)));
        }

        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var pageNumber = query.PageNumber > 0 ? query.PageNumber : 1;
        var pageSize = query.PageSize > 0 ? query.PageSize : 10;

        var items = await baseQuery
            .OrderByDescending(d => d.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(d => new DirectAcquisitionReportDto
            {
                Id = d.Id,
                DANumber = d.DANumber,
                Remarks = d.Remarks ?? "Direct Acquisition",
                TotalABC = d.TotalABC,
                Status = d.Status.ToString(),
                CreatedAt = d.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return new PaginatedApiResponse<DirectAcquisitionReportDto>(items, pageNumber, pageSize, totalCount);
    }
}
