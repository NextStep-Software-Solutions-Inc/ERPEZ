using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IProcurementActivityTypeRepository : IRepository<ProcurementActivityType>
{
    // Base repository is sufficient as ProcurementActivityType doesn't have complex navigation dependencies
}
