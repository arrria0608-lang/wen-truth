param(
  [int]$Port = 4173
)

$siteRoot = [System.IO.Path]::GetFullPath($PSScriptRoot)
$server = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
$server.Start()
Write-Host "Traditional calendar culture MVP: http://127.0.0.1:$Port/"
Write-Host 'Press Ctrl+C to stop.'

$mimeTypes = @{
  '.html' = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.png'  = 'image/png'
  '.svg'  = 'image/svg+xml'
  '.ico'  = 'image/x-icon'
}

try {
  while ($true) {
    $client = $server.AcceptTcpClient()
    $client.ReceiveTimeout = 1200
    $client.SendTimeout = 3000
    try {
      $stream = $client.GetStream()
      $stream.ReadTimeout = 1200
      $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
      $requestLine = $reader.ReadLine()
      if ([string]::IsNullOrWhiteSpace($requestLine)) { continue }
      while (($headerLine = $reader.ReadLine()) -ne '') {
        if ($null -eq $headerLine) { break }
      }

      $method = ''
      $target = '/'
      if ($requestLine -match '^(GET|HEAD)\s+([^\s]+)\s+HTTP/') {
        $method = $Matches[1]
        $target = $Matches[2]
      }

      $requestUri = [Uri]::new("http://127.0.0.1$target")
      $requestPath = [Uri]::UnescapeDataString($requestUri.AbsolutePath.TrimStart('/'))
      if ([string]::IsNullOrWhiteSpace($requestPath)) { $requestPath = 'index.html' }
      $candidate = [System.IO.Path]::GetFullPath((Join-Path $siteRoot $requestPath))
      $status = '200 OK'

      if ($method -notin @('GET', 'HEAD') -or -not $candidate.StartsWith($siteRoot, [System.StringComparison]::OrdinalIgnoreCase) -or -not [System.IO.File]::Exists($candidate)) {
        $status = '404 Not Found'
        $payload = [System.Text.Encoding]::UTF8.GetBytes('Not found')
        $contentType = 'text/plain; charset=utf-8'
      } else {
        $extension = [System.IO.Path]::GetExtension($candidate).ToLowerInvariant()
        $contentType = if ($mimeTypes.ContainsKey($extension)) { $mimeTypes[$extension] } else { 'application/octet-stream' }
        $payload = [System.IO.File]::ReadAllBytes($candidate)
      }

      $headers = "HTTP/1.1 $status`r`nContent-Type: $contentType`r`nContent-Length: $($payload.Length)`r`nConnection: close`r`nCache-Control: no-store`r`n`r`n"
      $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headers)
      $stream.Write($headerBytes, 0, $headerBytes.Length)
      if ($method -ne 'HEAD') { $stream.Write($payload, 0, $payload.Length) }
      $stream.Flush()
    } catch [System.IO.IOException] {
      Write-Verbose 'Closed an idle or interrupted browser connection.'
    } catch {
      Write-Warning $_.Exception.Message
    } finally {
      $client.Close()
    }
  }
} finally {
  $server.Stop()
}
