using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMPActivity.Commands.CreatePPMPActivity;

public class CreatePPMPActivityCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreatePPMPActivityCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreatePPMPActivityCommand request, CancellationToken cancellationToken)
    {
        var ppmp = await unitOfWork.PPMPRepository.GetByIdAsync(request.PPMPId, cancellationToken)
            ?? throw new NotFoundException("PPMP not found.");

        if (ppmp.Status is Domain.Enums.StatusEnum.Submitted or Domain.Enums.StatusEnum.Approved or Domain.Enums.StatusEnum.ForApproval)
            throw new BadRequestException($"Cannot add activities when PPMP status is {ppmp.Status}.");

        var libActivity = await unitOfWork.LineItemBudgetActivityRepository.GetByIdAsync(request.LIBActivityId, cancellationToken)
            ?? throw new NotFoundException("LIB Activity not found.");

        // ✅ Validate that the LIBActivity belongs to the LIB linked to this PPMP
        if (ppmp.LIBId == null || libActivity.LineItemBudgetId != ppmp.LIBId)
            throw new BadRequestException("The selected LIB Activity does not belong to the LIB linked to this PPMP.");

        var existing = await unitOfWork.PPMPActivityRepository.FindAsync(
            x => x.PPMPId == request.PPMPId && x.LIBActivityId == request.LIBActivityId,
            cancellationToken);

        if (existing != null)
            throw new ConflictException("PPMP Activity already exists for this PPMP and LIB Activity.");

        var entity = new Domain.Entities.Planning.PPMPActivity
        {
            Id = Guid.NewGuid(),
            PPMPId = request.PPMPId,
            LIBActivityId = request.LIBActivityId,
            CreatedAt = DateTime.UtcNow
        };

        await unitOfWork.PPMPActivityRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "PPMP Activity created successfully.");
    }
}