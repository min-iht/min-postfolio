@echo off
rem =====================================================
rem  Portfolio one-click updater (launcher)
rem  Double-click this file. The actual logic (Korean
rem  messages, add -> commit -> push) is in update_site.ps1.
rem  This file must stay ASCII-only: cmd cannot parse
rem  Korean UTF-8 batch files reliably.
rem =====================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0update_site.ps1" %*
