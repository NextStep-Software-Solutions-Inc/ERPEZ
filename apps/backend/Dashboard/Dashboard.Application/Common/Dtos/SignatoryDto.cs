namespace ERPEZ.Application.Common.Dtos;

public class SignatoryDto
{
    public string Label { get; set; } = string.Empty;
    public string PrintedName { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;
    public DateTime? Date { get; set; }
}