@echo off
title Retrocanopy Local Server
echo Starting Retrocanopy Local Server...
powershell -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
pause
