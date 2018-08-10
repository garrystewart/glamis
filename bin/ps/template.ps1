# static ip and dns
New-NetIPAddress –InterfaceAlias "Ethernet" –IPAddress "192.168.0.101" –PrefixLength 24 -DefaultGateway "192.168.0.1"
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses 1.1.1.1, 1.0.0.1

# rename computer
Rename-Computer -NewName "server" -Restart

# allow downloads from web
add-type @"
using System.Net;
using System.Security.Cryptography.X509Certificates;
public class TrustAllCertsPolicy : ICertificatePolicy {
    public bool CheckValidationResult(
        ServicePoint srvPoint, X509Certificate certificate,
        WebRequest request, int certificateProblem) {
            return true;
        }
 }
"@

# change adapter type from public to private - allows remote connections
[System.Net.ServicePointManager]::CertificatePolicy = New-Object TrustAllCertsPolicyGet-NetConnectionProfile | Set-NetConnectionProfile -NetworkCategory Private

# don't know if this is actually needed
Enable-PSRemoting –force