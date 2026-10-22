$ErrorActionPreference = 'Stop'

# Builds the Astro site and publishes it to ../docs (served by GitHub Pages).
Push-Location $PSScriptRoot
try {
    npm run build
    if ($LASTEXITCODE -ne 0) { throw 'Build failed' }

    $docs = Join-Path $PSScriptRoot '../docs'
    if (Test-Path $docs) { Get-ChildItem $docs -Force | Remove-Item -Recurse -Force }
    else { New-Item -ItemType Directory $docs | Out-Null }

    Get-ChildItem (Join-Path $PSScriptRoot 'dist') -Force | Copy-Item -Destination $docs -Recurse -Force

    # Keep the sitemap URL that existed before the Astro migration.
    Copy-Item (Join-Path $docs 'sitemap-index.xml') (Join-Path $docs 'sitemap.xml') -Force
}
finally {
    Pop-Location
}
