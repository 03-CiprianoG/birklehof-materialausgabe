import { prisma } from '../../prisma';

// Get the email and name from the .env.local file
const name = process.env.ADMIN_NAME;
const email = process.env.ADMIN_EMAIL;

if (email && name) {
  try {
    console.log(`Adding admin ${name} with email ${email}`);
    prisma.user
      .create({
        data: {
          email: email,
          name: name,
          role: 'superadmin'
        }
      })
      .then(() => {
        console.log('Admin added successfully');
      });
  } catch (e) {
    console.log('Unknown error occured');
  }
} else {
  console.log('Please fill in the admin email and name in the .env.local file');
}
