using System.Text.Json.Serialization;
using ERPEZ.Application.Features.Planning.MFOPAP.Dtos;
using ERPEZ.Application.Features.Planning.Office.Dtos;
using ERPEZ.Application.Features.Planning.SDG.Dtos;

namespace ERPEZ.Application.Features.Planning.DeliveryUnit.Dtos
{
    public record DeliveryUnitResponse
    {
        public Guid Id { get; init; }
        public required OfficeResponse Office { get; init; }
        public Guid? ParentDUId { get; init; }
        public List<KPIAssignmentResponse> KPIAssignments { get; init; } = [];
        public DateTime CreatedAt { get; init; }

    }
    public  record KPIAssignmentResponse
    {
        public Guid Id { get; init; }
        [JsonPropertyName("KPI")]
        public required KPI KPI { get; init; }
        public List<KPITargetResponse> Targets { get; init; } = [];
        public decimal AllocatedTargetValue { get; init; }
        public string? DateAssigned { get; init; }
        
        [JsonPropertyName("subKPIs")]
        public List<SubKPI> SubKPIs { get; init; } = [];
    }

    public record KPITargetResponse
    {
        public Guid Id { get; init; }
        public required string Period { get; init; } 
        public string? QuarterName { get; init;  }
        public decimal TargetValue { get; init;  }
    }

    public record KPI
    {
        public Guid Id { get; init; }
        public required string Name { get; init; }
        public string? Description { get; init; }
        public required string FunctionType { get; init;  }
        [JsonPropertyName("MFOPAPs")]
        public required List<MFOPAPResponse> MFOPAPs { get; init;  }
        [JsonPropertyName("SDGs")]
        public List<string> SDGs { get; init; } = [];

       
    }

    public record SubKPI
    {
        public Guid Id { get; init; }
        public required string Name { get; init; }
        public string? Description { get; init; }
        public required string FunctionType { get; init; }
        public List<string> SDGs { get; init; } = [];
        public decimal AllocatedTargetValue { get; init; }
    }
}


