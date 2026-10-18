@echo off
title Retrocanopy Local Server
echo Starting Retrocanopy Local Server at http://localhost:8080 ...
powershell -ExecutionPolicy Bypass -File "%~dp0serve.ps1" -Port 8080
pause
