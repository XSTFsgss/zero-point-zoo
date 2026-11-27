$port = 8086
$prefix = "http://localhost:$port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "Zero-Point Zoo Server running at $prefix"

$baseDir = "C:\Users\菜不菜\Documents\GitHub\zero-point-zoo"

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $path = $request.Url.LocalPath.TrimStart('/')
    if ([string]::IsNullOrEmpty($path)) {
        $path = "index.html"
    }
    $path = $path.Replace('/', '\')
    $filePath = Join-Path $baseDir $path

    if (Test-Path $filePath -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
        $contentType = "text/plain"
        switch ($ext) {
            ".html" { $contentType = "text/html; charset=utf-8" }
            ".css"  { $contentType = "text/css; charset=utf-8" }
            ".js"   { $contentType = "application/javascript; charset=utf-8" }
            ".jpg"  { $contentType = "image/jpeg" }
            ".jpeg" { $contentType = "image/jpeg" }
            ".png"  { $contentType = "image/png" }
            ".svg"  { $contentType = "image/svg+xml" }
            ".json" { $contentType = "application/json" }
            ".mp4"  { $contentType = "video/mp4" }
            ".zip"  { $contentType = "application/zip" }
        }
        $response.ContentType = $contentType
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $response.ContentLength64 = $bytes.Length
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $response.StatusCode = 404
        $notFoundBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
        $response.OutputStream.Write($notFoundBytes, 0, $notFoundBytes.Length)
    }
    $response.OutputStream.Close()
}
