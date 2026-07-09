using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.UpdateProcurementProject;

public class UpdateProcurementProjectCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateProcurementProjectCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateProcurementProjectCommand request, CancellationToken cancellationToken)
    {
        var project = await unitOfWork.ProcurementProjectRepository.Query()
            .Include(p => p.BACResolutions)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (project == null)
        {
            return ApiResponse<Unit>.Fail("Procurement project not found.");
        }

        if (!string.Equals(project.Status, "Draft", System.StringComparison.OrdinalIgnoreCase))
        {
            return ApiResponse<Unit>.Fail("Only procurement projects in 'Draft' status can be updated.");
        }

        project.Title = request.UpdateRequest.Title;
        project.ABC = request.UpdateRequest.ABC;
        project.Status = request.UpdateRequest.Status;
        project.EndUserRepresentativeId = request.UpdateRequest.EndUserRepresentativeId;
        project.TechRepresentativeId = request.UpdateRequest.TechRepresentativeId;

        var resolution = project.BACResolutions.FirstOrDefault();
        if (resolution == null)
        {
            resolution = new BACResolution
            {
                ResolutionType = request.UpdateRequest.ResolutionType,
                ResolutionNumber = request.UpdateRequest.ResolutionNumber,
                DateResolved = request.UpdateRequest.DateResolved,
                WhereasClause = request.UpdateRequest.WhereasClause
            };
            project.BACResolutions.Add(resolution);
        }
        else
        {
            resolution.ResolutionType = request.UpdateRequest.ResolutionType;
            resolution.ResolutionNumber = request.UpdateRequest.ResolutionNumber;
            resolution.DateResolved = request.UpdateRequest.DateResolved;
            resolution.WhereasClause = request.UpdateRequest.WhereasClause;
        }

        unitOfWork.ProcurementProjectRepository.Update(project);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Procurement project updated successfully.");
    }
}
