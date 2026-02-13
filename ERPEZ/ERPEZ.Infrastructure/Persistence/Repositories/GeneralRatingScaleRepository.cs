using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Infrastructure.Persistence;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class GeneralRatingScaleRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) 
    : Repository<GeneralRatingScale>(context, sieveProcessor), IGeneralRatingScaleRepository
{
}
