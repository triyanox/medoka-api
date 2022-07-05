# Trentneuf Test

## Project Structure

- [Database schema with Prisma](/prisma/)
- [All the source files](/src/)
  - [Entry File](/src/index.ts)
  - [Models](/src/models/)
  - [Controllers](/src//controllers/)
  - [Routes](/src/routes)
  - [Utilites](/src/lib/)
  - [Configurations](/src/config/)
  - [Middleware](/src/middleware/)

# API Documentation

## Authentication

This endpoint takes the email and password and generates a jwt token and send it back as cookies to the user

```
POST /api/auth
```

## Logout

Clears the token cookie

```
POST /api/logout
```

## Register by email

Register a user and send a verification code to their email

```
POST /api/manager/register
```

## Verify the email

Accepts a verification code from 6 digits and after verification sends a token in a cookie to the user to complete the setup

```
POST /api/manager/verify/:managerId
```

## Update a password

Updates the user password takes a string with a length between 8 and 256 letters

```
PUT /api/manager/password
```

## Update a manager info

Accepts 4 parameters: firstname, lastname, gender, and phone number
and updates the user info

```
PUT /api/manager/info
```

## Recover password

Accepts the email and sends a recovery url to the email

```
POST /api/manager/recover
```

## Set a new password

The url sent to email of the manager has a token the same token can be used as a param to update the manager password and recover the account.

```
PUT /api/recover/:token
```

## Add or update pharmacy informations

This endpoint accepts 4 or 3 params id, company name, serial number and registration date.
If the id is not provided creates a new pharmacy with all of the infos above .

```
PUT /api/pharmacy/info
```

## Add or update the adress

Accepts a string and updates the pharmacy adress

```
PUT /api/pharmacy/adress/:id
```

## Add or update the phone number

Accepts a number and updates the pharmacy phone number

```
PUT /api/pharmacy/phone/:id
```

# Environment Variables

This a [sample](/sample-env.txt) of the environment variables used in this project

- **DATABASE_URL** : can be any sql database I've used MySQL in my case
- **EMAIL_FROM** : the email sender
- **MAIL_USERNAME** : the email username
- **OAUTH_CLIENTID**, **OAUTH_CLIENT_SECRET** and **OAUTH_REFRESH_TOKEN** : used to authenticate with gmail using the 0Auth method because gmail dosn't suppot the **_Less secure_** featue anymore to send automated emails but those 3 env can be replace if we use another provider like outlook so we provide just the username and password, the **OAUTH_REFRESH_TOKEN** in production can be generated dynamically using the **googleapis SDK** for node .
- **JWT_SECRET** : used to sign and decode jwt tokens
- **FRONTEND_URL** : can be used to allow incoming requests fron a specific origin with cors or allow some headers

# Commands

- Developemnt

```
yarn dev
```

- Build

```
yarn build
```

- Production

```
yarn start
```
