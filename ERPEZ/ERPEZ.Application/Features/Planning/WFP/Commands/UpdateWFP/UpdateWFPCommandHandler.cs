using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFP.Commands.UpdateWFP;

public class UpdateWFPCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<UpdateWFPCommand, ApiResponse<Domain.Entities.Planning.WFP>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.WFP>> Handle(UpdateWFPCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateWFP;

        var wfp = await _unitOfWork.WFPRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("WFP not found.");

        var duplicate = await _unitOfWork.WFPRepository.FindAsync(
            w => w.DeliveryUnitId == dto.DeliveryUnitId 
            && w.FiscalYear == dto.FiscalYear
            && w.ProgramTitle == dto.ProgramTitle
            && w.Description == dto.Description,
            cancellationToken
        );

        if (duplicate != null)
            throw new ConflictException("WFP with the same Delivery Unit, Fiscal Year, Program Title, and Description already exists.");
        wfp.DeliveryUnitId = dto.DeliveryUnitId ?? wfp.DeliveryUnitId;
        wfp.FiscalYear = dto.FiscalYear ?? wfp.FiscalYear;
        wfp.ProgramTitle = dto.ProgramTitle ?? wfp.ProgramTitle;
        wfp.Description = dto.Description ?? wfp.Description;
        wfp.ProposedBudget = dto.ProposedBudget ?? wfp.ProposedBudget;
        wfp.GeneralObjective = dto.GeneralObjective ?? wfp.GeneralObjective;
        wfp.Status = dto.Status ?? wfp.Status;

        _unitOfWork.WFPRepository.Update(wfp);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Domain.Entities.Planning.WFP>.Success(wfp, "WFP updated successfully.");
    }
}
