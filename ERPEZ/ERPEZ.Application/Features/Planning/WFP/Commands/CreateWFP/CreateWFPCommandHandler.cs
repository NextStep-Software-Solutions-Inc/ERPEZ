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
            && w.Description == request.Description
            && w.FiscalYearId == request.FiscalYearId,
            cancellationToken
        );

        if (duplicate != null)
            throw new ConflictException("Work and Financial Plan with the same Office, Fiscal Year, Project Title, and Description already exists.");

        var wfp = new Domain.Entities.Planning.WFP
        {
            OfficeId = request.OfficeId,
            ProjectTitle = request.ProjectTitle,
            Description = request.Description,
            FiscalYearId = request.FiscalYearId,
            ProjectStartDate = request.ProjectStartDate,
            ProjectEndDate = request.ProjectEndDate,
            ProposedBudget = request.ProposedBudget,
            GeneralObjective = request.GeneralObjective,
            Mode = Enum.Parse<ModeEnum>(request.Mode, true).ToString(),
            Status = StatusEnum.Draft,
        };

        await unitOfWork.WFPRepository.AddAsync(wfp, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(wfp.Id, "Work and Financial Plan created successfully.");
    }
}
