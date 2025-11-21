namespace ERPEZ.Infrastructure.Services;

public class AzureBlobStorageOptions
{
    public string ConnectionString { get; set; } = string.Empty;
    public string ContainerName { get; set; } = "files";
    public bool ForceAzureOnly { get; set; } = false;
}