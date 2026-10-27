# Double-click safe launcher: activates the venv (if present) and starts the UI.
Set-Location $PSScriptRoot
if (Test-Path .\venv\Scripts\Activate.ps1) { . .\venv\Scripts\Activate.ps1 }
python server.py
