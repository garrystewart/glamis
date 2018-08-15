# script to run remotely to trigger installation process
Invoke-WebRequest https://raw.githubusercontent.com/garrystewart/glamis/master/bin/ps/setup.ps1 -UseBasicParsing -OutFile "setup.ps1"
.\setup.ps1