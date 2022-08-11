import formidable from 'formidable';
import fs from 'fs';
import { prisma } from '../../../../prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import middleware from '../middleware';
import { getToken } from 'next-auth/jwt';

const sanitize = require('sanitize-filename');
const secret = process.env.NEXTAUTH_SECRET;

export const config = {
  api: {
    bodyParser: false
  }
};

// POST /api/students/import
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (!(await middleware(await getToken({ req, secret }), ['admin', 'superadmin']))) {
    return res.status(403).end();
  }

  if (req.method === 'POST') {
    await post(req, res);
  } else {
    return res.status(405).end();
  }
}

const post = async (req: NextApiRequest, res: NextApiResponse) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async function (err, fields, files) {
    if (files.file) {
      console.log(files.file);
      const valid = await validateFile(files.file);

      if (!valid) {
        return res.status(400).json({ message: 'Datei ungültig' });
      }

      const success = await evaluateFile(files.file);

      if (success) {
        return res.status(200).end();
      } else {
        return res.status(500).end();
      }
    } else {
      return res.status(400).json({ message: 'Fehler bei der Übertragung' });
    }
  });
};

const validateFile: (file: any) => Promise<boolean> = async (file: any) => {
  // Before evaluating the file, we need to make sure that the file is valid
  const data = fs.readFileSync('/tmp/' + sanitize(file.newFilename));
  const lines = data.toString().split('\n');
  const headers = lines[0].split(',');
  // Check if the headers are correct
  return !(headers[0] !== 'Barcode' || headers[1] !== 'Name' || headers[2] !== 'Preis');
};

const evaluateFile: (file: any) => Promise<boolean> = async (file: any) => {
  try {
    const data = fs.readFileSync('/tmp/' + sanitize(file.newFilename));
    const lines = data.toString().split('\n');
    await prisma.product.deleteMany({});
    // Read the CSV and write every line as student to the database
    // This should be a bulk operation
    let batchQuery: any = {
      data: [],
      skipDuplicates: true
    };
    for (let i = 1; i < lines.length - 1; i++) {
      const line = lines[i];
      const values = line.split(',');
      const product = {
        barcode: values[0],
        name: values[1],
        price: parseFloat(values[2])
      };
      batchQuery.data.push(product);
    }
    await prisma.product.createMany(batchQuery);
    return true;
  } catch (e) {
    return false;
  }
};
