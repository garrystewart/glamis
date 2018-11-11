Invoke-WebRequest http://mirrors.jenkins-ci.org/windows-stable/jenkins-2.138.2.zip -UseBasicParsing -OutFile "jenkins.zip"
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory(".\jenkins.zip", "\jenkins")