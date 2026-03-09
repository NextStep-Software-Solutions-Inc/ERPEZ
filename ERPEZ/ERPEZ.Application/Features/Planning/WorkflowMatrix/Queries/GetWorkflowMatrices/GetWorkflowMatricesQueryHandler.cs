using ERPEZ.Application.Features.Planning.WorkflowMatrix.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using System.Linq.Expressions;

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

        // Define projection for workflow matrices with basic navigation data
        Expression<Func<Domain.Entities.Planning.WorkflowMatrix, WorkflowMatrixResponse>> projection = wm => new WorkflowMatrixResponse
        {
            Id = wm.Id,
            FiscalYearId = wm.FiscalYearId,
            FiscalYear = wm.FiscalYear != null ? wm.FiscalYear.Year : 0,
            OfficeId = wm.OfficeId,
            OfficeName = wm.Office != null ? wm.Office.Name : string.Empty,
            DocumentType = wm.DocumentType,
            
            // Position information (always available)
            RecommendingApproverPositionId = wm.RecommendingApproverPositionId,
            RecommendingApproverPositionTitle = wm.RecommendingApproverPosition != null ? wm.RecommendingApproverPosition.Title : string.Empty,
            
            FinalApproverPositionId = wm.FinalApproverPositionId,
            FinalApproverPositionTitle = wm.FinalApproverPosition != null ? wm.FinalApproverPosition.Title : string.Empty,
            
            // User info will be resolved after query
            RecommendingApproverId = null,
            RecommendingApproverName = null,
            FinalApproverId = null,
            FinalApproverName = null,
            
            CreatedAt = wm.CreatedAt,
            CreatedBy = wm.CreatedBy,
            UpdatedAt = wm.UpdatedAt,
            UpdatedBy = wm.UpdatedBy
        };

        // Get paginated matrices using repository's GetAllAsync
        var (matrices, totalCount) = await unitOfWork.WorkflowMatrixRepository.GetAllAsync(sieveModel, projection, cancellationToken);

        // Collect all unique position IDs for batch loading
        var positionIds = matrices
            .SelectMany(m => new[] { m.RecommendingApproverPositionId, m.FinalApproverPositionId })
            .Distinct()
            .ToList();

        // Batch load all active personnel positions
        var personnelPositions = await unitOfWork.PersonnelPositionRepository.Query()
            .Where(pp => positionIds.Contains(pp.PositionId) && pp.IsActive == true)
            .ToListAsync(cancellationToken);

        // Batch load users
        var userIds = personnelPositions.Select(pp => pp.UserId).Distinct().ToList();
        var users = await unitOfWork.UserRepository.Query()
            .Where(u => userIds.Contains(u.Id))
            .ToListAsync(cancellationToken);

        // Create lookup dictionaries
        var positionToPersonnel = personnelPositions.ToDictionary(pp => pp.PositionId);
        var userLookup = users.ToDictionary(u => u.Id);

        // Resolve user information for each matrix
        var response = matrices.Select(matrix =>
        {
            // Resolve recommending approver
            Guid? recommendingApproverId = null;
            string? recommendingApproverName = null;
            if (positionToPersonnel.TryGetValue(matrix.RecommendingApproverPositionId, out var recPersonnel) &&
                userLookup.TryGetValue(recPersonnel.UserId, out var recUser))
            {
                recommendingApproverId = recUser.Id;
                recommendingApproverName = $"{recUser.FirstName} {recUser.LastName}";
            }

            // Resolve final approver
            Guid? finalApproverId = null;
            string? finalApproverName = null;
            if (positionToPersonnel.TryGetValue(matrix.FinalApproverPositionId, out var finPersonnel) &&
                userLookup.TryGetValue(finPersonnel.UserId, out var finUser))
            {
                finalApproverId = finUser.Id;
                finalApproverName = $"{finUser.FirstName} {finUser.LastName}";
            }

            // Return new response with resolved user info
            return new WorkflowMatrixResponse
            {
                Id = matrix.Id,
                FiscalYearId = matrix.FiscalYearId,
                FiscalYear = matrix.FiscalYear,
                OfficeId = matrix.OfficeId,
                OfficeName = matrix.OfficeName,
                DocumentType = matrix.DocumentType,
                
                RecommendingApproverPositionId = matrix.RecommendingApproverPositionId,
                RecommendingApproverPositionTitle = matrix.RecommendingApproverPositionTitle,
                FinalApproverPositionId = matrix.FinalApproverPositionId,
                FinalApproverPositionTitle = matrix.FinalApproverPositionTitle,
                
                // Resolved user information
                RecommendingApproverId = recommendingApproverId,
                RecommendingApproverName = recommendingApproverName,
                FinalApproverId = finalApproverId,
                FinalApproverName = finalApproverName,
                
                CreatedAt = matrix.CreatedAt,
                CreatedBy = matrix.CreatedBy,
                UpdatedAt = matrix.UpdatedAt,
                UpdatedBy = matrix.UpdatedBy
            };
        }).ToList();

        return new PaginatedApiResponse<WorkflowMatrixResponse>(response, request.Page ?? 1, request.PageSize ?? 10, totalCount);
    }
}

