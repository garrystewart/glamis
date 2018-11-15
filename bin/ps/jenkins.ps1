Invoke-WebRequest https://chocolatey.org/install.ps1 -UseBasicParsing -OutFile "install.ps1"
.\install.ps1
choco install Jenkins -y
Get-Content "C:\Program Files (x86)\jenkins\secrets\initialAdminPassword"