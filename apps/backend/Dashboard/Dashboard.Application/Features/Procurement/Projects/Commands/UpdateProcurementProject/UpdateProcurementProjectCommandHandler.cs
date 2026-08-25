using System.Linq;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.UpdateProcurementProject;

public class UpdateProcurementProjectCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateProcurementProjectCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateProcurementProjectCommand request, CancellationToken cancellationToken)
    {
        var project = await unitOfWork.ProcurementProjectRepository.GetWithBACResolutionsAsync(request.Id, cancellationToken);

        if (project == null)
        {
            return ApiResponse<Unit>.Fail("Procurement project not found.");
        }

        if (!string.Equals(project.Status, nameof(StatusEnum.Draft), System.StringComparison.OrdinalIgnoreCase))
        {
            return ApiResponse<Unit>.Fail("Only procurement projects in 'Draft' status can be updated.");
        }

        if (request.UpdateRequest.Title != null)
        {
            project.Title = request.UpdateRequest.Title;
        }

        if (!string.IsNullOrEmpty(request.UpdateRequest.Status))
        {
            project.Status = request.UpdateRequest.Status;
        }

        project.EndUserRepresentativeId = request.UpdateRequest.EndUserRepresentativeId;
        project.TechRepresentativeId = request.UpdateRequest.TechRepresentativeId;

        var resolution = project.BACResolutions.FirstOrDefault();
        if (resolution == null)
        {
            resolution = new BACResolution
            {
                ResolutionType = request.UpdateRequest.ResolutionType ?? string.Empty,
                ResolutionNumber = request.UpdateRequest.ResolutionNumber ?? string.Empty,
                DateResolved = request.UpdateRequest.DateResolved ?? DateTime.UtcNow,
                ResolvedLocation = request.UpdateRequest.ResolvedLocation
            };
            project.BACResolutions.Add(resolution);
        }
        else
        {
            if (request.UpdateRequest.ResolutionType != null)
                resolution.ResolutionType = request.UpdateRequest.ResolutionType;
            if (request.UpdateRequest.ResolutionNumber != null)
                resolution.ResolutionNumber = request.UpdateRequest.ResolutionNumber;
            if (request.UpdateRequest.DateResolved.HasValue)
                resolution.DateResolved = request.UpdateRequest.DateResolved.Value;
            if (request.UpdateRequest.ResolvedLocation != null)
                resolution.ResolvedLocation = request.UpdateRequest.ResolvedLocation;
        }

        if (request.UpdateRequest.WhereasClauses != null)
        {
            resolution.WhereasClauseItems.Clear();
            foreach (var clauseDto in request.UpdateRequest.WhereasClauses)
            {
                var clause = await unitOfWork.BACResolutionWhereasClauseRepository.GetByIdAsync(clauseDto.WhereasClauseId, cancellationToken);
                if (clause == null)
                {
                    return ApiResponse<Unit>.Fail($"BAC Resolution Whereas Clause with ID '{clauseDto.WhereasClauseId}' was not found.");
                }

                resolution.WhereasClauseItems.Add(new BACResolutionWhereasClauseItem
                {
                    BACResolutionId = resolution.Id,
                    BACResolutionWhereasClauseId = clauseDto.WhereasClauseId,
                    Order = clauseDto.Order
                });
            }
        }

        unitOfWork.ProcurementProjectRepository.Update(project);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Procurement project updated successfully.");
    }
}
