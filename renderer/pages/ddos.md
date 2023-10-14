
## Features And Methods

* Layer7
    * GET | GET Flood
    * POST | POST Flood
    * OVH | Bypass OVH
    * RHEX | Random HEX
    * STOMP | Bypass chk_captcha
    * STRESS | Send HTTP Packet With High Byte
    * DYN | A New Method With Random SubDomain
    * DOWNLOADER | A New Method of Reading data slowly
    * SLOW | Slowloris Old Method of DDoS
    * HEAD | https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/HEAD
    * NULL | Null UserAgent and ...
    * COOKIE | Random Cookie PHP 'if (isset($_COOKIE))'
    * PPS | Only 'GET / HTTP/1.1\r\n\r\n'
    * EVEN | GET Method with more header
    * GSB | Google Project Shield Bypass
    * DGB | DDoS Guard Bypass
    * AVB | Arvan Cloud Bypass
    * BOT | Like Google bot
    * APACHE | Apache Expliot
    * XMLRPC | WP XMLRPC expliot (add /xmlrpc.php)
    * CFB | CloudFlare Bypass
    * CFBUAM | CloudFlare Under Attack Mode Bypass
    * BYPASS | Bypass Normal AntiDDoS
    * BOMB | Bypass with codesenberg/bombardier
    * KILLER | run many threads to kill a target
    * TOR | Bypass onion website


* Layer4
    * TCP | TCP Flood Bypass
    * UDP | UDP Flood Bypass
    * SYN | SYN Flood
    * CPS | Open and close connections with proxy
    * ICMP | Icmp echo request flood (Layer3)
    * CONNECTION | Open connection alive with proxy
    * VSE | Send Valve Source Engine Protocol
    * TS3 | Send Teamspeak 3 Status Ping Protocol
    * FIVEM | Send Fivem Status Ping Protocol
    * MEM | Memcached Amplification
    * NTP | NTP Amplification
    * MCBOT | Minecraft Bot Attack
    * MINECRAFT | Minecraft Status Ping Protocol
    * MCPE | Minecraft PE Status Ping Protocol
    * DNS | DNS Amplification
    * CHAR | Chargen Amplification
    * CLDAP | Cldap Amplification
    * ARD | Apple Remote Desktop Amplification
    * RDP | Remote Desktop Protocol Amplification


* Tools - Run With `python3 start.py tools`
    * CFIP | Find Real IP Address Of Websites Powered By Cloudflare
    * DNS | Show DNS Records Of Sites
    * TSSRV | TeamSpeak SRV Resolver
    * PING | PING Servers
    * CHECK | Check If Websites Status
    * DSTAT | That Shows Bytes Received, bytes Sent and their amount

* Other
    * STOP | STOP All Attacks
    * TOOLS | Console Tools
    * HELP | Show Usage Script


## Parameters

Layer7:

> python3 start.py \<1=method> \<2=url> \<3=socks\_type> \<4=threads> \<5=proxylist> \<6=rpc> \<7=duration> \<8=debug=optional>

*   1: Method (type of attack)
*   2: Target URL or IP Address
*   3: Proxy Version ([Proxy Usage])
*   4: Proxy File ([Proxy File Format])
*   5: Number of threads to use ([Multi Threading])
*   6: RPC (Requests pre connection)
*   7: Duration (Time to finish attack in seconds)
*   8: Debug Mode (Optional)

Layer4 Normal:

> python3 start.py \<1=method> \<2=ip:port> \<3=threads> \<4=duration> \<5=debug=optional>

*   1: Method (type of attack)
*   2: Target URL or IP Address
*   3: Number of threads to use ([Multi Threading])
*   4: Duration (Time to finish attack in seconds)
*   5: Debug Mode (Optional - [What is debug mode])

Layer4 Proxied:

> python3 start.py \<1=method> \<2=ip:port> \<3=threads> \<4=duration> \<5=socks\_type> \<6=proxylist> \<7=debug=optional>

*   1: Method (type of attack)
*   2: Target URL or IP Address
*   3: Number of threads to use ([Multi Threading])
*   4: Duration (Time to finish attack in seconds)
*   5: Proxy Version ([Proxy Usage])
*   6: Proxy File ([Proxy File Format])
*   7: Debug Mode (Optional)

Layer4 Amplification:

> python3 MHDDoS/start.py \<1=method> \<2=ip:port> \<3=threads> \<4=duration> \<5=refelector file> \<6=debug=optional>

*   1: Method (type of attack)
*   2: Target URL or IP Address
*   3: Number of threads to use ([Multi Threading])
*   4: Duration (Time to finish attack in seconds)
*   5: Reflectors File ([Reflectors File])
*   6: Debug Mode (Optional)
