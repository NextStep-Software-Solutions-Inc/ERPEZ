using ERPEZ.Application.Features.Planning.WFP.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFP.Commands.CreateWFP;

public class CreateWFPCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateWFPCommand, ApiResponse<WFPResponse>>
{
    public async Task<ApiResponse<WFPResponse>> Handle(CreateWFPCommand request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.DeliveryUnitRepository.FindAsync(
            x => x.Id == request.DeliveryUnitId,
            cancellationToken) ?? throw new NotFoundException("Delivery Unit not found.");

        var duplicate = await unitOfWork.WFPRepository.FindAsync(w => w.ProjectTitle == request.ProjectTitle
            && w.DeliveryUnitId == request.DeliveryUnitId
            && w.Description == request.Description
            && w.FiscalYearId == request.FiscalYearId,
            cancellationToken
        );

        if (duplicate != null)
            throw new ConflictException("Work and Financial Plan with the same Delivery Unit, Fiscal Year, Project Title, and Description already exists.");

        // Parse string Status to StatusEnum (validation ensures this will succeed)
        var statusEnum = Enum.Parse<StatusEnum>(request.Status, ignoreCase: true);

        var wfp = new Domain.Entities.Planning.WFP
        {
            DeliveryUnitId = request.DeliveryUnitId,
            ProjectTitle = request.ProjectTitle,
            Description = request.Description,
            FiscalYearId = request.FiscalYearId,
            ProjectStartDate = request.ProjectStartDate,
            ProjectEndDate = request.ProjectEndDate,
            ProposedBudget = request.ProposedBudget,
            GeneralObjective = request.GeneralObjective,
            Status = statusEnum
        };

        await unitOfWork.WFPRepository.AddAsync(wfp, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new WFPResponse
        {
            Id = wfp.Id,
            DeliveryUnitId = wfp.DeliveryUnitId,
            ProjectTitle = wfp.ProjectTitle,
            Description = wfp.Description,
            FiscalYearId = wfp.FiscalYearId,
            ProjectStartDate = wfp.ProjectStartDate,
            ProjectEndDate = wfp.ProjectEndDate,
            ProposedBudget = wfp.ProposedBudget,
            GeneralObjective = wfp.GeneralObjective,
            Status = wfp.Status,
            CreatedAt = wfp.CreatedAt,
            CreatedBy = wfp.CreatedBy ?? string.Empty
        };
        return ApiResponse<WFPResponse>.Success(dto, "Work and Financial Plan created successfully.");
    }
}
