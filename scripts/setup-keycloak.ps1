<#
.SYNOPSIS
    Automated Keycloak Setup for ERPEZ
.DESCRIPTION
    Authenticates with Keycloak master realm using admin credentials,
    creates the 'erpez' realm, provisions the 'web-client' public client
    with proper redirect URIs and web origins, and optionally creates a test user.
.PARAMETER KeycloakUrl
    Base URL of the Keycloak server. Default: https://keycloak.dev.nextstep-software.com
.PARAMETER AdminUsername
    Master realm administrator username.
.PARAMETER AdminPassword
    Master realm administrator password.
.PARAMETER UserEmail
    Optional email for the initial user. Default: admin@erpez.dev
.PARAMETER UserPassword
    Optional password for the initial user. If not supplied, an ephemeral secure random password is generated.
#>
param(
    [string]$KeycloakUrl = "https://keycloak.dev.nextstep-software.com",
    [Parameter(Mandatory=$true)]
    [string]$AdminUsername,
    [Parameter(Mandatory=$true)]
    [string]$AdminPassword,
    [string]$UserEmail = "admin@erpez.dev",
    [string]$UserPassword
)

if ([string]::IsNullOrWhiteSpace($UserPassword)) {
    $UserPassword = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 16 | ForEach-Object { [char]$_ })
}

$ErrorActionPreference = "Stop"

$BaseUrl = $KeycloakUrl.TrimEnd('/')

Write-Host "Connecting to Keycloak at $BaseUrl..." -ForegroundColor Cyan

# 1. Acquire Admin Access Token
$tokenUrl = "$BaseUrl/realms/master/protocol/openid-connect/token"
$tokenBody = @{
    client_id  = "admin-cli"
    username   = $AdminUsername
    password   = $AdminPassword
    grant_type = "password"
}

try {
    $tokenResponse = Invoke-RestMethod -Uri $tokenUrl -Method Post -Body $tokenBody -ContentType "application/x-www-form-urlencoded"
    $adminToken = $tokenResponse.access_token
    Write-Host "[OK] Master Admin authenticated successfully." -ForegroundColor Green
} catch {
    Write-Error "Failed to authenticate with Keycloak master realm: $_"
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type"  = "application/json"
}

# 2. Check if 'erpez' Realm Exists; if not, create it
$realmUrl = "$BaseUrl/admin/realms/erpez"
$realmExists = $false

try {
    $existing = Invoke-RestMethod -Uri $realmUrl -Method Get -Headers $headers -ErrorAction SilentlyContinue
    if ($existing -and $existing.realm -eq "erpez") {
        $realmExists = $true
        Write-Host "[INFO] Realm 'erpez' already exists." -ForegroundColor Yellow
    }
} catch {
    $realmExists = $false
}

if (-not $realmExists) {
    Write-Host "Creating 'erpez' realm..." -ForegroundColor Cyan
    $createRealmUrl = "$BaseUrl/admin/realms"
    $realmPayload = @{
        realm                = "erpez"
        enabled              = $true
        displayName          = "ERPEZ"
        registrationAllowed  = $true
        resetPasswordAllowed = $true
        rememberMe           = $true
    } | ConvertTo-Json

    Invoke-RestMethod -Uri $createRealmUrl -Method Post -Headers $headers -Body $realmPayload
    Write-Host "[OK] Realm 'erpez' created successfully with user registration enabled." -ForegroundColor Green
} else {
    Write-Host "Ensuring user registration is enabled on 'erpez' realm..." -ForegroundColor Cyan
    $realmUpdatePayload = @{
        registrationAllowed  = $true
        resetPasswordAllowed = $true
        rememberMe           = $true
    } | ConvertTo-Json
    Invoke-RestMethod -Uri $realmUrl -Method Put -Headers $headers -Body $realmUpdatePayload
    Write-Host "[OK] Realm 'erpez' updated with user registration enabled." -ForegroundColor Green
}

# 3. Create or Update 'web-client' Client
$clientsUrl = "$BaseUrl/admin/realms/erpez/clients"
$clients = Invoke-RestMethod -Uri $clientsUrl -Method Get -Headers $headers
$webClient = $clients | Where-Object { $_.clientId -eq "web-client" }

$clientPayload = @{
    clientId                  = "web-client"
    name                      = "ERPEZ Web Client"
    enabled                   = $true
    publicClient              = $true
    standardFlowEnabled       = $true
    directAccessGrantsEnabled = $true
    rootUrl                   = "http://localhost:3000"
    baseUrl                   = "http://localhost:3000"
    redirectUris              = @(
        "http://localhost:3000/*",
        "http://localhost:5173/*",
        "http://localhost:5174/*"
    )
    webOrigins                = @(
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "+"
    )
} | ConvertTo-Json

if ($webClient) {
    Write-Host "Updating existing 'web-client' client configuration..." -ForegroundColor Cyan
    $updateClientUrl = "$BaseUrl/admin/realms/erpez/clients/$($webClient.id)"
    Invoke-RestMethod -Uri $updateClientUrl -Method Put -Headers $headers -Body $clientPayload
    Write-Host "[OK] Client 'web-client' updated successfully." -ForegroundColor Green
} else {
    Write-Host "Creating 'web-client' client..." -ForegroundColor Cyan
    Invoke-RestMethod -Uri $clientsUrl -Method Post -Headers $headers -Body $clientPayload
    Write-Host "[OK] Client 'web-client' created successfully." -ForegroundColor Green
}

# 4. Create Initial User
$usersUrl = "$BaseUrl/admin/realms/erpez/users"
$users = Invoke-RestMethod -Uri "$usersUrl?username=$UserEmail" -Method Get -Headers $headers

if ($users -and $users.Count -gt 0) {
    Write-Host "[INFO] User '$UserEmail' already exists in realm 'erpez'." -ForegroundColor Yellow
} else {
    Write-Host "Creating initial user '$UserEmail'..." -ForegroundColor Cyan
    $userPayload = @{
        username      = $UserEmail
        email         = $UserEmail
        firstName     = "Admin"
        lastName      = "User"
        enabled       = $true
        emailVerified = $true
        credentials   = @(
            @{
                type      = "password"
                value     = $UserPassword
                temporary = $false
            }
        )
    } | ConvertTo-Json -Depth 5

    Invoke-RestMethod -Uri $usersUrl -Method Post -Headers $headers -Body $userPayload
    Write-Host "[OK] User '$UserEmail' created with password '$UserPassword'." -ForegroundColor Green
}

Write-Host "`n=== Setup Complete! ===" -ForegroundColor Green
Write-Host "Realm: erpez"
Write-Host "Client: web-client (Public PKCE)"
Write-Host "Test User: $UserEmail"
Write-Host "Test Password: $UserPassword"
Write-Host "Redirect URIs: http://localhost:5173/*, http://localhost:5174/*"
