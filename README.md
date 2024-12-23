Backend of the private tutor index

## Project Setup
1. Install node
2. Install npm
3. Run ```npm install```
4. Run ```npx serverless offline```


## Testing APIs Locally

To test your APIs locally with serverless, you can use the serverless-offline plugin. Here are the steps to set it up:

1. Install the serverless-offline plugin:
   ```bash
   npm install serverless-offline --save-dev
   ```

2. Start your server locally using the serverless-offline command:  
   ```bash
   npx serverless offline
   ```
3. Test your endpoints using Postman or cURL as previously described, but use the URL http://localhost:3000 (or the port specified in your serverless.yml file).  
   
This will allow you to run and test your serverless application locally.
