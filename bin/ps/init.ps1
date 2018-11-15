# script to run remotely to trigger installation process
Invoke-WebRequest https://raw.githubusercontent.com/garrystewart/glamis/master/bin/ps/all.ps1 -UseBasicParsing -OutFile "all.ps1"
.\all.ps1