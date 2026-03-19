using ERPEZ.Application.Features.Planning.WorkflowMatrix.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.WorkflowMatrix.Queries.GetWorkflowMatrices;

public class GetWorkflowMatricesQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetWorkflowMatricesQuery, PaginatedApiResponse<WorkflowMatrixResponse>>
{
    public async Task<PaginatedApiResponse<WorkflowMatrixResponse>> Handle(GetWorkflowMatricesQuery request, CancellationToken cancellationToken)
    {
        var page = request.Page.GetValueOrDefault(1);
        if (page < 1)
            page = 1;

        var pageSize = request.PageSize.GetValueOrDefault(10);
        if (pageSize <= 0)
            pageSize = 10;

        var sieveModel = new SieveModel
        {
            Filters = request.Filters,
            Sorts = request.Sorts,
            Page = page,
            PageSize = pageSize
        };

        // Get workflow matrices with count from Repository (uses async pagination)
        var (matrices, totalCount) = await unitOfWork.WorkflowMatrixRepository.GetPagedWithNavigationAsync(sieveModel, cancellationToken);

        // Collect all unique position IDs for batch loading
        var positionIds = matrices
            .SelectMany(m => new[] { m.RecommendingApproverPositionId, m.FinalApproverPositionId })
            .Distinct()
            .ToList();

        // Batch load all active personnel positions
        var personnelPositionsQuery = unitOfWork.PersonnelPositionRepository.Query(
            pp => positionIds.Contains(pp.PositionId) && pp.IsActive == true);
        var personnelPositions = await unitOfWork.PersonnelPositionRepository.ToListAsync(
            personnelPositionsQuery,
            cancellationToken);

        // Batch load users
        var userIds = personnelPositions.Select(pp => pp.UserId).Distinct().ToList();
        var usersQuery = unitOfWork.UserRepository.Query(u => userIds.Contains(u.Id));
        var users = await unitOfWork.UserRepository.ToListAsync(usersQuery, cancellationToken);

        // Create lookup dictionaries (Use GroupBy to avoid duplicate key exceptions)
        var positionToPersonnel = personnelPositions
            .GroupBy(pp => pp.PositionId)
            .ToDictionary(g => g.Key, g => g.First());
        var userLookup = users.ToDictionary(u => u.Id);

        // Map to response with nested structure
        var response = matrices.Select(wm =>
        {
            // Resolve recommending approver user
            UserInfo? recommendingUser = null;
            if (positionToPersonnel.TryGetValue(wm.RecommendingApproverPositionId, out var recPersonnel) &&
                userLookup.TryGetValue(recPersonnel.UserId, out var recUserEntity))
            {
                recommendingUser = new UserInfo
                {
                    Id = recUserEntity.Id,
                    Name = $"{recUserEntity.FirstName} {recUserEntity.LastName}",
                    Email = recUserEntity.Email ?? string.Empty
                };
            }

            // Resolve final approver user
            UserInfo? finalUser = null;
            if (positionToPersonnel.TryGetValue(wm.FinalApproverPositionId, out var finPersonnel) &&
                userLookup.TryGetValue(finPersonnel.UserId, out var finUserEntity))
            {
                finalUser = new UserInfo
                {
                    Id = finUserEntity.Id,
                    Name = $"{finUserEntity.FirstName} {finUserEntity.LastName}",
                    Email = finUserEntity.Email ?? string.Empty
                };
            }

            return new WorkflowMatrixResponse
            {
                Id = wm.Id,
                FiscalYearId = wm.FiscalYearId,
                FiscalYear = wm.FiscalYear?.Year ?? 0,
                OfficeId = wm.OfficeId,
                OfficeName = wm.Office?.Name ?? string.Empty,
                DocumentType = wm.DocumentType,
                Status = wm.Status,
                
                // Nested recommending approver
                RecommendingApprover = new ApproverInfo
                {
                    Position = new PositionInfo
                    {
                        Id = wm.RecommendingApproverPositionId,
                        Title = wm.RecommendingApproverPosition?.Title ?? string.Empty,
                        Code = wm.RecommendingApproverPosition?.Code ?? string.Empty
                    },
                    CurrentUser = recommendingUser
                },
                
                // Nested final approver
                FinalApprover = new ApproverInfo
                {
                    Position = new PositionInfo
                    {
                        Id = wm.FinalApproverPositionId,
                        Title = wm.FinalApproverPosition?.Title ?? string.Empty,
                        Code = wm.FinalApproverPosition?.Code ?? string.Empty
                    },
                    CurrentUser = finalUser
                },
                CreatedAt = wm.CreatedAt,
                CreatedBy = wm.CreatedBy,
                UpdatedAt = wm.UpdatedAt,
                UpdatedBy = wm.UpdatedBy
            };
        }).ToList();

        return new PaginatedApiResponse<WorkflowMatrixResponse>(response, page, pageSize, totalCount);
    }
}
