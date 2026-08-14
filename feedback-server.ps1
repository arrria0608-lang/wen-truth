param(
  [int]$Port = 4174,
  [string]$SiteRoot = $PSScriptRoot
)

$ErrorActionPreference = 'Stop'
$resolvedRoot = [System.IO.Path]::GetFullPath($SiteRoot)
$dataDirectory = Join-Path $resolvedRoot 'data'
$feedbackFile = Join-Path $dataDirectory 'feedback.jsonl'
New-Item -ItemType Directory -Force -Path $dataDirectory | Out-Null

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://127.0.0.1:$Port/")
$listener.Start()
Write-Output "Feedback site listening on http://127.0.0.1:$Port/"

function Send-Bytes($Context, [byte[]]$Bytes, [string]$ContentType, [int]$StatusCode = 200) {
  $Context.Response.StatusCode = $StatusCode
  $Context.Response.ContentType = $ContentType
  $Context.Response.ContentLength64 = $Bytes.Length
  $Context.Response.OutputStream.Write($Bytes, 0, $Bytes.Length)
  $Context.Response.OutputStream.Close()
}

function Send-Json($Context, $Value, [int]$StatusCode = 200) {
  $json = $Value | ConvertTo-Json -Depth 6 -Compress
  Send-Bytes $Context ([System.Text.Encoding]::UTF8.GetBytes($json)) 'application/json; charset=utf-8' $StatusCode
}

function Clean-Text([object]$Value, [int]$MaxLength) {
  $text = [string]$Value
  $text = $text.Trim()
  if ($text.Length -gt $MaxLength) { $text = $text.Substring(0, $MaxLength) }
  return $text
}

while ($listener.IsListening) {
  $context = $listener.GetContext()
  try {
    $path = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath)
    if ($path -eq '/api/feedback' -and $context.Request.HttpMethod -eq 'GET') {
      $items = @()
      if (Test-Path $feedbackFile) {
        $items = @(Get-Content -Encoding UTF8 $feedbackFile | Where-Object { $_.Trim() } | ForEach-Object { $_ | ConvertFrom-Json })
      }
      [array]::Reverse($items)
      Send-Json $context @{ items = @($items | Select-Object -First 30) }
      continue
    }

    if ($path -eq '/api/feedback' -and $context.Request.HttpMethod -eq 'POST') {
      $reader = [System.IO.StreamReader]::new($context.Request.InputStream, $context.Request.ContentEncoding)
      $body = $reader.ReadToEnd()
      $reader.Dispose()
      $payload = $body | ConvertFrom-Json
      $message = Clean-Text $payload.message 300
      if (-not $message) { Send-Json $context @{ error = 'message_required' } 400; continue }
      $name = Clean-Text $payload.name 20
      if (-not $name) { $name = '試用者' }
      $item = [ordered]@{ id = [Guid]::NewGuid().ToString('N'); name = $name; message = $message; createdAt = [DateTime]::UtcNow.ToString('o') }
      ($item | ConvertTo-Json -Compress) | Add-Content -Encoding UTF8 $feedbackFile
      Send-Json $context @{ ok = $true; item = $item } 201
      continue
    }

    $relativePath = if ($path -eq '/') { 'index.html' } else { $path.TrimStart('/') }
    $filePath = [System.IO.Path]::GetFullPath((Join-Path $resolvedRoot $relativePath))
    if (-not $filePath.StartsWith($resolvedRoot, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $filePath -PathType Leaf)) {
      Send-Bytes $context ([System.Text.Encoding]::UTF8.GetBytes('Not found')) 'text/plain; charset=utf-8' 404
      continue
    }
    $extension = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
    $contentType = switch ($extension) {
      '.html' { 'text/html; charset=utf-8' }
      '.js' { 'text/javascript; charset=utf-8' }
      '.css' { 'text/css; charset=utf-8' }
      '.png' { 'image/png' }
      '.jpg' { 'image/jpeg' }
      '.jpeg' { 'image/jpeg' }
      '.svg' { 'image/svg+xml' }
      default { 'application/octet-stream' }
    }
    Send-Bytes $context ([System.IO.File]::ReadAllBytes($filePath)) $contentType
  } catch {
    try { Send-Json $context @{ error = 'server_error' } 500 } catch { }
  }
}
