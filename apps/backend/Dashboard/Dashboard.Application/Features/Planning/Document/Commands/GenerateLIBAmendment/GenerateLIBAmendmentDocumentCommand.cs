using ERPEZ.Application.Common.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

using ERPEZ.Application.Common.Interfaces;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateLIBAmendment;

public record GenerateLIBAmendmentDocumentCommand : IRequest<ApiResponse<Guid>>
{
    public Guid AmendmentRequestId { get; init; }
    public ExportFormat Format { get; init; } = ExportFormat.Pdf;
    public string GeneratedBy { get; set; } = string.Empty;
}

public class LibAmendmentDataDto : IAgencyLetterheadAware
{    
    public string? ProcuringEntityName { get; set; }
    public string? ProcuringEntityAddress { get; set; }
    public byte[]? LogoBytes { get; set; }
    public string? LetterheadAlignment { get; set; }

    public string LIBNumber     { get; set; } = string.Empty;
    public string OfficeName    { get; set; } = string.Empty;    
    public string FiscalYear    { get; set; } = string.Empty;    
    
    // Part 1
    public string ReasonCode    { get; set; } = string.Empty; // Maps to predefined reasons
    public string Justification { get; set; } = string.Empty; // User's custom explanation

    // Parts 2 & 3 share the same structural DTO
    public BudgetSectionDto ApprovedBudget { get; set; } = new();
    public BudgetSectionDto ProposedBudget { get; set; } = new();
    
    public List<SignatoryDto> Signatories  { get; set; } = [];
}

public class BudgetSectionDto
{
    public string Goal         { get; set; } = string.Empty;
    public string PREXC        { get; set; } = string.Empty;
    public List<ApiGroupDto> ApiGroups { get; set; } = [];
    public decimal GrandTotal  { get; set; }
}

public class ApiGroupDto
{
    public string          ActivityName { get; set; } = string.Empty;
    public List<ExpenseRowDto> Expenses { get; set; } = [];
    public decimal         SubTotal     { get; set; }
}

public class ExpenseRowDto
{
    public string  ExpenseItemName { get; set; } = string.Empty;
    public decimal Q1Budget        { get; set; }
    public decimal Q2Budget        { get; set; }
    public decimal Q3Budget        { get; set; }
    public decimal Q4Budget        { get; set; }
    public decimal TotalBudget     { get; set; }
}
