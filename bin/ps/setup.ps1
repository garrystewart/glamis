#Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServer
#Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpErrors
#Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerManagementTools
#Enable-WindowsOptionalFeature -Online -FeatureName IIS-StaticContent
#Enable-WindowsOptionalFeature -Online -FeatureName IIS-DefaultDocument
#sc config WMSVC start= auto
#net start WMSVC
#Set-WebConfigurationProperty -Filter system.webServer/asp -Name enableParentPaths -Value true
#Set-WebConfigurationProperty -Filter system.webServer/asp -Name scriptErrorSentToBrowser -Value true