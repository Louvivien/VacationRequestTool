


# Vacation Request tool

The Vacation Request Tool is designed to streamline the process of managing vacation requests within an organization. This tool allows employees to easily submit their vacation requests, while providing managers and HR personnel with an efficient way to track and manage these requests. T

There are 3 roles: admin, manager and user. Admin can see all vacation requests. Manager can see vacation requests of its employees. They both can validate the requests. Admin will receive an email each time a request is made by anyone. Manager will receive an email each time a request is made by its employees. 

There is a calendar where its possible to see the vacation requests


## Features

- Authentication using firebase 
- Notifications through firebase Cloud functions
- ChakraUI with Dark Mode


## Prerequisite

Node version 16

brew install node@16

export NODE_OPTIONS=--openssl-legacy-provider : this needs to be entered in the settings or the tool will not work make sure you have this


## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

_**Note**: Before running `npm start` do place the relevant environment variables in the `.env.local` file for firebase configuration._


