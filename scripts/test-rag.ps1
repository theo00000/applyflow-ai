$cases = @(
    @{
        Name = "Known requirement"
        Question = "Berapa IPK minimum Beasiswa Teknologi?"
        ExpectedGuard = "in_scope"
        ExpectedEnough = $true
        ExpectedSources = 1
    },
    @{
        Name = "Missing information"
        Question = "Apakah mahasiswa semester 5 boleh mendaftar?"
        ExpectedGuard = "in_scope"
        ExpectedEnough = $false
        ExpectedSources = 1
    },
    @{
        Name = "Unknown scholarship"
        Question = "Apa syarat Beasiswa Oxford?"
        ExpectedGuard = "opportunity_not_found"
        ExpectedEnough = $false
        ExpectedSources = 0
    },
    @{
        Name = "Out of domain"
        Question = "Bagaimana cara memasak nasi goreng?"
        ExpectedGuard = "out_of_scope"
        ExpectedEnough = $false
        ExpectedSources = 0
    }
)

$results = foreach ($case in $cases) {
    try {
        $body = @{
            question = $case.Question
        } | ConvertTo-Json

        $response = Invoke-RestMethod `
            -Uri "http://localhost:3000/api/ask-semantic" `
            -Method POST `
            -ContentType "application/json" `
            -Body $body

        $actualSources = @($response.sources).Count

        $guardPassed = (
            $response.metrics.guardResult -eq
            $case.ExpectedGuard
        )

        $enoughPassed = (
            $response.hasEnoughInformation -eq
            $case.ExpectedEnough
        )

        $sourcesPassed = (
            $actualSources -eq
            $case.ExpectedSources
        )

        [PSCustomObject]@{
            Test = $case.Name
            Guard = $guardPassed
            Sufficiency = $enoughPassed
            Sources = $sourcesPassed
            Passed = (
                $guardPassed -and
                $enoughPassed -and
                $sourcesPassed
            )
            LatencyMs = $response.metrics.totalMs
        }
    }
    catch {
        [PSCustomObject]@{
            Test = $case.Name
            Guard = $false
            Sufficiency = $false
            Sources = $false
            Passed = $false
            LatencyMs = 0
        }
    }
}

$results | Format-Table -AutoSize

$passed = @($results | Where-Object Passed).Count
$total = @($results).Count

Write-Host "Passed: $passed / $total"

if ($passed -ne $total) {
    exit 1
}
