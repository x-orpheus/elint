@echo off
if not x%npm_package_name:elint-preset-=%==x%npm_package_name% node.exe "%~dp0\postinstall"
