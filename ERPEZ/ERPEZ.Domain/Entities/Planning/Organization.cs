using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class Organization : BaseEntity
{
    public Guid? ParentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public List<Transaction> Transactions { get; set; } = [];
}
