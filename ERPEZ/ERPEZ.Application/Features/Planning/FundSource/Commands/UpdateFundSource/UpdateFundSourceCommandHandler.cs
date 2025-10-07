using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FundSource.Commands.UpdateFundSource;

public class UpdateFundSourceCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<UpdateFundSourceCommand, ApiResponse<Domain.Entities.Planning.FundSource>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.FundSource>> Handle(UpdateFundSourceCommand request, CancellationToken cancellationToken)
    {
        var fundSource = await _unitOfWork.FundSourceRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Fund Source not found.");
        if (fundSource.Name == request.UpdateFundSource?.Name) throw new ConflictException("Fund Source already exist.");

        var dto = request.UpdateFundSource;
        fundSource.ParentId = dto?.ParentId ?? fundSource.ParentId;
        fundSource.Name = dto?.Name ?? fundSource.Name;
        fundSource.Code = dto?.Code ?? fundSource.Code;
        fundSource.Type = dto?.Type ?? fundSource.Type;
        fundSource.IsActive = dto?.IsActive ?? fundSource.IsActive;


        _unitOfWork.FundSourceRepository.Update(fundSource);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Domain.Entities.Planning.FundSource>.Success(fundSource, "Fund Source updated successfully.");
    }
}
