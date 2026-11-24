using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IRatingScaleTemplateRepository : IRepository<RatingScaleTemplate>
{
    Task<RatingScaleTemplate?> GetTemplateWithLevelsAsync(Guid id, CancellationToken cancellationToken = default);
}
