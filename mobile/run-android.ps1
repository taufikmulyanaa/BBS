# Wrapper for `flutter run`/`flutter build apk` on Windows.
#
# On this machine (and possibly others with the same AV/OneDrive-style filter
# on %TEMP%), the JDK's AF_UNIX-based loopback Pipe used by Gradle's daemon
# fails with "Unable to establish loopback connection" / "Invalid argument:
# connect" when java.io.tmpdir resolves to the real Windows user temp folder
# (C:\Users\<user>\AppData\Local\Temp). Pointing TEMP/TMP at a plain local
# folder outside AppData avoids it entirely — no JDK downgrade or system
# settings change needed. Scoped to this process only.
#
# Usage:
#   ./run-android.ps1                 # flutter run (attaches a device automatically)
#   ./run-android.ps1 build apk        # or any other flutter subcommand + args

$gradleTemp = Join-Path $PSScriptRoot ".tools\gradletemp"
New-Item -ItemType Directory -Force -Path $gradleTemp | Out-Null
$env:TEMP = $gradleTemp
$env:TMP = $gradleTemp

if ($args.Count -eq 0) {
    flutter run
} else {
    flutter @args
}
