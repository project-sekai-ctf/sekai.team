---
title: Insomni'hack teaser 2022 – Personal Repository New Generation
date: '2022-01-30'
draft: false
authors: ['blueset']
tags: ["Insomni'hack teaser 2022", 'Crypto', 'Web', 'PHP']
summary: 'I really hate to guess paths.'
---
## Personal Repository New Generation
> by cla
>
> This application is supposedly a safe place to store sensitive data. Well, let's check that and see if we can hijack the administrator's account.
>
> http://repository.insomnihack.ch

The website is a simple authentication page, with a login form, a password recovery form, an password reset form, and a sign up form. Sign up is turned off.

When submitting forms, 2 cookies are set: `PHPSESSID` and `APPSESSID`.

Password reset form tells you whether a username exists, and through trial and error, we can find that `admin` is a valid user.

Again through path guessing, `http://repository.insomnihack.ch/TODO` is found on the server with the following content:

```
Following the last security audit, some critical issues were identified in the application.
Here are the ones that need to be taken care of immediately:

- [x] Use prepared statements to prevent SQL injections
- [x] Escape user inputs to prevent XSS
- [x] Configure rate limit to prevent bruteforce attacks
- [ ] Make sure to delete ALL *.bak files
```

...which hinted to look for `.bak` files. Enumerating all known pages, we found that the password reset page has a `.bak` file.

Accessing http://repository.insomnihack.ch/passwordreset.php.bak, we can find the following content:

```php
<?php include_once('includes/commons_531cd8.php'); ?>
<?php include_once('includes/reset_e93ab5.php'); ?>

<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css">
    <link rel="stylesheet" href="css/style.css">
    <title>Password Reset</title>
    <!-- jQuery + Bootstrap JS -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js"></script>
</head>

<body>

    <?php include_once('header.php'); ?>

    <div class="App">
        <div class="vertical-center">
            <div class="inner-block">
                <form action="" method="post">
                    <h3>Password Reset</h3>

                    <?php echo $msgResult; ?>

                    <div class="form-group">
                        <label>Username</label>
                        <input type="text" class="form-control" name="username" id="username" autocomplete="off" autofocus />
                        <?php echo $usernameErr; ?>
                    </div>

                    <div class="form-group">
                        <label>Token</label>
                        <input type="text" class="form-control" name="token" id="token" autocomplete="off" />
                        <?php echo $tokenErr; ?>
                    </div>

                    <div class="form-group">
                        <label>New password</label>
                        <input type="password" class="form-control" name="password" id="password" autocomplete="off" />
                        <?php echo $passwordErr; ?>
                    </div>

                    <div class="form-group">
                        <label>Confirm new password</label>
                        <input type="password" class="form-control" name="password2" id="password2" autocomplete="off" />
                        <?php echo $password2Err; ?>
                    </div>

                    <button type="submit" name="reset" id="reset" class="btn btn-outline-primary btn-lg btn-block">Reset password</button>
                </form>
            </div>
        </div>
    </div>

</body>

</html>
```

Both PHP files mentioned in the header returns empty response when accessed. `/includes/reset_e93ab5.php.bak` does not exist on the server, but `/.includes/commons_531cd8.php.bak` reveals the following source code:

