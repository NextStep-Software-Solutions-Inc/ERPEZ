using Newtonsoft.Json;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Security.Principal;

namespace ERPEZ.TenantManagement.Domain.Common
{
    public abstract class BaseEntity : IEntity
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [JsonProperty("id")]
        public Guid Id { get; set; }

        [JsonProperty("createdAt")]
        public DateTime CreatedAt { get; set; }

        [JsonProperty("createdBy")]
        public string CreatedBy { get; set; } = string.Empty;

        [JsonProperty("updatedAt")]
        public DateTime UpdatedAt { get; set; }

        [JsonProperty("updatedBy")]
        public Guid? UpdatedBy { get; set; }

        public bool IsDeleted { get; set; }

        [JsonProperty("deletedAt")]
        public DateTime DeletedAt { get; set; }

        [JsonProperty("deletedBy")]
        public Guid? DeletedBy { get; set; }

        public void SetNewId()
        {
            Id = Guid.NewGuid();
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
