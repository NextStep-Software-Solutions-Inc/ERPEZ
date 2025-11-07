using ERPEZ.Shared.Middlewares;

namespace ERPEZ.Api;

public static class DependencyInjection
{
    public static IServiceCollection AddApiServices(this IServiceCollection services)
    {
        services.AddControllers();
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();
        services.AddCors(options =>
        {
            options.AddPolicy("development",
                builder =>
                {
                    builder.AllowAnyOrigin()
                           .AllowAnyMethod()
                           .AllowAnyHeader();
                });
            options.AddPolicy("production",
                builder =>
                {
                    builder.WithOrigins("https://erpez.api.nextstep-software.com")
                           .AllowAnyMethod()
                           .AllowAnyHeader();
                });
        });

        // 3. Add our custom global exception handler
        services.AddExceptionHandler<GlobalExceptionHandler>();
        services.AddProblemDetails();
        return services;
    }
}