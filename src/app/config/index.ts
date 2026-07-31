import dotenv from 'dotenv';
import path from 'path';

// dotenv.config({ path: path.join((process.cwd(), '.env')) });
dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,

  // -------------
  
  NODE_ENV: process.env.NODE_ENV,
  default_password: process.env.DEFAULT_PASS,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  reset_pass_ui_link: process.env.RESET_PASS_UI_LINK,
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,

 

  khalti: {
    // Sandbox: https://dev.khalti.com/api/v2 | Production: https://khalti.com/api/v2
    khalti_base_url: process.env.KHALTI_BASE_URL,
    khalti_secret_key: process.env.KHALTI_SECRET_KEY,
    // Page on the frontend that the user is redirected to after payment
    khalti_return_url: process.env.KHALTI_RETURN_URL,
    khalti_website_url: process.env.KHALTI_WEBSITE_URL,
  },
};

