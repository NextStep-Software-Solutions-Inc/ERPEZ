using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFP.Commands.UpdateWFP;

public class UpdateWFPCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateWFPCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateWFPCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateWFP;

        var wfp = await unitOfWork.WFPRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("Work and Financial Plan not found.");

        var coalescedOfficeId = dto.OfficeId ?? wfp.OfficeId;
        var coalescedProjectTitle = dto.ProjectTitle ?? wfp.ProjectTitle;
        var coalescedMode = dto.Mode ?? wfp.Mode;
        
        var duplicate = await unitOfWork.WFPRepository.FindAsync(
            w => w.Id != request.Id
                && w.OfficeId == coalescedOfficeId
                && w.ProjectTitle == coalescedProjectTitle
                && w.Mode == coalescedMode,
            cancellationToken
        );

        if (duplicate != null) 
            throw new ConflictException("Work and Financial Plan with the same Office, Mode, and Project Title already exists.");

        wfp.OfficeId = dto.OfficeId ?? wfp.OfficeId;
        wfp.OPCRId = dto.OPCRId ?? wfp.OPCRId;
        wfp.FundSourceId = dto.FundSourceId ?? wfp.FundSourceId;
        wfp.ProjectTitle = dto.ProjectTitle ?? wfp.ProjectTitle;
        wfp.ProjectStartDate = dto.ProjectStartDate ?? wfp.ProjectStartDate;
        wfp.ProjectEndDate = dto.ProjectEndDate ?? wfp.ProjectEndDate;
        wfp.ProposedBudget = dto.ProposedBudget ?? wfp.ProposedBudget;
        wfp.GeneralObjective = dto.GeneralObjective ?? wfp.GeneralObjective;
        wfp.Mode = dto.Mode ?? wfp.Mode;

        unitOfWork.WFPRepository.Update(wfp);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Work and Financial Plan updated successfully.");
    }
}
