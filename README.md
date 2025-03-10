Backend of the private tutor index

## Project Setup
1. Install node
2. Install npm
3. Run ```npm install```
4. Run ```npx run server```


## Testing APIs Locally

To test your APIs locally with serverless, you can use the serverless-offline plugin. Here are the steps to set it up:

1. Install the serverless-offline plugin:
   ```bash
   npm install serverless-offline --save-dev
   ```

2. create .env file and configure the folling AWS credentials
```
accessKeyId=KEY
secretAccessKey=KEY
region=us-east-1
endpoint=https://587611035364.ddb.us-east-1.amazonaws.com
```
3. Start your server locally using the serverless-offline command:  
   ```bash
   npx serverless offline --noPrependStageInUrl
   ```
3. Test your endpoints using Postman or cURL as previously described, but use the URL http://localhost:3000 (or the port specified in your serverless.yml file).  
   
This will allow you to run and test your serverless application locally.


## to test the code
```
   npm install --save-dev mocha
   npm install --save-dev chai
   npm install --save-dev sinon
   npm test
```

## to check the coverage
```
   npm run coverage  
```
The results will be in html format stored a directory called coverage. Open index.html in a browser to see the results.