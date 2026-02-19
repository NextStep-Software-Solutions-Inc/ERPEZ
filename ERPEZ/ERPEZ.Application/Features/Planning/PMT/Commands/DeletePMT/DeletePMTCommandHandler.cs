using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PMT.Commands.DeletePMT;

public class DeletePMTCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeletePMTCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeletePMTCommand request, CancellationToken cancellationToken)
    {
        var pmt = await unitOfWork.PMTRepository.GetByIdAsync(
            request.Id,
            cancellationToken
        );

        if (pmt == null)
            throw new NotFoundException($"PMT with ID '{request.Id}' not found.");

        unitOfWork.PMTRepository.Remove(pmt);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value);
    }
}
