import prisma from "../../pages/api/prisma_client"
import dotenv from "dotenv"

dotenv.config()

// Get the email and name from the .env file
const name = process.env.ADMIN_NAME;
const email = process.env.ADMIN_EMAIL;

if (email && name) {
  try {
    console.log(`Adding admin ${name} with email ${email}`);
    prisma.user.create({
      data: {
        email: email,
        name: name,
        role: "admin"
      }
    }).then(() => {
      console.log("Admin added successfully");
    });
  } catch (e) {
    console.log(e)
  }
} else {
  console.log("Please fill in the admin email and name in the .env file");
}