namespace ERPEZ.Application.Features.Planning.Document.Dtos;

public class WfpObjectiveDto
{
    public string              ObjectiveText { get; set; } = string.Empty;
    public List<WfpActivityDto> Activities   { get; set; } = [];
}