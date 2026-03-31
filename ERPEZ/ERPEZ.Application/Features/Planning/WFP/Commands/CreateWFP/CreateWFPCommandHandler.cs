using ERPEZ.Application.Features.Planning.WFP.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFP.Commands.CreateWFP;

public class CreateWFPCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateWFPCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateWFPCommand request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.OfficeRepository.FindAsync(
            x => x.Id == request.OfficeId,
            cancellationToken) ?? throw new NotFoundException("Office not found.");

        var duplicate = await unitOfWork.WFPRepository.FindAsync(w => w.ProjectTitle == request.ProjectTitle
            && w.OfficeId == request.OfficeId
            && w.Mode == request.Mode,
            cancellationToken
        );

        if (duplicate != null)
            throw new ConflictException("Work and Financial Plan with the same Office, Mode, and Project Title already exists.");

        var wfp = new Domain.Entities.Planning.WFP
        {
            OfficeId = request.OfficeId,
            ProjectTitle = request.ProjectTitle,
            OPCRId = request.OPCRId,
            FundSourceId = request.FundSourceId,
            ProjectStartDate = request.ProjectStartDate,
            ProjectEndDate = request.ProjectEndDate,
            ProposedBudget = request.ProposedBudget,
            GeneralObjective = request.GeneralObjective,
            Mode = request.Mode,
            Status = StatusEnum.Draft,
        };

        await unitOfWork.WFPRepository.AddAsync(wfp, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(wfp.Id, "Work and Financial Plan created successfully.");
    }
}
