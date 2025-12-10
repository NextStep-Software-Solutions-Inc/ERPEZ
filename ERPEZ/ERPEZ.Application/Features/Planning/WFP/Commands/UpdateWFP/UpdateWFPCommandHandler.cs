using ERPEZ.Domain.Enums;
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
            ?? throw new NotFoundException("Work and Financial Plan not found.");

        var coalescedDeliveryUnitId = dto.DeliveryUnitId;
        var coalescedFiscalYearId = dto.FiscalYearId ?? wfp.FiscalYearId;
        var coalescedProjectTitle = dto.ProjectTitle ?? wfp.ProjectTitle;
        var coalescedDescription = dto.Description ?? wfp.Description;
        
        var duplicate = await unitOfWork.WFPRepository.FindAsync(
            w => w.Id != request.Id
                && w.DeliveryUnitId == coalescedDeliveryUnitId
                && w.FiscalYearId == coalescedFiscalYearId
                && w.ProjectTitle == coalescedProjectTitle
                && w.Description == coalescedDescription,
            cancellationToken
        );

        if (duplicate != null) 
            throw new ConflictException("Work and Financial Plan with the same Delivery Unit, Fiscal Year, Project Title, and Description already exists.");

        wfp.DeliveryUnitId = dto.DeliveryUnitId;
        wfp.FiscalYearId = dto.FiscalYearId ?? wfp.FiscalYearId;
        wfp.ProjectTitle = dto.ProjectTitle ?? wfp.ProjectTitle;
        wfp.Description = dto.Description ?? wfp.Description;
        wfp.ProjectStartDate = dto.ProjectStartDate ?? wfp.ProjectStartDate;
        wfp.ProjectEndDate = dto.ProjectEndDate ?? wfp.ProjectEndDate;
        wfp.ProposedBudget = dto.ProposedBudget ?? wfp.ProposedBudget;
        wfp.GeneralObjective = dto.GeneralObjective ?? wfp.GeneralObjective;
        
        // Parse string Status to StatusEnum if provided (validation ensures this will succeed)
        if (!string.IsNullOrWhiteSpace(dto.Status))
        {
            wfp.Status = Enum.Parse<StatusEnum>(dto.Status, ignoreCase: true);
        }

        unitOfWork.WFPRepository.Update(wfp);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Domain.Entities.Planning.WFP>.Success(wfp, "Work and Financial Plan updated successfully.");
    }
}
