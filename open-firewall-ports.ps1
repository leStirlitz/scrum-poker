# Run this once (as Administrator) on the machine hosting the servers.
# Opens ports 8080 (HTTP file server) and 9000 (PeerJS signaling) for inbound connections
# so VPN colleagues can reach your servers.

New-NetFirewallRule -DisplayName "Scrum Poker HTTP (8080)"   -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow -Profile Any -ErrorAction SilentlyContinue
New-NetFirewallRule -DisplayName "Scrum Poker PeerJS (9000)" -Direction Inbound -Protocol TCP -LocalPort 9000 -Action Allow -Profile Any -ErrorAction SilentlyContinue

Write-Host "Firewall rules added for ports 8080 and 9000."
Write-Host ""
Write-Host "Your VPN IP addresses:"
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -ne '127.0.0.1' } | Select-Object InterfaceAlias, IPAddress | Format-Table -AutoSize
