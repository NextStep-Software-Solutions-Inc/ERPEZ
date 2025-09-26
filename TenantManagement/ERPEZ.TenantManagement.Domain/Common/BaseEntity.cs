using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERPEZ.TenantManagement.Domain.Common
{
    public abstract class BaseEntity : IEntity
    {
        protected BaseEntity()
        {   
            Id = Guid.NewGuid();
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
            IsDeleted = false; 
        }

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; protected set; }
        public DateTime CreatedAt { get; protected set; }
        public string CreatedBy { get; protected set; } = string.Empty;
        public DateTime UpdatedAt { get; protected set; }
        public Guid? UpdatedBy { get; protected set; }
        public bool IsDeleted { get; protected set; }
        public DateTime DeletedAt { get; protected set; }
        public Guid? DeletedBy { get; protected set; }

        // --- Public Methods for CQRS Handlers to use ---

        public void MarkAsCreated(string createdBy)
        {
            this.CreatedBy = createdBy;
            this.UpdatedBy = null; 
            this.UpdatedAt = this.CreatedAt;
        }

        public void MarkAsUpdated(Guid? updatedBy)
        {
            this.UpdatedAt = DateTime.UtcNow;
            this.UpdatedBy = updatedBy;
        }

        // Method to facilitate soft-deletion from a non-derived class (like a handler)
        public void MarkAsDeleted(Guid? deletedBy)
        {
            this.IsDeleted = true;
            this.DeletedAt = DateTime.UtcNow;
            this.DeletedBy = deletedBy;
        }

        // Method to restore a soft-deleted entity
        public void MarkAsUndeleted()
        {
            this.IsDeleted = false;
            this.DeletedAt = default; 
            this.DeletedBy = null;
        }
    }
}