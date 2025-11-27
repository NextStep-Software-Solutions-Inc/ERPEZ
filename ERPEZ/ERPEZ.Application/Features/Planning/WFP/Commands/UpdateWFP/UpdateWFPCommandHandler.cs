using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFP.Commands.UpdateWFP;

public class UpdateWFPCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateWFPCommand, ApiResponse<Domain.Entities.Planning.WFP>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.WFP>> Handle(UpdateWFPCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateWFP;

        var wfp = await unitOfWork.WFPRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("WFP not found.");

        var coalescedDeliveryUnitId = dto.DeliveryUnitId;
        var coalescedFiscalYear = dto.FiscalYear ?? wfp.FiscalYear;
        var coalescedProjectTitle = dto.ProjectTitle ?? wfp.ProjectTitle;
        var coalescedDescription = dto.Description ?? wfp.Description;
        var duplicate = await unitOfWork.WFPRepository.FindAsync(
            w => w.Id != request.Id
                && w.DeliveryUnitId == coalescedDeliveryUnitId
                && w.FiscalYear == coalescedFiscalYear
                && w.ProjectTitle == coalescedProjectTitle
                && w.Description == coalescedDescription,
            cancellationToken
        );

        if (duplicate != null) throw new ConflictException("WFP with the same Delivery Unit, Fiscal Year, Project Title, and Description already exists.");

        wfp.DeliveryUnitId = dto.DeliveryUnitId;
        wfp.FiscalYear = dto.FiscalYear ?? wfp.FiscalYear;
        wfp.ProjectTitle = dto.ProjectTitle ?? wfp.ProjectTitle;
        wfp.Description = dto.Description ?? wfp.Description;
        wfp.ProposedBudget = dto.ProposedBudget ?? wfp.ProposedBudget;
        wfp.GeneralObjective = dto.GeneralObjective ?? wfp.GeneralObjective;
        wfp.Status = dto.Status ?? wfp.Status;

        unitOfWork.WFPRepository.Update(wfp);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Domain.Entities.Planning.WFP>.Success(wfp, "WFP updated successfully.");
    }
}
