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