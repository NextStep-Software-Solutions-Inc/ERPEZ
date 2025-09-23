using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class MFOKPI : BaseEntity
{
    public Guid MFOId { get; set; }
    public Guid KPIId { get; set; }
}
