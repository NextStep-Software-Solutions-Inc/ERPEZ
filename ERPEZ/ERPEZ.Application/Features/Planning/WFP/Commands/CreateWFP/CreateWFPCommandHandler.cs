using ERPEZ.Application.Features.Planning.WFP.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFP.Commands.CreateWFP;

public class CreateWFPCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<CreateWFPCommand, ApiResponse<WFPDto>>
{
    public async Task<ApiResponse<WFPDto>> Handle(CreateWFPCommand request, CancellationToken cancellationToken)
    {
        _ = await _unitOfWork.DeliveryUnitRepository.FindAsync(
            x => x.Id == request.DeliveryUnitId,
            cancellationToken) ?? throw new NotFoundException("Delivery Unit not found.");
        var duplicate = await _unitOfWork.WFPRepository.FindAsync(w => w.ProgramTitle == request.ProgramTitle
        && w.DeliveryUnitId == request.DeliveryUnitId
        && w.Description == request.Description
        && w.FiscalYear == request.FiscalYear,
        cancellationToken
        );

        if (duplicate != null)
            throw new ConflictException("WFP with the same Delivery Unit, Fiscal Year, Program Title, and Description already exists.");

        var wfp = new Domain.Entities.Planning.WFP
        {
            DeliveryUnitId = request.DeliveryUnitId,
            ProgramTitle = request.ProgramTitle,
            Description = request.Description,
            FiscalYear = request.FiscalYear,
            ProposedBudget = request.ProposedBudget,
            GeneralObjective = request.GeneralObjective,
            Status = request.Status
        };

        await _unitOfWork.WFPRepository.AddAsync(wfp, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new WFPDto
        {
            Id = wfp.Id,
            DeliveryUnitId = wfp.DeliveryUnitId,
            ProgramTitle = wfp.ProgramTitle,
            Description = wfp.Description,
            FiscalYear = wfp.FiscalYear,
            ProposedBudget = wfp.ProposedBudget,
            GeneralObjective = wfp.GeneralObjective,
            Status = wfp.Status
        };
        return ApiResponse<WFPDto>.Success(dto, "WFP created successfully.");
    }
}
