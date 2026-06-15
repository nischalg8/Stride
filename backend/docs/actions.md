
### 12-June-26-Format
1. The format of decisions and actions is 
         
         DD-Month-YY-App-Title
         App Refers to the Django App and description is below the title.

### 12-June-26-Django Backend Setup and Postgresql Connection

1. Setup Django Backend by starting a project.
2. Postgresql connection 

        `CREATE DATABASE stride;
        CREATE USER stride_user WITH PASSWORD db_pw;
        GRANT ALL PRIVILEGES ON DATABASE stride TO stride_user;

        ALTER DATABASE stride OWNER TO stride_user;

        psql -U stride_user -d stride -h localhost `

3. Created a github repository and pushed the folder structure.

### 15-June-26-Accounts-Setup Accounts App

 1. Setup JWT login and stored both refresh and access token as http-only cookie.
 2. Defined Login,SignUp and Logout View for creating and loggin in.
 3. Defined custom authentication class as login mechanism is also custom by setting tokens as http only cookies.
 