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
        _ = await unitOfWork.PPMPRepository.GetByIdAsync(request.PPMPId, cancellationToken)
            ?? throw new NotFoundException("PPMP not found.");

        _ = await unitOfWork.LineItemBudgetActivityRepository.GetByIdAsync(request.LIBActivityId, cancellationToken)
            ?? throw new NotFoundException("LIB Activity not found.");

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
