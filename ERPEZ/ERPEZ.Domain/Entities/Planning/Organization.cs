using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class Organization : BaseEntity
{
    public Guid? ParentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public virtual Organization? ParentOrganization { get; set; }
    public virtual List<Organization> Organizations { get; set; } = [];
    public virtual List<Transaction> Transactions { get; set; } = [];
}
