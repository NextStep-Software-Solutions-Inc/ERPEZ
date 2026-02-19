using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.GeneralRatingScale.Commands.CreateGeneralRatingScale;

public class CreateGeneralRatingScaleCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateGeneralRatingScaleCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateGeneralRatingScaleCommand request, CancellationToken cancellationToken)
    {
        var fiscalYear = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId, cancellationToken);
        if (fiscalYear == null)
            throw new NotFoundException("Fiscal Year not found.");

        var existingScale = await unitOfWork.GeneralRatingScaleRepository.FindAsync(
            x => x.FiscalYearId == request.FiscalYearId && x.AdjectivalRatingName == request.AdjectivalRatingName,
            cancellationToken);

        if (existingScale != null)
            throw new ConflictException("General Rating Scale already exists for this Fiscal Year and Adjectival Rating Name combination.");

        var entity = new Domain.Entities.Planning.GeneralRatingScale
        {
            Id = Guid.NewGuid(),
            FiscalYearId = request.FiscalYearId,
            AdjectivalRatingName = request.AdjectivalRatingName,
            MinScore = request.MinScore,
            MaxScore = request.MaxScore
        };

        await unitOfWork.GeneralRatingScaleRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id);
    }
}
