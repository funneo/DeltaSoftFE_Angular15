param(
    [Parameter(Mandatory = $true)][string]$JsonPath,
    [Parameter(Mandatory = $true)][string]$OutPath
)

$ErrorActionPreference = "Stop"

$raw = Get-Content -Path $JsonPath -Raw -Encoding UTF8
$doc_ = $raw | ConvertFrom-Json

$word = New-Object -ComObject Word.Application
$word.Visible = $false

try {
    $document = $word.Documents.Add()
    $sel = $word.Selection

    function Set-HeadingStyle($level) {
        switch ($level) {
            1 { $sel.Style = "Heading 1" }
            2 { $sel.Style = "Heading 2" }
            3 { $sel.Style = "Heading 3" }
            default { $sel.Style = "Heading 4" }
        }
    }

    function Add-Table($block) {
        $cols = $block.columns
        $rows = $block.rows
        $nCols = $cols.Count
        $nRows = $rows.Count + 1

        $tblRange = $sel.Range
        $tbl = $document.Tables.Add($tblRange, $nRows, $nCols)
        $tbl.Borders.Enable = $true
        $tbl.Range.Font.Size = 10.5

        for ($c = 0; $c -lt $nCols; $c++) {
            $cell = $tbl.Cell(1, $c + 1)
            $cell.Range.Text = [string]$cols[$c]
            $cell.Range.Bold = 1
            $cell.Range.Shading.BackgroundPatternColor = 15987699
        }

        for ($r = 0; $r -lt $rows.Count; $r++) {
            $rowData = $rows[$r]
            for ($c = 0; $c -lt $nCols; $c++) {
                $cell = $tbl.Cell($r + 2, $c + 1)
                $val = $rowData[$c]
                if ($null -eq $val) { $val = "" }
                $cell.Range.Text = [string]$val
            }
        }

        # Column widths: explicit widthsCm wins; else even split across a 16cm body width.
        if ($block.PSObject.Properties.Name -contains "widthsCm" -and $block.widthsCm) {
            for ($c = 0; $c -lt $nCols; $c++) {
                $tbl.Columns.Item($c + 1).Width = $word.CentimetersToPoints([double]$block.widthsCm[$c])
            }
        }
        else {
            $each = 16.0 / $nCols
            for ($c = 0; $c -lt $nCols; $c++) {
                $tbl.Columns.Item($c + 1).Width = $word.CentimetersToPoints($each)
            }
        }

        # Move past the table so the next block doesn't land inside it.
        $sel.EndKey(6) | Out-Null
        $sel.TypeParagraph()
    }

    foreach ($block in $doc_.blocks) {
        switch ($block.type) {
            "heading" {
                Set-HeadingStyle([int]$block.level)
                $sel.Font.Italic = $false
                $sel.Font.Bold = $false
                $sel.TypeText($block.text)
                $sel.TypeParagraph()
            }
            "paragraph" {
                $sel.Style = "Normal"
                $isItalic = ($block.PSObject.Properties.Name -contains "italic") -and $block.italic
                $isBold = ($block.PSObject.Properties.Name -contains "bold") -and $block.bold
                $sel.Font.Italic = [bool]$isItalic
                $sel.Font.Bold = [bool]$isBold
                $sel.TypeText($block.text)
                $sel.Font.Italic = $false
                $sel.Font.Bold = $false
                $sel.TypeParagraph()
            }
            "bullets" {
                $sel.Style = "Normal"
                foreach ($item in $block.items) {
                    $sel.TypeText("-  " + $item)
                    $sel.TypeParagraph()
                }
            }
            "table" {
                Add-Table $block
            }
            "pagebreak" {
                $sel.InsertBreak(7) | Out-Null   # wdPageBreak = 7
            }
            default {
                Write-Warning "Unknown block type: $($block.type) - skipped"
            }
        }
    }

    try {
        $document.SaveAs([ref]$OutPath, [ref]16)  # 16 = wdFormatDocumentDefault (.docx)
    }
    catch {
        throw "Khong the luu file (co the dang mo trong Word): $OutPath . Chi tiet: $($_.Exception.Message)"
    }
    $document.Close()
    Write-Host "Saved: $OutPath"
}
finally {
    $word.Quit()
}
