using ERPEZ.Application.Features.Planning.WorkflowMatrix.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.WorkflowMatrix.Queries.GetWorkflowMatrices;

public class GetWorkflowMatricesQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetWorkflowMatricesQuery, PaginatedApiResponse<WorkflowMatrixResponse>>
{
    public async Task<PaginatedApiResponse<WorkflowMatrixResponse>> Handle(GetWorkflowMatricesQuery request, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            Filters = request.Filters,
            Sorts = request.Sorts,
            Page = request.Page,
            PageSize = request.PageSize
        };

        // Get workflow matrices with navigation properties
        var query = unitOfWork.WorkflowMatrixRepository.Query()
            .Include(wm => wm.FiscalYear)
            .Include(wm => wm.Office)
            .Include(wm => wm.RecommendingApproverPosition)
            .Include(wm => wm.FinalApproverPosition);

        // Apply Sieve filtering, sorting, and pagination
        var filteredQuery = unitOfWork.WorkflowMatrixRepository.ApplySieve(sieveModel, query);
        var totalCount = await filteredQuery.CountAsync(cancellationToken);
        var matrices = await filteredQuery.ToListAsync(cancellationToken);

        // Collect all unique position IDs
        var positionIds = matrices
            .SelectMany(wm => new[] { wm.RecommendingApproverPositionId, wm.FinalApproverPositionId })
            .Distinct()
            .ToList();

        // Batch load all active personnel positions for these positions
        var personnelPositions = await unitOfWork.PersonnelPositionRepository.Query()
            .Where(pp => positionIds.Contains(pp.PositionId) && pp.IsActive == true)
            .ToListAsync(cancellationToken);

        // Batch load all users
        var userIds = personnelPositions.Select(pp => pp.UserId).Distinct().ToList();
        var users = await unitOfWork.UserRepository.Query()
            .Where(u => userIds.Contains(u.Id))
            .ToListAsync(cancellationToken);

        // Create lookup dictionaries for efficient mapping
        var positionToPersonnel = personnelPositions.ToDictionary(pp => pp.PositionId);
        var userLookup = users.ToDictionary(u => u.Id);

        // Map to response DTOs
        var response = matrices.Select(wm =>
        {
            // Resolve recommending approver
            Guid? recommendingUserId = null;
            string? recommendingUserName = null;
            if (positionToPersonnel.TryGetValue(wm.RecommendingApproverPositionId, out var recPersonnel) &&
                userLookup.TryGetValue(recPersonnel.UserId, out var recUser))
            {
                recommendingUserId = recUser.Id;
                recommendingUserName = $"{recUser.FirstName} {recUser.LastName}";
            }

            // Resolve final approver
            Guid? finalUserId = null;
            string? finalUserName = null;
            if (positionToPersonnel.TryGetValue(wm.FinalApproverPositionId, out var finPersonnel) &&
                userLookup.TryGetValue(finPersonnel.UserId, out var finUser))
            {
                finalUserId = finUser.Id;
                finalUserName = $"{finUser.FirstName} {finUser.LastName}";
            }

            return new WorkflowMatrixResponse
            {
                Id = wm.Id,
                FiscalYearId = wm.FiscalYearId,
                FiscalYear = wm.FiscalYear?.Year ?? 0,
                OfficeId = wm.OfficeId,
                OfficeName = wm.Office?.Name ?? string.Empty,
                DocumentType = wm.DocumentType,
                
                // Position information
                RecommendingApproverPositionId = wm.RecommendingApproverPositionId,
                RecommendingApproverPositionTitle = wm.RecommendingApproverPosition?.Title ?? string.Empty,
                
                FinalApproverPositionId = wm.FinalApproverPositionId,
                FinalApproverPositionTitle = wm.FinalApproverPosition?.Title ?? string.Empty,
                
                // Resolved user information
                RecommendingApproverId = recommendingUserId,
                RecommendingApproverName = recommendingUserName,
                
                FinalApproverId = finalUserId,
                FinalApproverName = finalUserName,
                
                CreatedAt = wm.CreatedAt,
                CreatedBy = wm.CreatedBy,
                UpdatedAt = wm.UpdatedAt,
                UpdatedBy = wm.UpdatedBy
            };
        }).ToList();

        return new PaginatedApiResponse<WorkflowMatrixResponse>(response, request.Page ?? 1, request.PageSize ?? 10, totalCount);
    }
}
