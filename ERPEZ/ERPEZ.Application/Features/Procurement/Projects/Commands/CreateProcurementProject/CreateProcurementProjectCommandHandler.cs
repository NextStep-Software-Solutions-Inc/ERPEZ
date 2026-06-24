using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.CreateProcurementProject;

public class CreateProcurementProjectCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateProcurementProjectCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateProcurementProjectCommand request, CancellationToken cancellationToken)
    {
        var project = new ProcurementProject
        {
            Title = request.Title,
            ABC = request.ABC,
            Status = request.Status
        };

        var resolution = new BACResolution
        {
            ResolutionType = request.ResolutionType,
            ResolutionNumber = request.ResolutionNumber,
            DateResolved = request.DateResolved,
            WhereasClause = request.WhereasClause
        };

        project.BACResolutions.Add(resolution);

        await unitOfWork.ProcurementProjectRepository.AddAsync(project, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(project.Id, "Procurement project and initial BAC Resolution created successfully.");
    }
}
