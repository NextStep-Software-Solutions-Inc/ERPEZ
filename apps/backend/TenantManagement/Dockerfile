# Use the official .NET 10.0 SDK image to build the application
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj files and restore dependencies
COPY ["TenantManagement/TenantManagement.Api/TenantManagement.Api.csproj", "TenantManagement/TenantManagement.Api/"]
COPY ["TenantManagement/TenantManagement.Application/TenantManagement.Application.csproj", "TenantManagement/TenantManagement.Application/"]
COPY ["TenantManagement/TenantManagement.Domain/TenantManagement.Domain.csproj", "TenantManagement/TenantManagement.Domain/"]
COPY ["TenantManagement/TenantManagement.Infrastructure/TenantManagement.Infrastructure.csproj", "TenantManagement/TenantManagement.Infrastructure/"]
COPY ["Shared/Shared.csproj", "Shared/"]

RUN dotnet restore "TenantManagement/TenantManagement.Api/TenantManagement.Api.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/TenantManagement/TenantManagement.Api"
RUN dotnet build "TenantManagement.Api.csproj" -c Release -o /app/build

# Publish the application
RUN dotnet publish "TenantManagement.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Use the official ASP.NET Core runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Expose ports
EXPOSE 8080
EXPOSE 443

# Set the entry point
ENTRYPOINT ["dotnet", "TenantManagement.Api.dll"]