using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace ERPEZ.Api.Configuration;

/// <summary>
/// Swagger operation filter to handle file uploads with IFormFile parameters.
/// Configures the OpenAPI spec to properly document multipart/form-data requests.
/// </summary>
public class SwaggerFileOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        // Check if the operation has IFormFile parameters
        var hasFileUpload = context.MethodInfo.GetParameters()
            .Any(p => p.ParameterType == typeof(IFormFile));

        if (!hasFileUpload)
            return;

        // Update the operation to use multipart/form-data
        operation.RequestBody = new OpenApiRequestBody
        {
            Content = new Dictionary<string, OpenApiMediaType>
            {
                {
                    "multipart/form-data",
                    new OpenApiMediaType
                    {
                        Schema = new OpenApiSchema
                        {
                            Type = "object",
                            Properties = context.MethodInfo.GetParameters()
                                .ToDictionary(
                                    p => p.Name ?? string.Empty,
                                    p => GetSchemaForParameter(p))
                        }
                    }
                }
            }
        };
    }

    private static OpenApiSchema GetSchemaForParameter(System.Reflection.ParameterInfo parameter)
    {
        if (parameter.ParameterType == typeof(IFormFile))
        {
            return new OpenApiSchema
            {
                Type = "string",
                Format = "binary",
                Description = "File to upload"
            };
        }

        // Handle other form parameters
        if (parameter.ParameterType == typeof(string))
            return new OpenApiSchema { Type = "string" };

        if (parameter.ParameterType == typeof(bool))
            return new OpenApiSchema { Type = "boolean" };

        if (parameter.ParameterType == typeof(int))
            return new OpenApiSchema { Type = "integer", Format = "int32" };

        // Handle enums
        if (parameter.ParameterType.IsEnum)
        {
            var enumValues = Enum.GetValues(parameter.ParameterType)
                .Cast<int>()
                .Select(x => (IOpenApiAny)new OpenApiInteger(x))
                .ToList();
            
            return new OpenApiSchema
            {
                Type = "integer",
                Format = "int32",
                Enum = enumValues
            };
        }

        return new OpenApiSchema { Type = "object" };
    }
}
