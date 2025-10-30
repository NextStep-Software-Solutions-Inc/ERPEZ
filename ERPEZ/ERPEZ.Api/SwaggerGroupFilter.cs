using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace ERPEZ.Api;
/// <summary>
/// Ensures only APIs explicitly tagged with a GroupName appear in that specific Swagger document.
/// </summary>
public class SwaggerGroupFilter : IDocumentFilter
{
    public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
    {
        var pathsToRemove = new List<string>();

        // The name of the document being built (e.g., "catalog" or "ams")
        var currentDocumentName = swaggerDoc.Info.Title;

        // Iterate through all paths currently in the document
        foreach (var pathKey in swaggerDoc.Paths.Keys.ToList()) // .ToList() prevents modification during iteration
        {
            bool pathFoundInGroup = false;

            // FIX: Iterate over the dictionary itself (KeyValuePair), not just the .Values
            foreach (var operationPair in swaggerDoc.Paths[pathKey].Operations)
            {
                // operationPair.Key is the OperationType (e.g., Get, Post)
                var httpMethodString = operationPair.Key.ToString().ToUpperInvariant();

                // Find the corresponding ApiDescription based on the Path and Method
                // Note: Path matching can be tricky due to parameters ({id} vs {id:int}). 
                // We use EndsWith for a more robust match on the path, and check the method.
                var apiDescription = context.ApiDescriptions.FirstOrDefault(a =>
                    a.RelativePath != null &&
                    // Check if the current Swagger path ends with the API Description's relative path
                    pathKey.TrimStart('/').EndsWith(a.RelativePath.TrimStart('/'), StringComparison.OrdinalIgnoreCase) &&
                    a.HttpMethod != null &&
                    a.HttpMethod.Equals(httpMethodString, StringComparison.OrdinalIgnoreCase)
                );

                // If we find a matching API description AND its group matches the current document, keep the path.
                if (apiDescription?.GroupName != null &&
                    apiDescription.GroupName.Equals(currentDocumentName, StringComparison.OrdinalIgnoreCase))
                {
                    pathFoundInGroup = true;
                    break; // Path contains at least one operation for this document
                }
            }

            // If no operation on this path belonged to the current document's group, flag the path for removal
            if (!pathFoundInGroup)
            {
                pathsToRemove.Add(pathKey);
            }
        }

        // Remove the paths that did not contain any operations belonging to this group
        foreach (var pathKey in pathsToRemove)
        {
            swaggerDoc.Paths.Remove(pathKey);
        }
    }
}
