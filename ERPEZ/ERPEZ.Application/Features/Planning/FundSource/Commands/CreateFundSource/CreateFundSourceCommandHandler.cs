using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FundSource.Commands.CreateFundSource;

public class CreateFundSourceCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<CreateFundSourceCommand, ApiResponse<Domain.Entities.Planning.FundSource>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.FundSource>> Handle(CreateFundSourceCommand request, CancellationToken cancellationToken)
    {
        var fundSourceExist = await _unitOfWork.FundSourceRepository.FindAsync(t => t.Name == request.Name, cancellationToken: cancellationToken);
        if (fundSourceExist != null) throw new ConflictException("Fund Source already exists.");
        var fundSource = new Domain.Entities.Planning.FundSource
        {
            ParentId = request.ParentId,
            Name = request.Name,
            Code = request.Code,
            Type = request.Type,
            IsActive = request.IsActive
        };
        await _unitOfWork.FundSourceRepository.AddAsync(fundSource, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<Domain.Entities.Planning.FundSource>.Success(fundSource, "Fund Source created successfully.");
    }
}