```php
<?php

/*
	BEGIN Database functions
*/
function getUserFromDatabase($dbh, $username) {
    $sql = "SELECT * FROM users WHERE username = :username";
    $sth = $dbh->prepare($sql);
    $sth->bindParam(':username', $username);
    $sth->execute();
    return $sth->fetchAll(PDO::FETCH_ASSOC);
}

function saveTokenToDatabase($dbh, $username, $token) {
    $sql = "UPDATE users SET token = :token WHERE username = :username";
    $sth = $dbh->prepare($sql);
    $sth->bindParam(':token', $token);
    $sth->bindParam(':username', $username);
    $sth->execute();
}

function saveNewUserToDatabase($dbh, $username, $email, $passwordHash, $token) {
    $data = [
        'username' => $username,
        'email' => $email,
        'password' => $passwordHash,
        'token' => $token
    ];
    $sql = "INSERT INTO users (username, email, password, token) VALUES (:username, :email, :password, :token)";
    $sth = $dbh->prepare($sql);
    $sth->execute($data);
}

function saveNewPasswordToDatabase($dbh, $username, $passwordHash) {
    $sql = "UPDATE users SET password = :password WHERE username = :username";
    $sth = $dbh->prepare($sql);
    $sth->bindParam(':username', $username);
    $sth->bindParam(':password', $passwordHash);
    $sth->execute();
}

function saveNewRepositoryEntryToDatabase($dbh, $userid, $entry) {
    $sql = "INSERT INTO repository (userid, data) VALUES (:userid, :data)";
    $sth = $dbh->prepare($sql);
    $sth->bindParam(':userid', $userid);
    $sth->bindParam(':data', $entry);
    $sth->execute();
}

function getUserRepositoryEntriesFromDatabase($dbh, $userid) {
    $sql = "SELECT * FROM repository WHERE userid = :userid";
    $sth = $dbh->prepare($sql);
    $sth->bindParam(':userid', $userid);
    $sth->execute();
    return $sth->fetchAll(PDO::FETCH_ASSOC);
}
/*
	END Database functions
*/

/*
	BEGIN Util functions
*/
function generatePasswordHash($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

function getMaxInt() {
    return pow(2, 24);
}

function getMaxIteration() {
    $max = getMaxInt();
    mt_srand(time(), MT_RAND_PHP);
    $nb1 = mt_rand() % $max;
    $nb2 = mt_rand() % $max;
    return max($nb1, $nb2);
}

function getSeed() {
    $max = getMaxInt();
    return random_int(0, $max);
}

function initializeSessionCrypto() {
    $nb_iter = getMaxIteration();
    $seed = getSeed();
    $_SESSION['nb_iter'] = $nb_iter;
    $_SESSION['seed'] = $seed;
}

function generateRandomValues($seed, $iter) {
    mt_srand($seed, MT_RAND_PHP);
    $rand_values = array();
    for ($i = 0; $i < $iter; $i++) {
        $rand = mt_rand();
        if ($i >= $iter - 3) {
            array_push($rand_values, $rand);
        }
    }
    return $rand_values;
}

function generatePasswordResetToken($seed, $iter) {
    $rand_values = generateRandomValues($seed, $iter);
    $concat = implode("", $rand_values);
    return sha1($concat);
}

function generateSessionToken($seed, $iter) {
    $rand_values = generateRandomValues($seed, 3);
    $concat = implode("", $rand_values);
    return md5($concat);
}
/*
	END Util functions
*/
?>
```

Reading the source code, we can infer that `generateSessionToken()` is used to set the value of cookie `APPSESSID`. `initializeSessionCrypto()` sets the iteration count based on the time of session genration and the seed randomly between 0 and 16777216.

Using the `APPSESSID` value, we can brute force the seed value by iterating through all possible values.

```php
for ($i = 0; $i < 16777216; $i++) {
    if (generateSessionToken($i, 3) === $AppSessId){
        echo "Found seed: " . $i . "\n";
        break;
    }
}
```

When starting a new PHP session, the HTTP response would come with a `Date` header that shows the server time. Using this clue, and the seed found through brute force, we can calculate the value of `$_SESSION['nb_iter']` using `getMaxIteration()` (replacing `time()` with the server timestamp), and thus calculate `generatePasswordResetToken($_SESSION['seed'], $_SESSION['nb_iter'])`.

```php
function getMaxIterationBySeed($seed) {
    $max = getMaxInt();
    mt_srand($seed, MT_RAND_PHP);
    $nb1 = mt_rand() % $max;
    $nb2 = mt_rand() % $max;
    return max($nb1, $nb2);
}

echo generatePasswordResetToken($seed, getMaxIterationBySeed($timestamp));
```

With the generated password reset token, we can create a password recovery request, and use the token we calculated to reset the password of `admin`.

After the password is reset, we can login with the new password. Once logged in, the flag can be found on the page.

---

**Trivia**: the title _Personal Repository New Generation_ is likely a word play of _Pseudo Random Number Generator_.