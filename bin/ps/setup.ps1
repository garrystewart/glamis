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
New-WebBinding "Default Web Site"-Port 21 -Protocol ftp -IPAddress *
Set-ItemProperty "IIS:\Sites\Default Web Site" -Name ftpServer.security.authentication.basicAuthentication.enabled -Value $true
Set-ItemProperty "IIS:\Sites\Default Web Site" -Name ftpServer.security.ssl.controlChannelPolicy -Value 0 
Set-ItemProperty "IIS:\Sites\Default Web Site" -Name ftpServer.security.ssl.dataChannelPolicy -Value 0