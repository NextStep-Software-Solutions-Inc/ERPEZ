using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPOutcome.Commands.DeleteWFPOutcome;

public class DeleteWFPOutcomeCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteWFPOutcomeCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteWFPOutcomeCommand request, CancellationToken cancellationToken)
    {
        var req = await unitOfWork.WFPOutcomeRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("WFP Outcome not found.");

        unitOfWork.WFPOutcomeRepository.Remove(req);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"WFP Outcome with ID {request.Id} deleted successfully.");
    }
}
