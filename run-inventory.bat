@echo off
REM Usage: run-inventory.bat [input.pptx] [output.json] --issues-only

if "%~1"=="" (
    echo Usage: run-inventory.bat [input.pptx] [output.json]
    exit /b 1
)

python "skills\pptx\scripts\inventory.py" %*
pause