# install iis
add-windowsfeature 	Web-Default-Doc, Web-Http-Errors, Web-Static-Content, Web-Stat-Compression, Web-ASP, Web-Includes, Web-Ftp-Service, Web-Mgmt-Service

# configure iis
Set-WebConfigurationProperty -Filter system.webServer/asp -Name enableParentPaths -Value true
Set-WebConfigurationProperty -Filter system.webServer/asp -Name scriptErrorSentToBrowser -Value true

# setup iis management service
Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\WebManagement\Server -Name EnableRemoteManagement -Value 1
Set-Service -name WMSVC -StartupType Automatic
Start-service WMSVC

# setup iis ftp publishing
New-WebBinding "Default Web Site" -Port 21 -Protocol ftp -IPAddress *
Set-ItemProperty "IIS:\Sites\Default Web Site" -Name ftpServer.security.authentication.basicAuthentication.enabled -Value $true
Set-ItemProperty "IIS:\Sites\Default Web Site" -Name ftpServer.security.ssl.controlChannelPolicy -Value 0 
Set-ItemProperty "IIS:\Sites\Default Web Site" -Name ftpServer.security.ssl.dataChannelPolicy -Value 0
Add-WebConfiguration "/system.ftpServer/security/authorization" -value @{accessType="Allow";users="Administrator";permissions="Read,Write"} -PSPath IIS:\ -location "Default Web Site"
Restart-Service FTPSVC

# give IUSR permissions to wwwroot
$path = 'C:\inetpub\wwwroot'
$acl = Get-Acl -Path $path
$permission = 'IUSR', 'Modify', 'ContainerInherit, ObjectInherit', 'None', 'Allow'
$rule = New-Object -TypeName System.Security.AccessControl.FileSystemAccessRule -ArgumentList $permission
$acl.SetAccessRule($rule)
$acl | Set-Acl -Path $path

Invoke-WebRequest https://chocolatey.org/install.ps1 -UseBasicParsing -OutFile "install.ps1"
.\install.ps1
choco install Jenkins -y