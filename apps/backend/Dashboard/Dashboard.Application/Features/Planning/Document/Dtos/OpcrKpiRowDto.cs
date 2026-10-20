    // ERPEZ.Application/Features/Planning/Document/Dtos/OpcrDataDto.cs
    using ERPEZ.Application.Common.Dtos;
    using ERPEZ.Application.Common.Interfaces;
    namespace ERPEZ.Application.Features.Planning.Document.Dtos;

    public class OpcrDataDto : IAgencyLetterheadAware
    {
        public string? ProcuringEntityName
        {
            get => AgencyName;
            set => AgencyName = value ?? string.Empty;
        }
        public string? ProcuringEntityAddress { get; set; }
        public byte[]? LogoBytes { get; set; }
        public string? LetterheadAlignment { get; set; }

        public string OfficeName               { get; set; } = string.Empty;
        public string OfficeCode               { get; set; } = string.Empty;
        public string AgencyName               { get; set; } = string.Empty;
        public string CommitmentPersonName     { get; set; } = string.Empty;
        public string CommitmentPersonPosition { get; set; } = string.Empty;
        public string FiscalYear               { get; set; } = string.Empty;
        public string PeriodCovered            { get; set; } = string.Empty;
        public string RatingPeriod             { get; set; } = string.Empty;
        public bool   IncludeRatings           { get; set; }
        public List<string> RatingScaleLegend { get; set; } = [];
        public List<OpcrFunctionCategoryDto> FunctionCategories { get; set; } = [];
        public decimal            TotalBudget  { get; set; }
        public List<SignatoryDto> Signatories  { get; set; } = [];
    }

    public class OpcrFunctionCategoryDto
    {
        public string  CategoryName { get; set; } = string.Empty;
        public decimal Percentage   { get; set; }
        public List<OpcrMFOGroupDto> MFOGroups { get; set; } = [];
    }

    public class OpcrMFOGroupDto
    {
        public string MFOCode { get; set; } = string.Empty;
        public string MFOName { get; set; } = string.Empty;
        public string MFOType { get; set; } = string.Empty;
        public List<OpcrKpiRowDto> KpiRows { get; set; } = [];
    }

    public class OpcrKpiRowDto
    {
        public string  SDAGoalsPREXC      { get; set; } = string.Empty;
        public string? GadMeasure          { get; set; }
        public string  PerformanceIndicator { get; set; } = string.Empty;
        public string  KpiCode             { get; set; } = string.Empty;

        // Targets
        public string Q1Target    { get; set; } = string.Empty;
        public string Q2Target    { get; set; } = string.Empty;
        public string Q3Target    { get; set; } = string.Empty;
        public string Q4Target    { get; set; } = string.Empty;
        public string TotalTarget { get; set; } = string.Empty;

        // Activities
        public List<OpcrActivityRowDto> Activities { get; set; } = [];

        // Ratings-only (IncludeRatings = true)
        public string?  ActualAccomplishment { get; set; }
        public decimal? QRating              { get; set; } // Quantity
        public decimal? ERating              { get; set; } // Efficiency
        public decimal? TRating              { get; set; } // Timeliness
        public decimal? AveRating            { get; set; } // Average of Q/E/T
        public string?  AdjectivalRating     { get; set; } // Derived from RatingScaleTemplate
        public string?  PMTRemark            { get; set; }
        
        // ✅ Add — MOV requirement names for the Mode of Verification column
        public List<string> MOVRequirements  { get; set; } = [];
    }

    public class OpcrActivityRowDto
    {
        public string  ActivityName { get; set; } = string.Empty;
        public decimal Budget       { get; set; }
        public string  Departments  { get; set; } = string.Empty;
    }