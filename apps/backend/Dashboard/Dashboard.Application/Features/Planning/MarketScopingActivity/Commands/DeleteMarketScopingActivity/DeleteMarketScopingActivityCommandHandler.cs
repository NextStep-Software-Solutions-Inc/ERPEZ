using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MarketScopingActivity.Commands.DeleteMarketScopingActivity;

public class DeleteMarketScopingActivityCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteMarketScopingActivityCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteMarketScopingActivityCommand request, CancellationToken cancellationToken)
    {
        var activity = await unitOfWork.MarketScopingActivityRepository.GetByIdAsync(request.Id, cancellationToken);

        if (activity == null)
            throw new NotFoundException("Market Scoping Activity not found.");

        unitOfWork.MarketScopingActivityRepository.Remove(activity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Market Scoping Activity deleted successfully.");
    }
}
